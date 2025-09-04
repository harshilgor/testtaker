import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { Target, Clock, Trophy, CheckCircle, Star, X, Brain, Sparkles, Award, Calendar, TrendingUp } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { motion, AnimatePresence } from 'framer-motion';

type DbQuest = Tables<'user_quests'>;

interface Quest {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'daily' | 'weekly';
  target: number;
  progress: number;
  points: number;
  completed: boolean;
  expiresAt: Date;
  subject: string;
  accuracy: number;
}

interface QuestsModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  onQuestCompleted?: () => void;
}

// Helper: random pick N from array
const pickRandom = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

// Helper: get distinct attempted topics
const getAttemptedTopics = (attempts: any[]): Set<string> => {
  const s = new Set<string>();
  attempts.forEach(a => {
    const t = (a as any).topic || (a as any).subject || 'General';
    if (t) s.add(String(t));
  });
  return s;
};

// Fetch a pool of available skills/topics from question_bank (skill preferred, fallback domain/topic)
const fetchAllTopics = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('question_bank')
      .select('skill, domain, topic')
      .limit(1000);
    if (error || !data) return [];
    const topics = new Set<string>();
    data.forEach((row: any) => {
      const t = row.skill || row.topic || row.domain;
      if (t) topics.add(String(t));
    });
    return Array.from(topics);
  } catch {
    return [];
  }
};

