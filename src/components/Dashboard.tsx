import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Zap, Clock, BookOpen, Brain, Settings, Trophy, Target, Calendar } from 'lucide-react';
import AdminPanel from './AdminPanel';
import { useSecureAdminAccess } from '@/hooks/useSecureAdminAccess';
import { useNavigate } from 'react-router-dom';
import QuestsModal from './Quests/QuestsModal';
import ConfettiAnimation from './ConfettiAnimation';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import RecentSessionsPrefetcher from './Performance/RecentSessionsPrefetcher';
import WidgetCarousel from './Widgets/WidgetCarousel';
import { generateAdaptiveQuest, calculateSkillScore, SkillScore } from '@/utils/adaptiveQuestSystem';
import { useSimpleToast } from '@/components/ui/simple-toast';
import { useQueryClient } from '@tanstack/react-query';

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
  const [questStats, setQuestStats] = useState({ completed: 0, total: 0 });
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [userQuests, setUserQuests] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const { isAdmin } = useSecureAdminAccess();
  const navigate = useNavigate();
  const { showToast } = useSimpleToast();
  const queryClient = useQueryClient();

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

      // Update local state to mark quest as completed
      setUserQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, completed: true, progress: 100 } : q
      ));

      // Update quest stats - increment completed count
      setQuestStats(prev => ({ ...prev, completed: prev.completed + 1 }));

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
      // If it's a real quest from the database, update its progress
      if (quest.id) {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          // Update quest progress to mark it as started
          await supabase
            .from('user_quests')
            .update({ current_progress: 1 })
            .eq('id', quest.id);
          
          // Update local state to show the quest as started
          setUserQuests(prev => prev.map(q => 
            q.id === quest.id ? { ...q, progress: 1, progressText: `1/${q.target_count || 10} questions` } : q
          ));
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

  // Fetch quest statistics
  useEffect(() => {
    const fetchQuestStats = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data: quests, error } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_id', user.user.id)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(3); // Show only 3 most recent quests

        if (error) {
          console.error('Error fetching quest stats:', error);
          return;
        }

        const dailyQuests = quests?.filter(q => q.quest_type === 'daily') || [];
        const completed = dailyQuests.filter(q => q.completed).length;
        const total = dailyQuests.length;

        setQuestStats({ completed, total });
        
        // Check for completed quests in the database
        const { data: completedQuests } = await supabase
          .from('quest_completions')
          .select('quest_id')
          .eq('user_id', user.user.id);

        const completedQuestIds = new Set(completedQuests?.map(q => q.quest_id) || []);

        // Always show founder-designed quests for ALL users
        const founderQuests = generateDynamicQuests();
        
        // Update quest completion status based on database
        const questsWithCompletionStatus = founderQuests.map(quest => ({
          ...quest,
          completed: completedQuestIds.has(quest.id),
          // @ts-expect-error - Quest type needs target property
          progress: completedQuestIds.has(quest.id) ? quest.target : 0
        }));

        // Update quest stats to count only active (non-completed) quests
        const activeQuests = questsWithCompletionStatus.filter(q => !q.completed);
        const completedCount = questsWithCompletionStatus.filter(q => q.completed).length;
        const totalCount = questsWithCompletionStatus.length;
        
        setQuestStats({ completed: completedCount, total: totalCount });
        setUserQuests(questsWithCompletionStatus);
      } catch (error) {
        console.error('Error in fetchQuestStats:', error);
      } finally {
        setLoadingQuests(false);
      }
    };

    fetchQuestStats();
  }, []);

  if (showAdminPanel) {
    return <AdminPanel />;
  }

  const handleMockTestSelect = () => {
    navigate('/sat-mock-test');
  };

  return (
        <div className="h-screen flex flex-col px-4 py-6 overflow-hidden">
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
                <Card className="w-full xl:w-80 h-96 xl:h-[32rem] bg-white border-gray-200 flex flex-col">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Live Quests</h3>
                        <p className="text-xs text-gray-600">{questStats.completed}/9 completed</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {loadingQuests ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <div className="space-y-3 pr-1">
                          {/* Show real quests if available, otherwise show generated quests */}
                          {(userQuests.length > 0 ? userQuests : generateDynamicQuests())
                            .filter(quest => !quest.completed) // Filter out completed quests
                            .sort((a, b) => {
                              // Sort started quests (progress > 0) to the top
                              if (a.progress > 0 && b.progress === 0) return -1;
                              if (a.progress === 0 && b.progress > 0) return 1;
                              return 0;
                            })
                            .map((quest, index) => (
                            <div 
                              key={quest.id || index} 
                              className="bg-gray-50 rounded border border-gray-200 p-3 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                              onClick={() => handleQuestClick(quest)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-900">{quest.title}</span>
                                <span className="text-xs text-blue-600 font-medium">+{quest.points}</span>
                              </div>
                              {/* Show description for onboarding quests */}
                              {quest.description && (
                                <div className="text-xs text-gray-600 mb-1">
                                  {quest.description}
                                </div>
                              )}
                              {/* Only show progress bar if quest has been started */}
                              {quest.progress > 0 && (
                                <>
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div 
                                      className="bg-blue-500 h-1 rounded-full" 
                                      style={{ width: `${quest.progress}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">{quest.progressText}</div>
                                </>
                              )}
                              
                              {/* Quest completion status */}
                              {quest.completed && (
                                <div className="mt-2 flex justify-end">
                                  <span className="text-xs text-green-600 font-medium">✓ Completed</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => setShowQuestsModal(true)}
                      className="w-full mt-auto bg-gray-600 hover:bg-gray-700 text-white text-xs py-2 rounded"
                    >
                      View All Quests
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Center - Practice Modes - Stacked Vertically */}
              <div className="w-full xl:flex-1 xl:max-w-md">
                <div className="space-y-4 xl:space-y-6 h-full">
                  {/* Practice Card */}
                  <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl flex-1">
                    <CardContent className="p-4 lg:p-6 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-4 lg:gap-6">
                        <div className="bg-purple-50 rounded-full p-3 lg:p-4 w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center flex-shrink-0">
                          <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">Practice</h3>
                          <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              Custom
                            </div>
                            <div className="flex items-center">
                              <Brain className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              Targeted
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={onQuizSelect} 
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base rounded-lg flex-shrink-0"
                        >
                          Create
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mock Test Card */}
                  <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl flex-1">
                    <CardContent className="p-4 lg:p-6 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-4 lg:gap-6">
                        <div className="bg-blue-50 rounded-full p-3 lg:p-4 w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">Mock Test</h3>
                          <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              Real Format
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              Timed
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={handleMockTestSelect} 
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base rounded-lg flex-shrink-0"
                        >
                          Take Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Study Plan Card */}
                  <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl flex-1">
                    <CardContent className="p-4 lg:p-6 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-4 lg:gap-6">
                        <div className="bg-green-50 rounded-full p-3 lg:p-4 w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">Study Plan</h3>
                          <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <Target className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              Goal Setting
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              Personalized
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={onNavigateToStudyPlan} 
                          className="bg-green-500 hover:bg-green-600 text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base rounded-lg flex-shrink-0"
                        >
                          Create Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Side - Your Stats Widget */}
              <div className="w-full xl:w-80 xl:flex-shrink-0">
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
              // Refresh quest stats and quest list when a quest is completed
              const fetchQuestStats = async () => {
                try {
                  const { data: user } = await supabase.auth.getUser();
                  if (!user.user) return;

                  const { data: quests, error } = await supabase
                    .from('user_quests')
                    .select('*')
                    .eq('user_id', user.user.id)
                    .gte('expires_at', new Date().toISOString())
                    .order('created_at', { ascending: false })
                    .limit(3);

                  if (error) {
                    console.error('Error fetching quest stats:', error);
                    return;
                  }

                  const dailyQuests = quests?.filter(q => q.quest_type === 'daily') || [];
                  const completed = dailyQuests.filter(q => q.completed).length;
                  const total = dailyQuests.length;

                  setQuestStats({ completed, total });
                  
                  // Update quest list with fresh data
                  if (quests && quests.length > 0) {
                    const formattedQuests = quests.map(quest => ({
                      id: quest.id,
                      title: quest.quest_title,
                      points: quest.points_reward,
                      progress: quest.current_progress || 0,
                      progressText: `${quest.current_progress || 0}/${quest.target_count} questions`,
                      topic: quest.target_topic,
                      subject: quest.target_topic?.toLowerCase().includes('algebra') || 
                              quest.target_topic?.toLowerCase().includes('geometry') || 
                              quest.target_topic?.toLowerCase().includes('math') ? 'math' : 'english',
                      completed: quest.completed,
                      expiresAt: new Date(quest.expires_at)
                    }));
                    setUserQuests(formattedQuests);
                  }
                } catch (error) {
                  console.error('Error in fetchQuestStats:', error);
                }
              };

              fetchQuestStats();
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
