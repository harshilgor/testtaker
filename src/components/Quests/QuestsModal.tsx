import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Trophy, CheckCircle, X, TrendingUp, Play } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSimpleToast } from '@/components/ui/simple-toast';
import { useQueryClient } from '@tanstack/react-query';
import { questTrackingService } from '@/services/questTrackingService';

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
  onNavigateToLeaderboard?: () => void;
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

const QuestsModal: React.FC<QuestsModalProps> = ({ open, onClose, userName, onQuestCompleted, onNavigateToLeaderboard }) => {
  const { questionAttempts, quizResults, marathonSessions, loading } = useData();
  const [userQuests, setUserQuests] = useState<Quest[]>([]);
  const [completedQuestsList, setCompletedQuestsList] = useState<Quest[]>([]); // Separate state for completed quests
  const [questsLoading, setQuestsLoading] = useState(true);
  const [claimingQuest, setClaimingQuest] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const navigate = useNavigate();
  const { showToast } = useSimpleToast();
  const queryClient = useQueryClient();

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

  // Load founder-designed quests for ALL users
  useEffect(() => {
    const loadQuests = async () => {
      setQuestsLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          setQuestsLoading(false);
          return;
        }

        // Manage quest expiration and generate new quests to ensure user always has 10 quests
        await manageQuestExpiration(user.user.id);

        // Check for completed quests in the database - get full completion data
        const { data: completedQuestsData, error: completedError } = await supabase
          .from('quest_completions')
          .select('quest_id, points_awarded, completed_at')
          .eq('user_id', user.user.id)
          .order('completed_at', { ascending: false });

        if (completedError) {
          console.error('Error fetching completed quests:', completedError);
        }

        const completedQuestIds = new Set(completedQuestsData?.map(q => q.quest_id) || []);
        const completedQuestsMap = new Map(
          completedQuestsData?.map(q => [q.quest_id, { points: q.points_awarded, completedAt: q.completed_at }]) || []
        );
        console.log('📋 Loaded completed quest IDs:', Array.from(completedQuestIds));

        // Always show founder-designed quests for ALL users
        const founderQuests: Quest[] = [
          {
            id: 'welcome-quest',
            title: "Welcome to the platform! I'm Harshil, the founder 🚀",
            description: "I encourage you to contact me directly at harshilgor06@gmail.com with any feedback. I hope you love it LETS GET THAT 1600 !!!! 😎🙏",
            topic: "welcome",
            difficulty: 'Easy',
            type: 'daily',
            target: 1,
            progress: 0,
            points: 50,
            completed: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            subject: 'general',
            accuracy: 0
          },
          {
            id: 'leaderboard-quest',
            title: "Visit the Leaderboard 📈",
            description: "See how you compare with other SAT students and track your progress against the community.",
            topic: "leaderboard",
            difficulty: 'Easy',
            type: 'daily',
            target: 1,
            progress: 0,
            points: 25,
            completed: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            subject: 'general',
            accuracy: 0,
            feature: 'leaderboard' // For auto-detection
          },
          {
            id: 'practice-quest',
            title: "Explore the Practice Tab 📕",
            description: "Navigate to the Practice section on the Home page to customize and engage with various question styles.",
            topic: "practice",
            difficulty: 'Easy',
            type: 'daily',
            target: 1,
            progress: 0,
            points: 30,
            completed: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            subject: 'general',
            accuracy: 0
          },
          {
            id: 'custom-quiz-quest',
            title: "Create Your First Custom Quiz 💬",
            description: "Use the Practice tool to generate a short, 10-question quiz on any topic of your choice.",
            topic: "custom_quiz",
            difficulty: 'Medium',
            type: 'daily',
            target: 10,
            progress: 0,
            points: 40,
            completed: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            subject: 'both',
            accuracy: 0
          },
          {
            id: 'learn-quest',
            title: "Review Your Errors on the Learn Page 📜",
            description: "Visit the Learn section to review every question you have answered incorrectly across the platform.",
            topic: "learn",
            difficulty: 'Easy',
            type: 'daily',
            target: 1,
            progress: 0,
            points: 35,
            completed: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            subject: 'general',
            accuracy: 0
          },
          {
            id: 'performance-quest',
            title: "Analyze Your Performance 📊",
            description: "Access the dedicated Performance page to view detailed analytics and metrics on your progress.",
            topic: "performance",
            difficulty: 'Easy',
            type: 'daily',
            target: 1,
            progress: 0,
            points: 30,
            completed: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            subject: 'general',
            accuracy: 0
          },
          {
            id: 'mock-test-explore-quest',
            title: "Explore the Mock Test Section 📚",
            description: "View the available full-length practice tests and understand the testing interface.",
            topic: "mock_test_explore",
            difficulty: 'Easy',
            type: 'daily',
            target: 1,
            progress: 0,
            points: 25,
            completed: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            subject: 'general',
            accuracy: 0
          },
          {
            id: 'mock-test-complete-quest',
            title: "Complete a Full Mock Test 📖",
            description: "Schedule and take one of the available mock exams to get a baseline score.",
            topic: "mock_test_complete",
            difficulty: 'Hard',
            type: 'weekly',
            target: 1,
            progress: 0,
            points: 60,
            completed: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            subject: 'both',
            accuracy: 0
          },
          {
            id: 'ai-analysis-quest',
            title: "Activate AI Weakness Analysis 😎",
            description: "Go to the Practice page, check your personalized AI Weakness Analysis, and complete the recommended quiz that targets your weakest area.",
            topic: "ai_analysis",
            difficulty: 'Medium',
            type: 'weekly',
            target: 1,
            progress: 0,
            points: 45,
            completed: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            subject: 'both',
            accuracy: 0
          }
        ];

        // Load database quests (daily/monthly) - also check completion status from user_quests
        const { data: dbQuests, error: dbError } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_id', user.user.id)
          .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
          .order('created_at', { ascending: false });

        if (dbError) {
          console.error('Error loading database quests:', dbError);
        }

        // Get completed quest IDs from user_quests table (for database quests)
        const completedDbQuestIds = new Set(
          (dbQuests || []).filter(q => q.completed).map(q => q.id.toString())
        );

        // Also check quest_completions for ALL quests (both founder and database)
        const allCompletedQuestIds = new Set([
          ...Array.from(completedQuestIds),
          ...Array.from(completedDbQuestIds)
        ]);

        // Convert database quests to Quest format
        // Only include non-completed quests
        const databaseQuests: Quest[] = (dbQuests || [])
          .filter(dbQuest => !dbQuest.completed) // Filter out completed database quests
          .map(dbQuest => ({
            id: dbQuest.id.toString(),
            title: dbQuest.quest_title || 'Untitled Quest',
            description: dbQuest.quest_description || 'No description available',
            topic: dbQuest.target_topic || 'general',
            difficulty: (dbQuest.difficulty === 'Easy' || dbQuest.difficulty === 'Medium' || dbQuest.difficulty === 'Hard') 
              ? dbQuest.difficulty as 'Easy' | 'Medium' | 'Hard'
              : 'Medium',
            type: (dbQuest.quest_type === 'daily' || dbQuest.quest_type === 'weekly') 
              ? dbQuest.quest_type as 'daily' | 'weekly'
              : 'daily' as 'daily' | 'weekly',
            target: dbQuest.target_count || 1,
            progress: dbQuest.current_progress || 0,
            points: dbQuest.points_reward || 10,
            completed: false, // Already filtered above
            expiresAt: new Date(dbQuest.expires_at),
            subject: 'general', // Default subject since it's not in the database schema
            accuracy: 0
          }));

        // Update founder quest completion status - check BOTH quest_completions and user_quests
        const founderQuestsWithCompletion = founderQuests.map(quest => {
          const isCompleted = allCompletedQuestIds.has(quest.id);
          const completionData = completedQuestsMap.get(quest.id);
          if (isCompleted) {
            console.log(`✅ Quest ${quest.id} (${quest.title}) is already completed`);
          }
          return {
            ...quest,
            completed: isCompleted,
            progress: isCompleted ? quest.target : 0,
            completedAt: completionData?.completedAt ? new Date(completionData.completedAt) : undefined,
            pointsAwarded: completionData?.points || quest.points
          };
        });

        // Separate active and completed quests
        const activeQuests = [...founderQuestsWithCompletion, ...databaseQuests]
          .filter(q => {
            // Only include non-completed quests
            if (q.completed) {
              console.log(`🚫 Filtering out completed quest: ${q.id} (${q.title})`);
              return false;
            }
            // Also filter out expired quests
            if (q.expiresAt && new Date(q.expiresAt) < new Date()) {
              console.log(`⏰ Filtering out expired quest: ${q.id} (${q.title})`);
              return false;
            }
            return true;
          });

        // Separate completed quests for the Completed tab
        const completedQuests = [...founderQuestsWithCompletion, ...databaseQuests]
          .filter(q => {
            // Only include completed quests
            if (!q.completed) return false;
            return true;
          })
          .sort((a, b) => {
            // Sort by completion time (most recent first) if available
            const aTime = (a as any).completedAt ? new Date((a as any).completedAt).getTime() : 0;
            const bTime = (b as any).completedAt ? new Date((b as any).completedAt).getTime() : 0;
            return bTime - aTime;
          });

        console.log(`📊 Setting ${activeQuests.length} active quests and ${completedQuests.length} completed quests`);
        setUserQuests(activeQuests);
        setCompletedQuestsList(completedQuests);
      } catch (error) {
        console.error('Error in loadQuests:', error);
      } finally {
        setQuestsLoading(false);
      }
    };

    loadQuests();
    
    // Listen for quest completion events to reload quests
    const handleQuestCompleted = async () => {
      console.log('🔄 Reloading quests due to quest-completed event');
      // Refresh quest cache in background for instant future checks
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        questTrackingService.preloadQuestCache(user.user.id).catch(err => {
          console.error('Error refreshing quest cache:', err);
        });
      }
      loadQuests();
    };
    
    window.addEventListener('quest-completed', handleQuestCompleted);
    window.addEventListener('quest-list-updated', handleQuestCompleted);
    
    return () => {
      window.removeEventListener('quest-completed', handleQuestCompleted);
      window.removeEventListener('quest-list-updated', handleQuestCompleted);
    };
  }, [loading]);

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

            // Find matching active quests - match quests that count questions/solved questions
            const matching = userQuests.filter(q => {
              if (q.completed) return false;
              if (q.expiresAt && new Date(q.expiresAt) < new Date()) return false;
              if (q.progress >= q.target) return false;
              
              // Check if quest is about solving questions (count-based quests)
              const questTitleLower = q.title?.toLowerCase() || '';
              const questTopicLower = q.topic?.toLowerCase() || '';
              
              // Match quests that are about:
              // 1. Solving questions (any number)
              // 2. Quiz-related quests (count questions)
              // 3. General practice (count questions)
              // 4. Exact topic match
              const isQuestionCountQuest = questTitleLower.includes('question') || 
                                          questTitleLower.includes('solve') ||
                                          questTitleLower.includes('complete') ||
                                          questTopicLower.includes('quiz') ||
                                          questTopicLower === 'general practice' ||
                                          questTopicLower === 'practice';
              
              return isQuestionCountQuest || questTopicLower === attemptTopic.toLowerCase();
            });
            
            if (matching.length === 0) return;

            // Track which quests were completed
            const completedQuestsList: Quest[] = [];
            
            // Increment each matching quest by 1 (cap at target)
            for (const q of matching) {
              const wasIncomplete = q.progress < q.target;
              const newProgress = Math.min(q.target, q.progress + 1);
              const isCompleted = newProgress >= q.target && wasIncomplete;
              
              // Update progress and completion status
              const updateData: any = { 
                current_progress: newProgress,
                updated_at: new Date().toISOString()
              };
              
              if (isCompleted) {
                updateData.completed = true;
                updateData.completed_at = new Date().toISOString();
                
                // Award points
                const { error: pointsError } = await supabase.rpc('increment_user_points', {
                  p_points: q.points || 0,
                  p_user_id: userId
                });
                
                if (!pointsError) {
                  // Record quest completion
                  await supabase
                    .from('quest_completions')
                    .insert({
                      user_id: userId,
                      quest_id: q.id,
                      points_awarded: q.points || 0,
                      completed_at: new Date().toISOString()
                    })
                    .catch(err => console.error('Error recording quest completion:', err));
                  
                  completedQuestsList.push(q);
                }
              }
              
              // Only update database quests (not founder quests)
              // Founder quests use quest_id string, database quests use id
              if (q.id && q.id !== 'welcome-quest' && q.id !== 'leaderboard-quest' && 
                  q.id !== 'learn-quest' && q.id !== 'performance-quest' &&
                  q.id !== 'practice-quest' && q.id !== 'custom-quiz-quest' &&
                  q.id !== 'mock-test-explore-quest' && q.id !== 'mock-test-complete-quest' &&
                  q.id !== 'ai-analysis-quest') {
                await supabase.from('user_quests').update(updateData).eq('id', q.id).catch(err => {
                  console.error('Error updating quest progress:', err);
                });
              } else if (isCompleted) {
                // For founder quests that are completed, record in quest_completions
                await supabase
                  .from('quest_completions')
                  .insert({
                    user_id: userId,
                    quest_id: q.id,
                    points_awarded: q.points || 0,
                    completed_at: new Date().toISOString()
                  })
                  .catch(err => {
                    if (err.code !== '23505') {
                      console.error('Error recording founder quest completion:', err);
                    }
                  });
              }
            }

            // Update local state immediately to remove completed quests
            if (completedQuestsList.length > 0 || matching.some(q => {
              const wasIncomplete = q.progress < q.target;
              const newProgress = Math.min(q.target, q.progress + 1);
              return newProgress >= q.target && wasIncomplete;
            })) {
              setUserQuests(prev => {
                return prev.map(q => {
                  const matchingQuest = matching.find(m => m.id === q.id);
                  if (!matchingQuest) return q;
                  
                  const wasIncomplete = matchingQuest.progress < matchingQuest.target;
                  const newProgress = Math.min(matchingQuest.target, matchingQuest.progress + 1);
                  const isCompleted = newProgress >= matchingQuest.target && wasIncomplete;
                  
                  if (isCompleted) {
                    // Mark as completed and exclude from list
                    return { ...q, completed: true, progress: newProgress };
                  }
                  
                  return { ...q, progress: newProgress };
                }).filter(q => !q.completed); // Remove completed quests immediately
              });
              
              // Show toast notification for completed quests
              if (completedQuestsList.length > 0) {
                const totalPoints = completedQuestsList.reduce((sum, q) => sum + (q.points || 0), 0);
                const questNames = completedQuestsList.map(q => q.title).join(', ');
                showToast({
                  title: 'Quest Completed! 🎉',
                  description: `You completed: ${questNames}. Earned ${totalPoints} points!`,
                  type: 'success',
                  duration: 6000
                });
                
                // Trigger quest refresh
                window.dispatchEvent(new CustomEvent('quest-completed'));
              }
            } else {
              // Just update progress for non-completed quests
              setUserQuests(prev => prev.map(q => {
                const matchingQuest = matching.find(m => m.id === q.id);
                if (!matchingQuest) return q;
                const newProgress = Math.min(matchingQuest.target, matchingQuest.progress + 1);
                return { ...q, progress: newProgress };
              }));
            }

            // Trigger refresh in Dashboard to update Live Quests
            window.dispatchEvent(new CustomEvent('quest-list-updated'));
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
      
      // Ensure user always has 15 total quests (5 daily + 10 weekly)
      const totalActiveQuests = dailyQuests.length + remainingMonthlyQuests.length;
      const questsNeeded = Math.max(0, 15 - totalActiveQuests);
      
      // Generate new daily quests (always 5 per day, but only if we have less than 5)
      const dailyQuestsToCreate = Math.max(0, 5 - dailyQuests.length);
      
      // Generate new monthly quests to fill remaining slots
      const monthlyQuestsToCreate = Math.max(0, questsNeeded - dailyQuestsToCreate);
      const newDailyQuests = dailyQuestsToCreate > 0 ? 
        await generateDailyQuests(userId, dailyQuestsToCreate) : [];
      
      // Generate new monthly quests if needed (limit to 15 total)
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
    // Handle different quest types with specific navigation
    switch (quest.topic) {
      case 'welcome':
        // Show welcome message and mark as done
        showToast({
          title: 'Welcome to the platform! 🚀',
          description: 'I\'m Harshil, the founder. Contact me at harshilgor06@gmail.com with any feedback. LET\'S GET THAT 1600!!! 😎🙏',
          type: 'success',
          duration: 8000
        });
        // Mark quest as completed and show completion toast
        handleCompleteQuest(quest.id);
        showToast({
          title: 'Quest Completed! 🎉',
          description: `Congratulations! You earned ${quest.points} points!`,
          type: 'success',
          duration: 6000
        });
        break;
      case 'leaderboard':
        // Mark quest as completed and show completion toast with confetti
        handleCompleteQuest(quest.id);
        showToast({
          title: 'Quest Completed! 🎉',
          description: `Congratulations! You earned ${quest.points} points!`,
          type: 'success',
          duration: 6000
        });
        
        // Delay navigation and modal close to allow user to see confetti and notification
        setTimeout(() => {
          // Navigate to leaderboard page using state-based navigation
          if (onNavigateToLeaderboard) {
            onNavigateToLeaderboard();
          } else {
            navigate('/leaderboard');
          }
          onClose();
        }, 2500); // Wait 2.5 seconds for confetti and notification
        break;
      case 'practice':
        // Navigate to quiz page for practice
        navigate('/quiz');
        // Mark quest as completed and show completion toast
        handleCompleteQuest(quest.id);
        showToast({
          title: 'Quest Completed! 🎉',
          description: `Congratulations! You earned ${quest.points} points!`,
          type: 'success',
          duration: 6000
        });
        onClose();
        break;
      case 'custom_quiz':
        // Navigate to quiz page for custom quiz
        navigate('/quiz');
        onClose();
        break;
      case 'learn':
        // Navigate to learn page
        navigate('/learn');
        // Mark quest as completed and show completion toast
        handleCompleteQuest(quest.id);
        showToast({
          title: 'Quest Completed! 🎉',
          description: `Congratulations! You earned ${quest.points} points!`,
          type: 'success',
          duration: 6000
        });
        onClose();
        break;
      case 'performance':
        // Navigate to performance page
        navigate('/performance');
        // Mark quest as completed and show completion toast
        handleCompleteQuest(quest.id);
        showToast({
          title: 'Quest Completed! 🎉',
          description: `Congratulations! You earned ${quest.points} points!`,
          type: 'success',
          duration: 6000
        });
        onClose();
        break;
      case 'mock_test_explore':
        // Navigate to mock test page
        navigate('/sat-mock-test');
        // Mark quest as completed and show completion toast
        handleCompleteQuest(quest.id);
        showToast({
          title: 'Quest Completed! 🎉',
          description: `Congratulations! You earned ${quest.points} points!`,
          type: 'success',
          duration: 6000
        });
        onClose();
        break;
      case 'mock_test_complete':
        // Navigate to mock test page
        navigate('/sat-mock-test');
        onClose();
        break;
      case 'ai_analysis':
        // Navigate to quiz with AI analysis
        navigate('/quiz', { 
          state: { 
            aiAnalysis: true,
            subject: quest.subject
          }
        });
        onClose();
        break;
      default:
        // Default to quiz navigation
        navigate('/quiz', { 
          state: { 
            autoSelectTopic: quest.topic,
            subject: quest.subject,
            questionCount: quest.target
          }
        });
        onClose();
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      setClaimingQuest(questId);
      const quest = userQuests.find(q => q.id === questId);
      if (!quest) return;

      const { data: user } = await supabase.auth.getUser();
      const userId = user.user?.id as string;

      // Award points to user immediately
      const { error: pointsError } = await supabase.rpc('increment_user_points', {
        p_points: quest.points,
        p_user_id: userId
      });

      if (pointsError) {
        console.error('Error awarding points:', pointsError);
        showToast({
          title: 'Error',
          description: 'Failed to award points. Please try again.',
          type: 'error',
          duration: 3000
        });
        return;
      }

      // Save quest completion to database for persistence
      const { error: completionError } = await supabase
        .from('quest_completions')
        .insert({
          user_id: userId,
          quest_id: questId,
          points_awarded: quest.points
        });

      if (completionError) {
        console.error('Error saving quest completion:', completionError);
        showToast({
          title: 'Error',
          description: 'Failed to save quest completion. Please try again.',
          type: 'error',
          duration: 3000
        });
        return;
      }

      // Reload quests to update both active and completed lists
      window.dispatchEvent(new CustomEvent('quest-completed'));

      // Invalidate leaderboard cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });

      // Show success notification
      showToast({
        title: 'Quest Completed! 🎉',
        description: `Congratulations! You earned ${quest.points} points!`,
        type: 'success',
        duration: 5000
      });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      onQuestCompleted?.();
    } catch (error) {
      console.error('Error completing quest:', error);
      showToast({
        title: 'Error',
        description: 'Failed to complete quest. Please try again.',
        type: 'error',
        duration: 3000
      });
    } finally {
      setClaimingQuest(null);
    }
  };

  // Active quests are already filtered when loading (stored in userQuests state)
  // Completed quests are stored separately in completedQuestsList state
  const activeQuests = userQuests;
  const completedQuests = completedQuestsList;
  const totalPointsAvailable = activeQuests.reduce((sum, q) => sum + q.points, 0);
  const totalPointsEarned = completedQuests.reduce((sum, q) => sum + (q.points || 0), 0);

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
      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-4xl rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex flex-col items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-12 w-12 border-b-2 border-blue-600"
                  />
                  <p className="mt-4 text-gray-600 text-sm">
                    Loading your quests...
                  </p>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <TooltipProvider>
      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                <CardHeader className="pb-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-600" />
                      Your Quests
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm border-gray-300 font-medium">
                        {activeQuests.length} active
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 flex-1 overflow-y-auto">
                  {/* Tab Navigation */}
                  <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'active'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Active ({activeQuests.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'completed'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Completed ({completedQuests.length})
                      </button>
                    </div>
                  </div>

                  {/* Quest Content */}
                  {activeTab === 'active' && activeQuests.length === 0 && (
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Quests</h3>
                      <p className="text-sm text-gray-600">New quests will be generated based on your performance.</p>
                    </div>
                  )}
                  {activeTab === 'completed' && completedQuests.length === 0 && (
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Quests Yet</h3>
                      <p className="text-sm text-gray-600">Complete quests to see them here!</p>
                    </div>
                  )}
                  {((activeTab === 'active' && activeQuests.length > 0) || (activeTab === 'completed' && completedQuests.length > 0)) && (
                    <div className="space-y-3">
                      {/* Active Quests */}
                      {activeTab === 'active' && activeQuests.length > 0 && (
                        activeQuests.map((quest, index) => {
                          const hasStarted = quest.progress > 0;
                          const progressPercent = getProgressPercentage(quest.progress, quest.target);
                          
                          return (
                            <Card 
                              key={quest.id}
                              className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                                      {quest.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                      {quest.description}
                                    </p>
                                  </div>
                                  {quest.progress >= quest.target && !quest.completed && (
                                    <Button
                                      onClick={() => handleCompleteQuest(quest.id)}
                                      disabled={claimingQuest === quest.id}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm ml-3 flex-shrink-0"
                                      size="sm"
                                    >
                                      {claimingQuest === quest.id ? 'Claiming...' : 'Claim'}
                                    </Button>
                                  )}
                                  {!hasStarted && (
                                    <Button
                                      onClick={() => handleStartQuest(quest)}
                                      className={`ml-3 flex-shrink-0 ${
                                        quest.topic === 'welcome' 
                                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                                      } px-4 py-2 rounded-lg text-sm`}
                                      size="sm"
                                    >
                                      {quest.topic === 'welcome' ? (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Done
                                        </>
                                      ) : (
                                        <>
                                          <Play className="h-4 w-4 mr-1" />
                                          Start
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                                
                                {hasStarted && (
                                  <>
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                      <span>Progress: {quest.progress}/{quest.target}</span>
                                      <span>{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                                      <div 
                                        className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                      />
                                    </div>
                                  </>
                                )}
                                
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {getTimeRemaining(quest.expiresAt)}
                                  </span>
                                  <span className="font-medium text-blue-600">+{quest.points} points</span>
                                  <Badge variant="outline" className="text-xs">
                                    {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}

                      {/* Completed Quests */}
                      {activeTab === 'completed' && completedQuests.length > 0 && (
                        completedQuests.map((quest) => (
                          <Card 
                            key={quest.id}
                            className="rounded-2xl border border-gray-200 shadow-sm bg-gray-50"
                          >
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {quest.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {quest.description}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-300 flex-shrink-0 ml-3">
                                  Completed
                                </Badge>
                              </div>
                              
                              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                                <div className="h-2 bg-green-600 rounded-full w-full" />
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span className="font-medium text-green-600">+{quest.points} points earned</span>
                                <Badge variant="outline" className="text-xs">
                                  {quest.type === 'daily' ? 'Daily' : 'Weekly'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}

                    </div>
                  )}

                  {/* Performance Summary */}
                  {weakTopicsAnalysis.length > 0 && activeTab === 'active' && (
                    <Card className="mt-6 rounded-2xl border border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          Your Focus Areas
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {weakTopicsAnalysis.slice(0, 6).map((area) => (
                            <div 
                              key={area.topic}
                              className="text-xs bg-white rounded-lg p-2 border border-gray-200"
                            >
                              <div className="font-medium text-gray-900">{area.topic}</div>
                              <div className="text-gray-600">{area.accuracy}% accuracy</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">
                          💡 Quests are automatically generated based on these areas where you need the most improvement.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </TooltipProvider>
  );
};

export default QuestsModal;