const QuestsModal: React.FC<QuestsModalProps> = ({ open, onClose, userName, onQuestCompleted }) => {
  const { questionAttempts, quizResults, marathonSessions, loading } = useData();
  const [userQuests, setUserQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [claimingQuest, setClaimingQuest] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Analyze user's weak topics from performance data
  const weakTopicsAnalysis = useMemo(() => {
    if (!questionAttempts || !Array.isArray(questionAttempts) || questionAttempts.length === 0) {
      return [];
    }

    const topicStats: Record<string, { 
      correct: number; 
      total: number; 
      topic: string; 
      subject: string;
    }> = {};
    
    // Analyze question attempts
    questionAttempts.forEach(attempt => {
      const topic = (attempt as any).topic || 'General';
      const subject = (attempt as any).subject || (topic?.toLowerCase().includes('algebra') || topic?.toLowerCase().includes('equation') ? 'Math' : 'Reading and Writing');
      const key = `${subject}-${topic}`;
      
      if (!topicStats[key]) {
        topicStats[key] = { 
          correct: 0, 
          total: 0, 
          topic: topic,
          subject: subject,
        };
      }
      
      topicStats[key].total++;
      if ((attempt as any).is_correct) {
        topicStats[key].correct++;
      }
    });

    // Find topics with accuracy < 75% and at least 3 attempts
    const weakTopics = Object.values(topicStats)
      .filter(stat => stat.total >= 3 && (stat.correct / stat.total) < 0.75)
      .map(stat => ({
        topic: stat.topic,
        subject: stat.subject,
        accuracy: Math.round((stat.correct / stat.total) * 100),
        totalQuestions: stat.total,
        correctAnswers: stat.correct
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 8); // Get top 8 weakest areas

    return weakTopics;
  }, [questionAttempts]);

  // Load existing quests and generate new ones based on weak areas
  useEffect(() => {
    const loadQuests = async () => {
      if (loading) return;
      
      setQuestsLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const userId = user.user.id;

        // Clear old quests and generate new ones based on current weak areas
        await generateTargetedQuests(userId);
        await updateDailyQuestExpiration(userId); // Update daily quest expiration

        // Load the newly generated quests
        const { data: finalQuests, error: finalError } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_id', userId)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (finalError) {
          console.error('Error reloading quests:', finalError);
          return;
        }

        // Convert to Quest format with additional analysis data
        const formattedQuests: Quest[] = (finalQuests || []).map(dbQuest => {
          const weakArea = weakTopicsAnalysis.find(w => w.topic === (dbQuest as any).target_topic || w.topic === (dbQuest as any).topic);
          const title = (dbQuest as any).quest_title ?? (dbQuest as any).title ?? '';
          const description = (dbQuest as any).quest_description ?? (dbQuest as any).description ?? '';
          const topic = (dbQuest as any).target_topic ?? (dbQuest as any).topic ?? 'General';
          const target = (dbQuest as any).target_count ?? (dbQuest as any).target_value ?? 0;
          const progress = (dbQuest as any).current_progress ?? (dbQuest as any).progress ?? 0;
          const points = (dbQuest as any).points_reward ?? (dbQuest as any).points ?? 0;

          return {
            id: (dbQuest as any).id,
            title,
            description,
            topic,
            difficulty: ((dbQuest as any).difficulty as 'Easy' | 'Medium' | 'Hard') ?? 'Medium',
            type: ((dbQuest as any).quest_type as 'daily' | 'weekly') ?? 'daily',
            target,
            progress,
            points,
            completed: Boolean((dbQuest as any).completed),
            expiresAt: new Date((dbQuest as any).expires_at),
            subject: weakArea?.subject || 'General',
            accuracy: weakArea?.accuracy || 0
          };
        });

        setUserQuests(formattedQuests);
      } catch (error) {
        console.error('Error in loadQuests:', error);
      } finally {
        setQuestsLoading(false);
      }
    };

    loadQuests();
  }, [loading, questionAttempts, weakTopicsAnalysis]);

  // New: realtime progress sync – increments quest progress on every correct attempt
  useEffect(() => {
    let channel: any;
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;
      const userId = user.user.id;

      channel = supabase
        .channel('quests-progress-sync')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'question_attempts_v2',
          filter: `user_id=eq.${userId}`
        }, async (payload: any) => {
          try {
            const attempt = payload.new as any;
            if (!attempt?.is_correct) return; // only count correct answers toward quests
            const attemptTopic = String(attempt.topic || attempt.subject || '');
            if (!attemptTopic) return;

            // Find matching active quests locally
            const matching = userQuests.filter(q => !q.completed && q.expiresAt > new Date() && q.progress < q.target && q.topic.toLowerCase() === attemptTopic.toLowerCase());
            if (matching.length === 0) return;

            // Increment each matching quest by 1 (cap at target)
            for (const q of matching) {
              const newProgress = Math.min(q.target, q.progress + 1);
              await supabase.from('user_quests').update({ current_progress: newProgress }).eq('id', q.id);
            }

            // Optimistic local update
            setUserQuests(prev => prev.map(q => {
              const match = q.topic.toLowerCase() === attemptTopic.toLowerCase() && !q.completed && q.expiresAt > new Date();
              if (!match) return q;
              return { ...q, progress: Math.min(q.target, q.progress + 1) };
            }));
          } catch (e) {
            console.warn('Quest progress sync failed:', e);
          }
        })
        .subscribe();
    })();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [userQuests]);

  const generateTargetedQuests = async (userId: string) => {
    // Clear existing active quests
    await supabase
      .from('user_quests')
      .delete()
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString());

    const questsToCreate: any[] = [];
    
    // Determine user stage
    const attemptedTopics = getAttemptedTopics(questionAttempts || []);
    const hasAnyActivity = attemptedTopics.size > 0;
    const hasManyTopics = attemptedTopics.size >= 8;

    if (!hasAnyActivity) {
      // New user – random seed quests from a broad pool
      const allTopics = await fetchAllTopics();
      const seeds = pickRandom(allTopics, 8);
      const seedDefs = seeds.map((t, idx) => ({
        quest_title: `Practice ${t}`,
        target_topic: t,
        target_count: idx < 2 ? 10 : 8,
        difficulty: idx < 2 ? 'Easy' : 'Medium',
        points_reward: idx < 2 ? 15 : 12
      }));

      seedDefs.forEach((q, index) => {
        // First 5 are daily (expire 11:59 PM), others weekly (14 days)
        let expiresAt: string;
        if (index < 5) {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          expiresAt = today.toISOString();
        } else {
          expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        }
        const questId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `q_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        questsToCreate.push({
          user_id: userId,
          quest_id: questId,
          quest_title: q.quest_title,
          quest_description: `Goal: Answer ${q.target_count} ${q.target_topic} questions correctly\nPractice in Quiz, Marathon, or Mock Test`,
          target_topic: q.target_topic,
          difficulty: q.difficulty,
          quest_type: index < 5 ? 'daily' : 'weekly',
          target_count: q.target_count,
          current_progress: 0,
          points_reward: q.points_reward,
          completed: false,
          expires_at: expiresAt
        });
      });
    } else if (!hasManyTopics) {
      // Some activity – prioritize unattempted skills
      const allTopics = await fetchAllTopics();
      const unattempted = allTopics.filter(t => !attemptedTopics.has(t));
      const picks = pickRandom(unattempted, 7);
      picks.forEach((topic, index) => {
        const goal = index < 3 ? 8 : 6;
        const difficulty = 'Medium';
        let expiresAt: string;
        if (index < 5) {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          expiresAt = today.toISOString();
    } else {
          expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }
        const questId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `q_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        questsToCreate.push({
          user_id: userId,
          quest_id: questId,
          quest_title: `Explore ${topic}`,
          quest_description: `Goal: Answer ${goal} ${topic} questions correctly\nPractice in Quiz, Marathon, or Mock Test`,
          target_topic: topic,
          difficulty,
          quest_type: index < 5 ? 'daily' : 'weekly',
          target_count: goal,
          current_progress: 0,
          points_reward: 12,
          completed: false,
          expires_at: expiresAt
        });
      });
    } else {
      // Lots of activity – focus weakest accuracy areas (existing logic)
      weakTopicsAnalysis.slice(0, 7).forEach((weakArea, index) => {
        const isUrgent = weakArea.accuracy < 50;
        const target = isUrgent ? 10 : 8;
        const difficulty = isUrgent ? 'Hard' : 'Medium';
        const points = isUrgent ? 18 : 12;
        let expiresAt: string;
        if (index < 5) {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          expiresAt = today.toISOString();
        } else {
        const daysToComplete = isUrgent ? 3 : 7;
          expiresAt = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000).toISOString();
        }
        const questId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `q_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        questsToCreate.push({
          user_id: userId,
          quest_id: questId,
          quest_title: `Improve ${weakArea.topic}`,
          quest_description: `Goal: Answer ${target} ${weakArea.topic} questions correctly\nPractice in Quiz, Marathon, or Mock Test`,
          target_topic: weakArea.topic,
          difficulty,
          quest_type: index < 5 ? 'daily' : 'weekly',
          target_count: target,
          current_progress: 0,
          points_reward: points,
          completed: false,
          expires_at: expiresAt
        });
      });
    }

    // Ensure we don't exceed 12 quests total per user
    const existingQuests = await supabase
      .from('user_quests')
      .select('id')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString());

    const currentQuestCount = existingQuests.data?.length || 0;
    const maxQuests = 12;
    const questsToAdd = Math.min(questsToCreate.length, maxQuests - currentQuestCount);

    if (questsToAdd > 0) {
      const { error } = await supabase.from('user_quests').insert(questsToCreate.slice(0, questsToAdd));
      if (error) {
        console.error('Error creating targeted quests:', error);
      } else {
        console.log(`Created ${questsToAdd} quests for user (${currentQuestCount + questsToAdd}/${maxQuests} total)`);
      }
    } else if (currentQuestCount >= maxQuests) {
      console.log(`User already has maximum of ${maxQuests} quests`);
    }
  };

  // Function to update existing daily quests to correct expiration time
  const updateDailyQuestExpiration = async (userId: string) => {
    try {
      // Get all quests for the user that expire in more than 1 day
      const { data: allQuests, error } = await supabase
        .from('user_quests')
        .select('id, expires_at, quest_type, created_at')
        .eq('user_id', userId)
        .gte('expires_at', new Date().toISOString());

      if (error || !allQuests) return;

      // Update each daily quest to expire at 11:59 PM today
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const correctExpiration = today.toISOString();

      // Get the first 5 quests created today and ensure they expire at 11:59 PM
      const todayQuests = allQuests
        .filter(quest => {
          const questCreatedDate = new Date(quest.created_at);
          return questCreatedDate.toDateString() === today.toDateString();
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, 5);

      for (const quest of todayQuests) {
        if (quest.expires_at) {
          const currentExpiration = new Date(quest.expires_at);
          const oneDayFromNow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          
          if (currentExpiration > oneDayFromNow) {
            // Update to expire today at 11:59 PM and set quest type to daily
            await supabase
              .from('user_quests')
              .update({ 
                expires_at: correctExpiration,
                quest_type: 'daily'
              })
              .eq('id', quest.id);
            
            console.log(`Updated quest ${quest.id} to expire today at 11:59 PM`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating daily quest expiration:', error);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      setClaimingQuest(questId);
      const quest = userQuests.find(q => q.id === questId);
      if (!quest) return;

      // Update quest as completed and sync progress
      const { error: updateError } = await supabase
        .from('user_quests')
        .update({ completed: true, current_progress: quest.target })
        .eq('id', questId);

      if (updateError) {
        console.error('Error updating quest:', updateError);
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      const userId = user.user?.id as string;

      // Award points to user (uses p_points, p_user_id)
      const { error: pointsError } = await supabase.rpc('increment_user_points', {
        p_points: quest.points,
        p_user_id: userId
      });

      if (pointsError) {
        console.error('Error awarding points:', pointsError);
      }

      // Update local state
      setUserQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, completed: true, progress: quest.target } : q
      ));

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      onQuestCompleted?.();
    } catch (error) {
      console.error('Error completing quest:', error);
    } finally {
      setClaimingQuest(null);
    }
  };

  const activeQuests = userQuests.filter(q => !q.completed);
  const completedQuests = userQuests.filter(q => q.completed);
  const totalPointsAvailable = activeQuests.reduce((sum, q) => sum + q.points, 0);
  const totalPointsEarned = completedQuests.reduce((sum, q) => sum + q.points, 0);

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours}h remaining`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d remaining`;
    }
  };

  const getProgressPercentage = (progress: number, target: number) => {
    if (!target || target <= 0) return 0;
    const pct = (progress / target) * 100;
    return Number.isFinite(pct) ? Math.max(0, Math.min(pct, 100)) : 0;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  } as const;

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
    tap: { scale: 0.95 }
  };

  if (loading || questsLoading) {
    return (
      <>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
        )}
        
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: open ? 0 : "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-white shadow-2xl z-50"
        >
          <div className="h-full flex flex-col items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-b-2 border-yellow-600"
            />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-gray-600"
            >
              Loading your quests...
            </motion.p>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <TooltipProvider>
      <AnimatePresence>
      {open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: open ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-gradient-to-br from-gray-50 to-white shadow-2xl z-50 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Trophy className="h-5 w-5 text-yellow-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900">Your Quests</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-gray-700 border-gray-300 font-medium bg-gray-50">
                {activeQuests.length} quests
              </Badge>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600 font-medium bg-yellow-50">
                {totalPointsAvailable} pts available
              </Badge>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="rounded-full h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Removed Stats Overview */}

            {/* Active Quests */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {activeQuests.length === 0 ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">All Quests Completed!</h3>
                  <p className="text-gray-600 text-sm">Amazing work! New quests will be generated based on your latest performance.</p>
                </motion.div>
              ) : (
                <>
                  {/* Daily Quests - First 5 quests */}
                  {activeQuests.slice(0, 5).map((quest) => (
                    <motion.div
                      key={quest.id}
                      variants={cardVariants}
                      whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.06)" }}
                      className="group"
                    >
                      <Card className="relative border-2 border-orange-400 hover:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-4">
                          {/* Daily Quest Badge - moved to bottom right */}
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="outline" className="text-orange-600 border-orange-400 bg-orange-50 font-medium text-[8px] px-1 py-0.5">
                              DAILY
                            </Badge>
                          </div>

                          {/* Claim button top-right */}
                          {quest.progress >= quest.target && !quest.completed && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button
                                  variants={buttonVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                  onClick={() => handleCompleteQuest(quest.id)}
                                  aria-label="Claim reward"
                                  className="absolute top-3 right-3 bg-black hover:bg-neutral-800 text-white px-3 py-1.5 rounded-md font-medium text-xs shadow-md"
                                >
                                  Claim
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Claim your reward (+{quest.points} pts)</p>
                              </TooltipContent>
                            </Tooltip>
                          )}

                          <div className="flex items-start justify-between mb-2 pr-20">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">{quest.title}</h4>
                                <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 font-medium text-[10px] md:text-xs">
                                  +{quest.points} pts
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-700 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {quest.description}
                              </div>
                            </div>
                          </div>
                          
                          {/* Meta row (removed subject tag) */}
                          <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeRemaining(quest.expiresAt)}
                            </span>
                            <span className="font-medium">{quest.progress}/{quest.target}</span>
                          </div>
                          
                          {/* Progress bar (smaller) */}
                          <div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgressPercentage(quest.progress, quest.target)}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-2 rounded-full ${
                                quest.subject === 'Math' 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
                              }`}
                              />
                            </div>
                            {quest.progress < quest.target && (
                              <p className="text-[11px] text-gray-500 mt-1 text-center">
                                {Math.max(0, quest.target - quest.progress)} more correct answers needed
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {/* Regular Quests - Remaining quests */}
                  {activeQuests.slice(5).map((quest) => (
                  <motion.div
                    key={quest.id}
                    variants={cardVariants}
                    whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.06)" }}
                    className="group"
                  >
                    <Card className="relative border border-gray-200 hover:border-yellow-300 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        {/* Claim button top-right */}
                        {quest.progress >= quest.target && !quest.completed && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleCompleteQuest(quest.id)}
                                aria-label="Claim reward"
                                className="absolute top-3 right-3 bg-black hover:bg-neutral-800 text-white px-3 py-1.5 rounded-md font-medium text-xs shadow-md"
                              >
                                Claim
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Claim your reward (+{quest.points} pts)</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <div className="flex items-start justify-between mb-2 pr-20">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">{quest.title}</h4>
                              <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 font-medium text-[10px] md:text-xs">
                              +{quest.points} pts
                            </Badge>
                          </div>
                            <div className="text-xs text-gray-700 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {quest.description}
                            </div>
                          </div>
                          </div>
                          
                        {/* Meta row (removed subject tag) */}
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeRemaining(quest.expiresAt)}
                            </span>
                          <span className="font-medium">{quest.progress}/{quest.target}</span>
                        </div>
                        
                        {/* Progress bar (smaller) */}
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${getProgressPercentage(quest.progress, quest.target)}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className={`h-2 rounded-full ${
                              quest.subject === 'Math' 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                : 'bg-gradient-to-r from-purple-500 to-purple-600'
                            }`}
                            />
                        </div>
                          {quest.progress < quest.target && (
                            <p className="text-[11px] text-gray-500 mt-1 text-center">
                              {Math.max(0, quest.target - quest.progress)} more correct answers needed
                        </p>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                  ))}
                </>
              )}
            </motion.div>

            {/* Performance Summary */}
            {weakTopicsAnalysis.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Your Focus Areas
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {weakTopicsAnalysis.slice(0, 6).map((area, index) => (
                    <motion.div 
                      key={area.topic}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-xs bg-white rounded-lg p-3 border shadow-sm"
                    >
                      <div className="font-medium text-gray-900">{area.topic}</div>
                      <div className="text-gray-600">{area.accuracy}% accuracy</div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  💡 Quests are automatically generated based on these areas where you need the most improvement.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  opacity: 1,
                  scale: 0
                }}
                animate={{ 
                  y: window.innerHeight + 10,
                  opacity: 0,
                  scale: 1,
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 3,
                  ease: "easeOut"
                }}
                className="absolute text-2xl"
                style={{
                  left: Math.random() * window.innerWidth,
                  color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
                }}
              >
                {['🎉', '⭐', '🎊', '🏆', '💎'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
      </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default QuestsModal;