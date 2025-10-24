import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Trophy, CheckCircle, X, TrendingUp, Play } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  claimed?: boolean;
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

// Helper: calculate average time per question
const calculateAverageTimePerQuestion = (attempts: any[] = []): number => {
  if (!attempts || attempts.length === 0) return 0;
  
  const totalTime = attempts.reduce((sum, attempt) => {
    return sum + (attempt.time_spent || 0);
  }, 0);
  
  return totalTime / attempts.length;
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
  const navigate = useNavigate();

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

        // Manage quest expiration and generate new quests
        await manageQuestExpiration(userId);

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
    
    // Determine user stage based on performance data
    const attemptedTopics = getAttemptedTopics(questionAttempts || []);
    const hasAnyActivity = attemptedTopics.size > 0;
    const hasManyTopics = attemptedTopics.size >= 8;

    if (!hasAnyActivity) {
      // NEW USER: Basic onboarding quests
      const onboardingQuests = [
        {
          quest_title: "Explore the Marathon feature",
          quest_description: "Complete your first Marathon session to get familiar with the feature",
          target_topic: "Marathon",
          target_count: 1,
          difficulty: 'Easy',
          points_reward: 10,
          quest_type: 'daily'
        },
        {
          quest_title: "Solve 3 questions in Marathon",
          quest_description: "Complete 3 questions correctly in Marathon mode",
          target_topic: "Marathon",
          target_count: 3,
          difficulty: 'Easy',
          points_reward: 15,
          quest_type: 'daily'
        },
        {
          quest_title: "Solve 10 questions in Quiz mode",
          quest_description: "Answer 10 questions correctly in Quiz mode",
          target_topic: "Quiz",
          target_count: 10,
          difficulty: 'Medium',
          points_reward: 20,
          quest_type: 'daily'
        },
        {
          quest_title: "Complete 1 Mock Test",
          quest_description: "Take and complete your first Mock Test",
          target_topic: "Mock Test",
          target_count: 1,
          difficulty: 'Hard',
          points_reward: 25,
          quest_type: 'weekly'
        }
      ];

      onboardingQuests.forEach((quest, index) => {
        let expiresAt: string;
        if (quest.quest_type === 'daily') {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          expiresAt = today.toISOString();
        } else {
          // Monthly quests expire in 30 days
          expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
        
        const questId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `q_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        questsToCreate.push({
          user_id: userId,
          quest_id: questId,
          quest_title: quest.quest_title,
          quest_description: quest.quest_description,
          target_topic: quest.target_topic,
          difficulty: quest.difficulty,
          quest_type: quest.quest_type,
          target_count: quest.target_count,
          current_progress: 0,
          points_reward: quest.points_reward,
          completed: false,
          expires_at: expiresAt
        });
      });
    } else {
      // RETURNING USER: Personalized quests based on performance
      const personalizedQuests: any[] = [];
      
      // Generate quests for weak topics (top 3-5)
      const topWeakTopics = weakTopicsAnalysis.slice(0, 5);
      
      topWeakTopics.forEach((weakArea, index) => {
        const isUrgent = weakArea.accuracy < 50;
        const target = isUrgent ? 10 : 8;
        const difficulty = isUrgent ? 'Hard' : 'Medium';
        const points = isUrgent ? 25 : 18;
        
        personalizedQuests.push({
          quest_title: `Solve ${target} ${weakArea.topic} questions`,
          quest_description: `Improve your ${weakArea.topic} skills by answering ${target} questions correctly`,
          target_topic: weakArea.topic,
          target_count: target,
          difficulty: difficulty,
          points_reward: points,
          quest_type: index < 3 ? 'daily' : 'weekly',
          accuracy: weakArea.accuracy,
          subject: weakArea.subject
        });
      });

      // Add speed-based quests if user is consistently slow
      const avgTimePerQuestion = calculateAverageTimePerQuestion(questionAttempts || []);
      if (avgTimePerQuestion > 120) { // More than 2 minutes per question
        personalizedQuests.push({
          quest_title: `Solve 5 Reading questions under 60 seconds each`,
          quest_description: `Improve your reading speed by completing 5 Reading questions in under 60 seconds each`,
          target_topic: "Reading Speed",
          target_count: 5,
          difficulty: 'Hard',
          points_reward: 20,
          quest_type: 'daily'
        });
      }

      personalizedQuests.forEach((quest, index) => {
        let expiresAt: string;
        if (quest.quest_type === 'daily') {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          expiresAt = today.toISOString();
        } else {
          // Monthly quests expire in 30 days
          expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
        
        const questId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `q_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        questsToCreate.push({
          user_id: userId,
          quest_id: questId,
          quest_title: quest.quest_title,
          quest_description: quest.quest_description,
          target_topic: quest.target_topic,
          difficulty: quest.difficulty,
          quest_type: quest.quest_type,
          target_count: quest.target_count,
          current_progress: 0,
          points_reward: quest.points_reward,
          completed: false,
          expires_at: expiresAt
        });
      });
    }

    // Insert all quests (limit to 15 max: 5 daily, 10 monthly)
    const maxDailyQuests = 5;
    const maxMonthlyQuests = 10;
    
    // Separate daily and monthly quests
    const dailyQuests = questsToCreate.filter(q => q.quest_type === 'daily').slice(0, maxDailyQuests);
    const monthlyQuests = questsToCreate.filter(q => q.quest_type === 'weekly').slice(0, maxMonthlyQuests);
    const questsToAdd = [...dailyQuests, ...monthlyQuests];

    if (questsToAdd.length > 0) {
      const { error } = await supabase.from('user_quests').insert(questsToAdd);
      if (error) {
        console.error('Error creating targeted quests:', error);
      } else {
        console.log(`Created ${questsToAdd.length} ${hasAnyActivity ? 'personalized' : 'onboarding'} quests for user`);
      }
    }
  };

  // Function to manage quest expiration and carryover
  const manageQuestExpiration = async (userId: string) => {
    try {
      const now = new Date();
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      // Get all active quests
      const { data: allQuests, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', userId)
        .gte('expires_at', now.toISOString());

      if (error || !allQuests) return;

      // Separate daily and monthly quests
      const dailyQuests = allQuests.filter(q => q.quest_type === 'daily');
      const monthlyQuests = allQuests.filter(q => q.quest_type === 'weekly');

      // Remove expired daily quests (they should expire at end of day)
      const expiredDailyQuests = dailyQuests.filter(q => new Date(q.expires_at) <= now);
      if (expiredDailyQuests.length > 0) {
        await supabase
          .from('user_quests')
          .delete()
          .in('id', expiredDailyQuests.map(q => q.id));
        console.log(`Removed ${expiredDailyQuests.length} expired daily quests`);
      }

      // Count remaining monthly quests (these carry forward)
      const remainingMonthlyQuests = monthlyQuests.filter(q => new Date(q.expires_at) > now);
      const monthlyQuestsToCreate = Math.max(0, 10 - remainingMonthlyQuests.length);

      // Generate new daily quests (always 5 per day, but only if we have less than 5)
      const dailyQuestsToCreate = Math.max(0, 5 - dailyQuests.length);
      const newDailyQuests = dailyQuestsToCreate > 0 ? 
        await generateDailyQuests(userId, dailyQuestsToCreate) : [];
      
      // Generate new monthly quests if needed (limit to 10 total)
      const newMonthlyQuests = monthlyQuestsToCreate > 0 ? 
        await generateMonthlyQuests(userId, monthlyQuestsToCreate) : [];

      // Insert new quests
      const allNewQuests = [...newDailyQuests, ...newMonthlyQuests];
      if (allNewQuests.length > 0) {
        const { error: insertError } = await supabase
          .from('user_quests')
          .insert(allNewQuests);
        
        if (insertError) {
          console.error('Error inserting new quests:', insertError);
        } else {
          console.log(`Created ${allNewQuests.length} new quests (${newDailyQuests.length} daily, ${newMonthlyQuests.length} monthly)`);
        }
      }

    } catch (error) {
      console.error('Error managing quest expiration:', error);
    }
  };

  // Generate daily quests
  const generateDailyQuests = async (userId: string, count: number) => {
    // Ensure we never create more than 5 daily quests
    const maxCount = Math.min(count, 5);
    const attemptedTopics = getAttemptedTopics(questionAttempts || []);
    const hasAnyActivity = attemptedTopics.size > 0;
    
    const quests = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const expiresAt = today.toISOString();

    if (!hasAnyActivity) {
      // Basic onboarding quests for new users
      const onboardingQuests = [
        {
          quest_title: "Complete 3 questions in Quiz mode",
          quest_description: "Answer 3 questions correctly in Quiz mode",
          target_topic: "Quiz",
          target_count: 3,
          difficulty: 'Easy',
          points_reward: 10,
        },
        {
          quest_title: "Try Marathon mode",
          quest_description: "Complete your first Marathon session",
          target_topic: "Marathon",
          target_count: 1,
          difficulty: 'Easy',
          points_reward: 15,
        },
        {
          quest_title: "Solve 5 Math questions",
          quest_description: "Answer 5 Math questions correctly",
          target_topic: "Math",
          target_count: 5,
          difficulty: 'Medium',
          points_reward: 20,
        },
        {
          quest_title: "Complete 2 Reading questions",
          quest_description: "Answer 2 Reading questions correctly",
          target_topic: "Reading",
          target_count: 2,
          difficulty: 'Easy',
          points_reward: 12,
        },
        {
          quest_title: "Practice Writing skills",
          quest_description: "Answer 3 Writing questions correctly",
          target_topic: "Writing",
          target_count: 3,
          difficulty: 'Medium',
          points_reward: 18,
        }
      ];

      for (let i = 0; i < Math.min(maxCount, onboardingQuests.length); i++) {
        const quest = onboardingQuests[i];
        const questId = crypto.randomUUID();
        quests.push({
          user_id: userId,
          quest_id: questId,
          quest_title: quest.quest_title,
          quest_description: quest.quest_description,
          target_topic: quest.target_topic,
          difficulty: quest.difficulty,
          quest_type: 'daily',
          target_count: quest.target_count,
          current_progress: 0,
          points_reward: quest.points_reward,
          completed: false,
          expires_at: expiresAt
        });
      }
    } else {
      // Personalized daily quests for returning users
      const topWeakTopics = weakTopicsAnalysis.slice(0, count);
      
      for (let i = 0; i < Math.min(maxCount, topWeakTopics.length); i++) {
        const weakArea = topWeakTopics[i];
        const isUrgent = weakArea.accuracy < 50;
        const target = isUrgent ? 5 : 3;
        const difficulty = isUrgent ? 'Hard' : 'Medium';
        const points = isUrgent ? 25 : 15;
        
        const questId = crypto.randomUUID();
        quests.push({
          user_id: userId,
          quest_id: questId,
          quest_title: `Solve ${target} ${weakArea.topic} questions`,
          quest_description: `Improve your ${weakArea.topic} skills by answering ${target} questions correctly`,
          target_topic: weakArea.topic,
          target_count: target,
          difficulty: difficulty,
          quest_type: 'daily',
          current_progress: 0,
          points_reward: points,
          completed: false,
          expires_at: expiresAt
        });
      }
    }

    return quests;
  };

  // Generate monthly quests
  const generateMonthlyQuests = async (userId: string, count: number) => {
    // Ensure we never create more than 10 monthly quests
    const maxCount = Math.min(count, 10);
    const attemptedTopics = getAttemptedTopics(questionAttempts || []);
    const hasAnyActivity = attemptedTopics.size > 0;
    
    const quests = [];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setHours(23, 59, 59, 999);
    const expiresAt = nextMonth.toISOString();

    if (!hasAnyActivity) {
      // Basic monthly quests for new users
      const monthlyQuests = [
        {
          quest_title: "Complete 1 Mock Test",
          quest_description: "Take and complete your first Mock Test",
          target_topic: "Mock Test",
          target_count: 1,
          difficulty: 'Hard',
          points_reward: 50,
        },
        {
          quest_title: "Solve 20 questions in Marathon",
          quest_description: "Complete 20 questions correctly in Marathon mode",
          target_topic: "Marathon",
          target_count: 20,
          difficulty: 'Hard',
          points_reward: 40,
        },
        {
          quest_title: "Master Algebra",
          quest_description: "Answer 15 Algebra questions correctly",
          target_topic: "Algebra",
          target_count: 15,
          difficulty: 'Hard',
          points_reward: 35,
        },
        {
          quest_title: "Improve Reading Comprehension",
          quest_description: "Answer 12 Reading questions correctly",
          target_topic: "Reading",
          target_count: 12,
          difficulty: 'Hard',
          points_reward: 30,
        },
        {
          quest_title: "Excel in Writing",
          quest_description: "Answer 10 Writing questions correctly",
          target_topic: "Writing",
          target_count: 10,
          difficulty: 'Hard',
          points_reward: 25,
        }
      ];

      for (let i = 0; i < Math.min(maxCount, monthlyQuests.length); i++) {
        const quest = monthlyQuests[i];
        const questId = crypto.randomUUID();
        quests.push({
          user_id: userId,
          quest_id: questId,
          quest_title: quest.quest_title,
          quest_description: quest.quest_description,
          target_topic: quest.target_topic,
          difficulty: quest.difficulty,
          quest_type: 'weekly',
          target_count: quest.target_count,
          current_progress: 0,
          points_reward: quest.points_reward,
          completed: false,
          expires_at: expiresAt
        });
      }
    } else {
      // Personalized monthly quests for returning users
      const topWeakTopics = weakTopicsAnalysis.slice(0, count);
      
      for (let i = 0; i < Math.min(maxCount, topWeakTopics.length); i++) {
        const weakArea = topWeakTopics[i];
        const isUrgent = weakArea.accuracy < 50;
        const target = isUrgent ? 25 : 20;
        const difficulty = 'Hard';
        const points = isUrgent ? 60 : 45;
        
        const questId = crypto.randomUUID();
        quests.push({
          user_id: userId,
          quest_id: questId,
          quest_title: `Master ${weakArea.topic}`,
          quest_description: `Improve your ${weakArea.topic} skills by answering ${target} questions correctly`,
          target_topic: weakArea.topic,
          target_count: target,
          difficulty: difficulty,
          quest_type: 'weekly',
          current_progress: 0,
          points_reward: points,
          completed: false,
          expires_at: expiresAt
        });
      }
    }

    return quests;
  };

  // Handle starting a quest
  const handleStartQuest = (quest: Quest) => {
    // Navigate to quiz with specific topic
    navigate('/quiz', { 
      state: { 
        autoSelectTopic: quest.topic,
        subject: quest.subject,
        questionCount: quest.target
      }
    });
    onClose(); // Close the modal
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      setClaimingQuest(questId);
      const quest = userQuests.find(q => q.id === questId);
      if (!quest) return;

      // Update quest as completed and claimed
      const { error: updateError } = await supabase
        .from('user_quests')
        .update({ 
          completed: true, 
          current_progress: quest.target,
          completed_at: new Date().toISOString()
        })
        .eq('id', questId);

      if (updateError) {
        console.error('Error updating quest:', updateError);
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      const userId = user.user?.id as string;

      // Award points to user immediately
      const { error: pointsError } = await supabase.rpc('increment_user_points', {
        p_points: quest.points,
        p_user_id: userId
      });

      if (pointsError) {
        console.error('Error awarding points:', pointsError);
      }

      // Update local state - mark as completed and claimed
      setUserQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, completed: true, progress: quest.target, claimed: true } : q
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
        className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-white shadow-2xl z-50 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-6 border-b border-gray-200 bg-white"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-black">Your Quests</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-black border-gray-300 font-medium bg-white">
                {activeQuests.length} active
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
          <div className="flex-1 overflow-y-auto p-6">
            {userQuests.length === 0 ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12"
              >
                <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-black mb-2">No Quests Available</h3>
                <p className="text-gray-600">New quests will be generated based on your performance.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Active Quests */}
                {activeQuests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Active Quests</h3>
                    <div className="space-y-4">
                      {activeQuests.map((quest, index) => {
                        const hasStarted = quest.progress > 0;
                        
                        return (
                          <motion.div
                            key={quest.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={hasStarted 
                              ? "flex items-start gap-4 p-4 border-l-4 border-blue-600 bg-gray-50 rounded-r-lg"
                              : "flex items-start gap-3 py-2"
                            }
                          >
                            {/* Bullet point */}
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${hasStarted ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                            </div>
                            
                            {/* Quest content */}
                            <div className="flex-1 min-w-0">
                              {hasStarted ? (
                                // Card view for started quests
                                <>
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-black mb-1">
                                        {quest.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 mb-3">
                                        {quest.description}
                                      </p>
                                    </div>
                                    
                                    {/* Claim button */}
                                    {quest.progress >= quest.target && !quest.completed && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleCompleteQuest(quest.id)}
                                            disabled={claimingQuest === quest.id}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm disabled:opacity-50"
                                          >
                                            {claimingQuest === quest.id ? 'Claiming...' : 'Claim'}
                                          </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Claim your reward (+{quest.points} points)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  
                                  {/* Progress bar */}
                                  <div className="mb-2">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                      <span>Progress: {quest.progress}/{quest.target}</span>
                                      <span>{Math.round(getProgressPercentage(quest.progress, quest.target))}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getProgressPercentage(quest.progress, quest.target)}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="h-2 bg-blue-600 rounded-full"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Quest metadata */}
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {getTimeRemaining(quest.expiresAt)}
                                    </span>
                                    <span className="font-medium text-blue-600">+{quest.points} points</span>
                                    <Badge variant="outline" className="text-xs">
                                      {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                                    </Badge>
                                  </div>
                                </>
                              ) : (
                                // Bullet point view for unstarted quests
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {quest.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {quest.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <span>+{quest.points} pts</span>
                                      <Badge variant="outline" className="text-xs">
                                        {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                                      </Badge>
                                    </div>
                                    <Button
                                      onClick={() => handleStartQuest(quest)}
                                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                                      size="sm"
                                    >
                                      <Play className="h-3 w-3" />
                                      Start
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed Quests */}
                {completedQuests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Completed Quests</h3>
                    <div className="space-y-4">
                      {completedQuests.map((quest, index) => (
                        <motion.div
                          key={quest.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (activeQuests.length + index) * 0.1 }}
                          className="flex items-start gap-4 p-4 border-l-4 border-gray-300 bg-gray-100 rounded-r-lg opacity-60"
                        >
                          {/* Checkmark */}
                          <div className="flex-shrink-0 mt-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          
                          {/* Quest content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-500 mb-1 line-through">
                                  {quest.title}
                                </h3>
                                <p className="text-sm text-gray-400 mb-3">
                                  {quest.description}
                                </p>
                              </div>
                              
                              {/* Completed badge */}
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-300">
                                Completed
                              </Badge>
                            </div>
                            
                            {/* Progress bar - full */}
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                                <span>Progress: {quest.progress}/{quest.target}</span>
                                <span>100%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="h-2 bg-green-600 rounded-full w-full" />
                              </div>
                            </div>
                            
                            {/* Quest metadata */}
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="font-medium text-green-600">+{quest.points} points earned</span>
                              <Badge variant="outline" className="text-xs">
                                {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Performance Summary */}
            {weakTopicsAnalysis.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
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
                      <div className="font-medium text-black">{area.topic}</div>
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