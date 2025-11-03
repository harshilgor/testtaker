import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, Clock, BookOpen, Brain, Settings, Trophy } from 'lucide-react';
import AdminPanel from './AdminPanel';
import { useSecureAdminAccess } from '@/hooks/useSecureAdminAccess';
import { useNavigate } from 'react-router-dom';
import QuestsModal from './Quests/QuestsModal';
import ConfettiAnimation from './ConfettiAnimation';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import RecentSessionsPrefetcher from './Performance/RecentSessionsPrefetcher';
import WidgetCarousel from './Widgets/WidgetCarousel';
import LearningPlanCard from '@/components/LearningPlanCard';
import MasteryCard from '@/components/MasteryCard';
import TargetMyWeakness from '@/components/TargetMyWeakness';
import { generateAdaptiveQuest, calculateSkillScore, SkillScore } from '@/utils/adaptiveQuestSystem';
import { useSimpleToast } from '@/components/ui/simple-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useQuests } from '@/hooks/useQuests';

interface DashboardProps {
  userName: string;
  onMockTestSelect: () => void;
  onQuizSelect: () => void;
  onNavigateToLeaderboard: () => void;
  onNavigateToStudyPlan: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  onMockTestSelect,
  onQuizSelect,
  onNavigateToLeaderboard,
  onNavigateToStudyPlan
}) => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const { isAdmin } = useSecureAdminAccess();
  const navigate = useNavigate();
  const { showToast } = useSimpleToast();
  const queryClient = useQueryClient();

  // Get user ID for quest caching
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    const getUser = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        setUserId(user.user.id);
      }
    };
    getUser();
  }, []);

  // Use quest caching hook
  const { quests: cachedQuests, questStats: cachedQuestStats, isLoading: questsLoading, refreshQuests } = useQuests({ 
    userId, 
    enabled: !!userId 
  });

  // Optimistic quest state for instant UI updates (0ms latency)
  const [optimisticQuests, setOptimisticQuests] = useState<any[]>([]);
  const [optimisticStats, setOptimisticStats] = useState({ completed: 0, total: 0 });

  // Sync optimistic state with cached quests
  useEffect(() => {
    setOptimisticQuests(cachedQuests);
    setOptimisticStats(cachedQuestStats);
  }, [cachedQuests, cachedQuestStats]);

  // Listen for quest completion events - INSTANT optimistic update (0ms latency)
  useEffect(() => {
    const handleQuestCompleted = (event: CustomEvent) => {
      const completedQuestIds = event.detail?.questIds || [];
      
      if (completedQuestIds.length > 0) {
        // INSTANT UPDATE - Remove completed quests immediately (0ms)
        setOptimisticQuests(prev => {
          const filtered = prev.filter(q => !completedQuestIds.includes(q.id));
          return filtered;
        });

        // INSTANT UPDATE - Update stats immediately
        setOptimisticStats(prev => ({
          completed: prev.completed + completedQuestIds.length,
          total: prev.total
        }));

        console.log('⚡ INSTANT: Removed completed quests from Live Quests display');
      }

      // Refresh from database in background (non-blocking)
      refreshQuests();
    };
    
    window.addEventListener('quest-completed', handleQuestCompleted as EventListener);
    return () => {
      window.removeEventListener('quest-completed', handleQuestCompleted as EventListener);
    };
  }, [refreshQuests]);

  // Handle quest completion and award points
  const handleQuestCompletion = async (questId: string, questPoints: number) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      // Award points to user
      const { error: pointsError } = await supabase.rpc('increment_user_points', {
        p_points: questPoints,
        p_user_id: user.user.id
      });

      if (pointsError) {
        console.error('Error awarding points:', pointsError);
        return;
      }

      // Save quest completion to database for persistence
      const { error: completionError } = await supabase
        .from('quest_completions')
        .insert({
          user_id: user.user.id,
          quest_id: questId,
          points_awarded: questPoints
        });

      if (completionError) {
        console.error('Error saving quest completion:', completionError);
        return;
      }

      // Quest data is now managed by the useQuests hook

      // Quest stats are now managed by the useQuests hook

      // Trigger confetti animation
      setShowConfetti(true);

      // Invalidate leaderboard cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });

      // Show congratulatory toast notification
      showToast({
        title: 'Quest Completed! 🎉',
        description: `Congratulations! You earned ${questPoints} points!`,
        type: 'success',
        duration: 6000
      });

      // Refresh cached quests
      refreshQuests();

    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  // Generate adaptive quests for existing users based on performance analysis
  const generateAdaptiveQuestsForExistingUsers = () => {
    // This would typically fetch real performance data from the database
    // For now, we'll simulate some performance data to demonstrate the system
    
    // Mock performance data - in real implementation, this would come from database
    const mockPerformanceData = [
      { rawScore: 75, errors: 2, timestamp: new Date(), skill: 'Logic' as const },
      { rawScore: 80, errors: 1, timestamp: new Date(), skill: 'Memory' as const },
      { rawScore: 65, errors: 3, timestamp: new Date(), skill: 'Speed' as const },
      { rawScore: 70, errors: 2, timestamp: new Date(), skill: 'Focus' as const }
    ];

    // Calculate skill scores
    const skillScores = calculateSkillScore(mockPerformanceData);
    
    // Generate adaptive quest
    const adaptiveQuest = generateAdaptiveQuest(skillScores);
    
    // Convert to quest format for display
    return [{
      title: adaptiveQuest.title,
      description: adaptiveQuest.description,
      points: adaptiveQuest.points,
      progress: 0,
      progressText: `0/${adaptiveQuest.questionCount} questions`,
      topic: adaptiveQuest.targetSkill.toLowerCase(),
      subject: 'both',
      feature: 'adaptive_quiz',
      targetSkill: adaptiveQuest.targetSkill,
      difficulty: adaptiveQuest.difficulty,
      objective: adaptiveQuest.objective,
      targetAccuracy: adaptiveQuest.targetAccuracy,
      questionCount: adaptiveQuest.questionCount,
      timeLimit: adaptiveQuest.timeLimit
    }];
  };

  // Generate dynamic quests - ALWAYS show founder-designed quests for ALL users
  const generateDynamicQuests = () => {
    // Show founder-designed onboarding quests for ALL users
    return [
      {
        id: "welcome-quest",
        title: "Welcome to the platform! I'm Harshil, the founder 🚀",
        description: "I encourage you to contact me directly at harshilgor06@gmail.com with any feedback. I hope you love it LETS GET THAT 1600 !!!! 😎🙏",
        points: 50,
        progress: 0,
        progressText: "0/1 welcome",
        topic: "welcome",
        subject: "general",
        feature: "welcome",
        completed: false
      },
      {
        id: "leaderboard-quest",
        title: "Visit the Leaderboard 📈",
        description: "See how you compare with other SAT students and track your progress against the community.",
        points: 25,
        progress: 0,
        progressText: "0/1 visit",
        topic: "leaderboard",
        subject: "general",
        feature: "leaderboard",
        completed: false
      },
      {
        id: "practice-quest",
        title: "Explore the Practice Tab 📕",
        description: "Navigate to the Practice section on the Home page to customize and engage with various question styles.",
        points: 30,
        progress: 0,
        progressText: "0/1 exploration",
        topic: "practice",
        subject: "general",
        feature: "practice",
        completed: false
      },
      {
        id: "custom-quiz-quest",
        title: "Create Your First Custom Quiz 💬",
        description: "Use the Practice tool to generate a short, 10-question quiz on any topic of your choice.",
        points: 40,
        progress: 0,
        progressText: "0/10 questions",
        topic: "custom_quiz",
        subject: "both",
        feature: "quiz",
        completed: false
      },
      {
        id: "learn-quest",
        title: "Review Your Errors on the Learn Page 📜",
        description: "Visit the Learn section to review every question you have answered incorrectly across the platform.",
        points: 35,
        progress: 0,
        progressText: "0/1 review",
        topic: "learn",
        subject: "general",
        feature: "learn",
        completed: false
      },
      {
        id: "performance-quest",
        title: "Analyze Your Performance 📊",
        description: "Access the dedicated Performance page to view detailed analytics and metrics on your progress.",
        points: 30,
        progress: 0,
        progressText: "0/1 analysis",
        topic: "performance",
        subject: "general",
        feature: "performance",
        completed: false
      },
      {
        id: "mock-test-explore-quest",
        title: "Explore the Mock Test Section 📚",
        description: "View the available full-length practice tests and understand the testing interface.",
        points: 25,
        progress: 0,
        progressText: "0/1 exploration",
        topic: "mock_test_explore",
        subject: "general",
        feature: "mock_test",
        completed: false
      },
      {
        id: "mock-test-complete-quest",
        title: "Complete a Full Mock Test 📖",
        description: "Schedule and take one of the available mock exams to get a baseline score.",
        points: 60,
        progress: 0,
        progressText: "0/1 mock test",
        topic: "mock_test_complete",
        subject: "both",
        feature: "mock_test",
        completed: false
      },
      {
        id: "ai-analysis-quest",
        title: "Activate AI Weakness Analysis 😎",
        description: "Go to the Practice page, check your personalized AI Weakness Analysis, and complete the recommended quiz that targets your weakest area.",
        points: 45,
        progress: 0,
        progressText: "0/1 analysis",
        topic: "ai_analysis",
        subject: "both",
        feature: "ai_analysis",
        completed: false
      }
    ];
  };

  // Handle quest click
  const handleQuestClick = (quest: any) => {
    setSelectedQuest(quest);
    handleStartQuest(quest);
  };

  // Handle starting a quest
  const handleStartQuest = async (quest: any) => {
    try {
      // If it's a database quest (UUID id), update its progress
      const isUuid = typeof quest.id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(quest.id);
      if (isUuid) {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          await supabase
            .from('user_quests')
            .update({ current_progress: 1 })
            .eq('id', quest.id);
          // Refresh quests cache for Live Quests card
          refreshQuests();
        }
      }
      
      // Handle different quest types
      switch (quest.feature) {
        case 'welcome':
          // Show welcome message and contact info
          console.log('Welcome to the platform! 🚀 I\'m Harshil, the founder. Contact me at harshilgor06@gmail.com with any feedback. LET\'S GET THAT 1600!!! 😎🙏');
          // Mark quest as completed and award points
          handleQuestCompletion(quest.id, quest.points);
          break;
        case 'quiz':
          // Navigate to quiz with quest parameters
          navigate('/quiz', { 
            state: { 
              autoSelectTopic: quest.topic,
              subject: quest.subject,
              questionCount: quest.title.includes('10') ? 10 : quest.title.includes('15') ? 15 : quest.title.includes('12') ? 12 : quest.title.includes('8') ? 8 : 5
            }
          });
          break;
        case 'leaderboard':
          // Navigate to leaderboard page using state-based navigation
          onNavigateToLeaderboard();
          break;
        case 'performance':
          // Navigate to performance dashboard
          navigate('/performance');
          break;
        case 'practice':
          // Navigate to practice section (home page)
          navigate('/');
          break;
        case 'learn':
          // Navigate to learn page
          navigate('/learn');
          break;
        case 'mock_test':
          // Navigate to mock test
          navigate('/sat-mock-test');
          break;
        case 'ai_analysis':
          // Navigate to practice with AI analysis
          navigate('/quiz', { 
            state: { 
              aiAnalysis: true,
              subject: quest.subject
            }
          });
          break;
        case 'adaptive_quiz':
          // Navigate to adaptive quiz with specific parameters
          navigate('/quiz', { 
            state: { 
              adaptiveMode: true,
              targetSkill: quest.targetSkill,
              difficulty: quest.difficulty,
              questionCount: quest.questionCount,
              timeLimit: quest.timeLimit,
              targetAccuracy: quest.targetAccuracy,
              objective: quest.objective
            }
          });
          break;
        default:
          // Default to quiz navigation
          navigate('/quiz', { 
            state: { 
              autoSelectTopic: quest.topic,
              subject: quest.subject,
              questionCount: quest.title.includes('10') ? 10 : quest.title.includes('15') ? 15 : quest.title.includes('12') ? 12 : 5
            }
          });
      }
    } catch (error) {
      console.error('Error starting quest:', error);
      // Still navigate even if database update fails
      // Default to quiz navigation as fallback
      navigate('/quiz', { 
        state: { 
          autoSelectTopic: quest.topic,
          subject: quest.subject,
          questionCount: quest.title.includes('10') ? 10 : quest.title.includes('15') ? 15 : quest.title.includes('12') ? 12 : 5
        }
      });
    }
  };

  // Quest loading is now handled by the useQuests hook

  if (showAdminPanel) {
    return <AdminPanel />;
  }

  const handleMockTestSelect = () => {
    navigate('/sat-mock-test');
  };

  return (
        <div className="min-h-screen flex flex-col px-4 py-6 overflow-y-auto">
          {/* Pre-fetch recent sessions data for instant loading on Performance page */}
          <RecentSessionsPrefetcher userName={userName} />
          
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col px-4 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Welcome back, {userName}!
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    onClick={() => setShowAdminPanel(true)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 min-h-[40px] min-w-[40px]"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Main Content - Live Quests + Practice Modes + Widgets */}
            <div className="flex-1 flex flex-col xl:flex-row items-start gap-4 xl:gap-6 overflow-hidden">
              {/* Left Side - Live Quests (Responsive) */}
              <div className="w-full xl:w-80 xl:flex-shrink-0">
                <Card className="w-full xl:w-80 rounded-2xl border border-gray-200 shadow-sm bg-white flex flex-col">
                  <CardContent className="p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Live Quests</h3>
                        <p className="text-sm text-gray-600">{(optimisticStats.completed || cachedQuestStats.completed)}/{(optimisticStats.total || cachedQuestStats.total)} completed</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      {questsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {/* Show only first 3 active quests that fit in the container */}
                          {/* Use optimistic state for instant updates (0ms latency) */}
                          {(() => {
                            const activeQuests = (optimisticQuests.length > 0 ? optimisticQuests : cachedQuests)
                              .filter(quest => {
                                // Only show active (non-completed) quests
                                if (quest.completed) return false;
                                // Also filter out expired quests
                                if (quest.expiresAt && new Date(quest.expiresAt) < new Date()) return false;
                                return true;
                              })
                              .sort((a, b) => {
                                // Sort started quests (progress > 0) to the top
                                if (a.progress > 0 && b.progress === 0) return -1;
                                if (a.progress === 0 && b.progress > 0) return 1;
                                return 0;
                              })
                              .slice(0, 3); // Limit to 3 quests max to ensure button is visible

                            if (activeQuests.length === 0) {
                              return (
                                <div className="text-center py-4">
                                  <p className="text-sm text-gray-500">No active quests. Complete more to unlock new ones!</p>
                                </div>
                              );
                            }

                            return activeQuests.map((quest, index) => (
                              <div 
                                key={quest.id || index} 
                                className="rounded-xl border border-gray-200 bg-white p-2.5 cursor-pointer hover:shadow-sm transition-all duration-200"
                                onClick={() => handleQuestClick(quest)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">{quest.title}</span>
                                  <span className="text-xs text-blue-600 font-semibold ml-2 flex-shrink-0">+{quest.points}</span>
                                </div>
                                {quest.description && (
                                  <div className="text-xs text-gray-600 mb-1.5 line-clamp-2">
                                    {quest.description}
                                  </div>
                                )}
                                {quest.progress > 0 && (
                                  <>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                      <div 
                                        className="bg-blue-500 h-1.5 rounded-full transition-all" 
                                        style={{ width: `${(quest.progress / (quest.target || 1)) * 100}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500">{quest.progressText || `${quest.progress}/${quest.target || 1}`}</div>
                                  </>
                                )}
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setShowQuestsModal(true)}
                      className="w-full mt-3 pt-3 border-t border-gray-200 text-blue-600 text-sm font-medium hover:underline text-left flex-shrink-0"
                    >
                      View all quests
                    </button>
                  </CardContent>
                </Card>
                
                {/* Mastery Card - Below Live Quests */}
                <div className="mt-4">
                  <MasteryCard />
                </div>
              </div>

              {/* Center - Practice Modes - Stacked Vertically */}
              <div className="w-full xl:flex-1 xl:max-w-md">
                <div className="space-y-4 xl:space-y-6 h-full">
                  {/* Practice Card */}
                  <Card className="rounded-2xl border border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-gray-900">Practice</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm mb-4">
                        Custom and targeted practice sessions tailored to your needs.
                      </p>
                      <Button 
                        onClick={onQuizSelect} 
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Create
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Mock Test Card */}
                  <Card className="rounded-2xl border border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-gray-900">Mock Test</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm mb-4">
                        Full-length timed practice tests in real SAT format.
                      </p>
                      <Button 
                        onClick={handleMockTestSelect} 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Take Test
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Target My Weakness Component */}
                <div className="mt-4">
                  <TargetMyWeakness />
                </div>
              </div>

              {/* Right Side - Learning Plan + Your Stats Widget */}
              <div className="w-full xl:w-80 xl:flex-shrink-0">
                <div className="mb-4">
                  <LearningPlanCard onEdit={onNavigateToStudyPlan} />
                </div>
                <div className="w-full xl:w-80 h-64 xl:h-64 overflow-hidden">
                  <WidgetCarousel />
                </div>
              </div>
            </div>
      </div>

      {/* Quests Modal */}
      <QuestsModal 
        open={showQuestsModal}
        onClose={() => setShowQuestsModal(false)}
        userName={userName}
        onNavigateToLeaderboard={onNavigateToLeaderboard}
        onQuestCompleted={() => {
          // Refresh cached quests when a quest is completed
          refreshQuests();
        }}
      />

      {/* Confetti Animation */}
      <ConfettiAnimation 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

    </div>
  );
};

export default Dashboard;
