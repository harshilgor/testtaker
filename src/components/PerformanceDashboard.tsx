import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Settings } from 'lucide-react';
import { useHasSolvedQuestions } from '@/hooks/useHasSolvedQuestions';
import MarathonHistorySection from './Performance/MarathonHistorySection';
import PerformanceStats from './Performance/PerformanceStats';
import QuestionAttemptStats from './Performance/QuestionAttemptStats';
import QuizHistorySection from './Performance/QuizHistorySection';
import StreakDisplay from './StreakDisplay';
import { useOptimizedStreak } from '@/hooks/useOptimizedStreak';
import PerformanceOverviewOptimized from './Performance/PerformanceOverviewOptimized';
import RecentSessions from './Performance/RecentSessions';
import PerformanceTrends from './Performance/PerformanceTrends';
import PerformanceSummary from './Performance/PerformanceSummary';


import StreakNotification from './StreakNotification';
import QuestionsSolvedCardOptimized from './QuestionsSolvedCardOptimized';
import StreakCalendar from './StreakCalendar';
import SATGoalDialog from './Goals/SATGoalDialog';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { useQuestTracking } from '@/hooks/useQuestTracking';

import StudyTimeCard from './Performance/StudyTimeCard';
import QuestionTopicsDifficulty from './Performance/QuestionTopicsDifficulty';
import MathTopicsDifficulty from './Performance/MathTopicsDifficulty';
import MasteryPerformance from './Performance/MasteryPerformance';

interface PerformanceDashboardProps {
  userName: string;
  onBack: () => void;
  onNavigateToTrends?: () => void;
}

interface QuizResult {
  score: number;
  questions: any[];
  answers: (number | null)[];
  subject: string;
  topics: string[];
  date: string;
  userName: string;
}

interface MockTestResult {
  score: number;
  questions: any[];
  answers: (number | null)[];
  date: string;
  userName: string;
  mathScore?: number;
  englishScore?: number;
}

interface MarathonSession {
  id: string;
  total_questions: number;
  correct_answers: number;
  difficulty: string;
  subjects: string[];
  created_at: string;
}

interface MarathonStats {
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
  totalSessions: number;
  bestStreak: number;
}

interface QuizStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ userName, onBack, onNavigateToTrends }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { quizResults: dataQuizResults, marathonSessions: dataMarathonSessions, mockTests: dataMockTests, loading: dataLoading } = useData();
  const { hasSolvedQuestions, loading: hasSolvedQuestionsLoading } = useHasSolvedQuestions(user);
  const { trackEvent } = useQuestTracking();

  // Track performance page visit for quest completion
  useEffect(() => {
    if (user?.id) {
      trackEvent('visit_performance');
    }
  }, [user?.id, trackEvent]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([]);
  const [marathonStats, setMarathonStats] = useState<MarathonStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    averageAccuracy: 0,
    totalSessions: 0,
    bestStreak: 0
  });
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    averageAccuracy: 0
  });
  const [showStreakNotification, setShowStreakNotification] = useState(false);
  const [previousQuestionsToday, setPreviousQuestionsToday] = useState(0);
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);
  const [satGoal, setSATGoal] = useState<number>(() => {
    const saved = localStorage.getItem('satGoal');
    return saved ? parseInt(saved) : 0;
  });
  const [showGoalDialog, setShowGoalDialog] = useState(false);

  // Widget minimization state - widgets start minimized after first visit
  const [widgetsMinimized, setWidgetsMinimized] = useState(() => {
    const hasVisitedBefore = localStorage.getItem('performancePageVisited');
    return hasVisitedBefore === 'true';
  });
  
  // Mark page as visited on first load
  useEffect(() => {
    localStorage.setItem('performancePageVisited', 'true');
  }, []);
  
  // Handle widget expansion
  const handleWidgetExpand = () => {
    setWidgetsMinimized(false);
  };

  // Fetch marathon sessions from Supabase
  const { data: marathonSessions = [], isLoading } = useQuery({
    queryKey: ['marathon-sessions-performance', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching marathon sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch quiz results from Supabase
  const { data: dbQuizResults = [] } = useQuery({
    queryKey: ['quiz-results-performance', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz results:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch user attempts for score prediction
  const { data: userAttempts = [] } = useQuery({
    queryKey: ['user-attempts-prediction', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch mock tests for score prediction
  const { data: mockTests = [] } = useQuery({
    queryKey: ['mock-tests-prediction', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching mock tests:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch difficulty breakdown from attempts - Updated to get real data
  const { data: difficultyBreakdown = { quiz: { easy: 0, medium: 0, hard: 0 }, marathon: { easy: 0, medium: 0, hard: 0 } } } = useQuery({
    queryKey: ['difficulty-breakdown', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();

      const init = { easy: 0, medium: 0, hard: 0 } as { [k: string]: number };
      const quiz = { ...init } as { [k: string]: number };
      const marathon = { ...init } as { [k: string]: number };

      // 1) From Supabase attempts (when logged in)
      if (user?.user) {
        const { data, error } = await supabase
          .from('question_attempts_v2')
          .select('difficulty, session_type')
          .eq('user_id', user.user.id);

        if (error) {
          console.error('Error fetching difficulty breakdown:', error);
        }

        (data || []).forEach((a: any) => {
          const d = String(a?.difficulty || '').toLowerCase();
          if (!['easy', 'medium', 'hard'].includes(d)) return;
          if (a?.session_type === 'quiz') {
            // @ts-ignore
            quiz[d] += 1;
          } else if (a?.session_type === 'marathon') {
            // @ts-ignore
            marathon[d] += 1;
          }
        });
      }

      // 2) Merge localStorage quizResults (covers offline or failed writes)
      try {
        const storedQuizzes = JSON.parse(localStorage.getItem('quizResults') || '[]');
        (storedQuizzes || [])
          .filter((r: any) => r?.userName === userName && Array.isArray(r?.questions))
          .forEach((r: any) => {
            (r.questions || []).forEach((q: any) => {
              const d = String(q?.difficulty || '').toLowerCase();
              if (!['easy', 'medium', 'hard'].includes(d)) return;
              // @ts-ignore
              quiz[d] += 1;
            });
          });
      } catch (e) {
        console.warn('Failed to merge local quizResults for difficulty breakdown', e);
      }

      return { quiz, marathon };
    },
    enabled: !!userName,
  });
  useEffect(() => {
    const storedQuizzes = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const storedMockTests = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
    
    setQuizResults(storedQuizzes.filter((result: QuizResult) => result.userName === userName));
    setMockTestResults(storedMockTests.filter((result: MockTestResult) => result.userName === userName));
  }, [userName]);

  useEffect(() => {
    if (dataMarathonSessions && dataMarathonSessions.length > 0) {
      const totalQuestions = dataMarathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);
      const correctAnswers = dataMarathonSessions.reduce((sum, session) => sum + (session.correct_answers || 0), 0);
      
      setMarathonStats({
        totalQuestions,
        correctAnswers,
        averageAccuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        totalSessions: dataMarathonSessions.length,
        bestStreak: 0
      });
    }
  }, [dataMarathonSessions]);

  useEffect(() => {
    // Calculate quiz stats from both localStorage and database
    const localQuizQuestions = quizResults.reduce((sum, result) => sum + result.questions.length, 0);
    const localCorrectAnswers = quizResults.reduce((sum, result) => {
      return sum + result.answers.filter((answer, index) => 
        answer === result.questions[index]?.correctAnswer
      ).length;
    }, 0);

    const dbQuizQuestions = dbQuizResults.reduce((sum, result) => sum + (result.total_questions || 0), 0);
    const dbCorrectAnswers = dbQuizResults.reduce((sum, result) => sum + (result.correct_answers || 0), 0);

    const totalQuizzes = quizResults.length + dbQuizResults.length;
    const totalQuestions = localQuizQuestions + dbQuizQuestions;
    const correctAnswers = localCorrectAnswers + dbCorrectAnswers;

    setQuizStats({
      totalQuizzes,
      totalQuestions,
      correctAnswers,
      averageAccuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    });
  }, [quizResults, dbQuizResults]);

  // Calculate totals for display
  const totalQuizQuestions = quizResults.reduce((sum, result) => sum + result.questions.length, 0);
  const totalMarathonQuestions = marathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);
  const totalQuestions = totalQuizQuestions + totalMarathonQuestions;
  
  // Enhanced SAT score prediction
  const calculateScorePrediction = () => {
    if (userAttempts.length === 0 && mockTests.length === 0) {
      return {
        totalScore: 1200,
        readingWritingScore: 600,
        mathScore: 600,
        confidence: 'low' as const,
        trend: 'stable' as const,
        scoreChange: 0
      };
    }

    // Calculate accuracy from attempts
    const totalAttempts = userAttempts.length;
    const correctAttempts = userAttempts.filter(attempt => attempt.is_correct).length;
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0.5;

    // Calculate average time per question
    const totalTime = userAttempts.reduce((sum, attempt) => sum + (attempt.time_spent || 0), 0);
    const avgTimePerQuestion = totalAttempts > 0 ? totalTime / totalAttempts : 120; // 2 minutes default

    // Base score calculation
    const baseScore = 800 + (accuracy * 800);
    
    // Adjust based on time (faster = better score)
    const timeAdjustment = Math.max(-100, Math.min(100, (120 - avgTimePerQuestion) * 2));
    
    // Adjust based on difficulty of questions attempted
    const difficultyAdjustment = userAttempts.reduce((sum, attempt) => {
      const difficulty = attempt.difficulty?.toLowerCase();
      if (difficulty === 'easy') return sum + 0;
      if (difficulty === 'medium') return sum + 50;
      if (difficulty === 'hard') return sum + 100;
      return sum;
    }, 0) / Math.max(1, totalAttempts);

    const totalScore = Math.min(1600, Math.max(400, baseScore + timeAdjustment + difficultyAdjustment));
    
    // Split into sections (rough estimate)
    const readingWritingScore = Math.round(totalScore * 0.52);
    const mathScore = Math.round(totalScore * 0.48);

    // Determine confidence and trend
    const confidence = totalAttempts > 50 ? 'high' : totalAttempts > 20 ? 'medium' : 'low';
    const trend = accuracy > 0.7 ? 'up' : accuracy < 0.5 ? 'down' : 'stable';
    const scoreChange = Math.round((accuracy - 0.6) * 200);

    return {
      totalScore: Math.round(totalScore),
      readingWritingScore,
      mathScore,
      confidence,
      trend,
      scoreChange
    };
  };

  const scorePrediction = calculateScorePrediction();

  // Calculate goal progress
  const calculateGoalProgress = () => {
    if (!satGoal) return null;

    const currentScore = scorePrediction.totalScore;
    const progress = Math.min(100, Math.max(0, (currentScore - 400) / (satGoal - 400) * 100));
    const daysRemaining = 90; // Default 90 days
    const onTrack = currentScore >= satGoal * 0.8; // 80% of goal
    const requiredDailyQuestions = onTrack ? 10 : 15;

    return {
      progress,
      onTrack,
      requiredDailyQuestions,
      daysRemaining
    };
  };

  const goalProgress = calculateGoalProgress();

  // Legacy calculation - kept for compatibility
  const predictedSATScore = Math.min(1600, Math.max(400, 800 + (marathonStats.averageAccuracy * 8)));

  // Calculate average time per question for marathon
  const avgTimePerQuestion = marathonStats.totalQuestions > 0 ? "43s" : "0s"; // Mock value

  // Get streak data with optimized performance
  const { streakData: optimizedStreakData, questionsToday, refetch: refetchStreak } = useOptimizedStreak(userName);
  
  // Fallback to legacy hook for compatibility
  const { streakData: legacyStreakData } = useOptimizedStreak(userName);
  
  // Use optimized data if available, fallback to legacy
  const streakData = optimizedStreakData || legacyStreakData;

  // Check for streak notification trigger
  useEffect(() => {
    // Show notification when user just completed their 5th question of the day
    if (questionsToday >= 5 && previousQuestionsToday < 5 && previousQuestionsToday > 0) {
      setShowStreakNotification(true);
    }
    setPreviousQuestionsToday(questionsToday);
  }, [questionsToday, previousQuestionsToday]);

  // Optimized: Only refetch when necessary, not on a timer
  // The optimized hook already handles efficient caching and updates

  const handleCloseStreakNotification = () => {
    setShowStreakNotification(false);
  };

  const handleTakeQuiz = () => {
    navigate('/quiz');
  };

  // Show loading state
  if (hasSolvedQuestionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get dates where user had activity for the calendar
  const getActivityDates = () => {
    const loginHistory = JSON.parse(localStorage.getItem('userLoginHistory') || '[]');
    return loginHistory.map((login: any) => new Date(login.date));
  };

  const activityDates = getActivityDates();

  const handleSaveGoal = (goal: number) => {
    setSATGoal(goal);
    localStorage.setItem('satGoal', goal.toString());
    setShowGoalDialog(false);
    toast({
      title: "Goal Updated",
      description: `Your SAT goal has been set to ${goal}. Keep practicing to reach it!`,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
          <p className="text-gray-600">Track your performance across different topics and difficulty levels</p>
        </div>

        {/* Content area - blur only this section */}
        <div className={`${!hasSolvedQuestions ? 'blur-sm pointer-events-none' : ''}`}>


        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Streak */}
          <Card 
            className="bg-white border-0 shadow-sm h-full cursor-pointer hover:shadow-md transition-shadow"
            onClick={widgetsMinimized ? handleWidgetExpand : undefined}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Current Streak</h3>
                {/* Settings button to view calendar (replaces bottom View Calendar) */}
                {!widgetsMinimized && (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStreakCalendar(true);
                    }}
                  className="p-1 rounded hover:bg-orange-50 transition-colors"
                  title="View calendar"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
                )}
              </div>
              <div className="flex items-center gap-3 mb-1">
                <div className="text-4xl font-bold text-gray-900">
                  {streakData?.current_streak || 0}
                </div>
                <Flame 
                  className={`text-5xl transition-all ${
                    questionsToday >= 5 
                      ? 'text-orange-500' 
                      : 'text-gray-300'
                  }`}
                />
              </div>
              <div className="text-xs text-gray-600 mb-2">Day Streak</div>
              
              {!widgetsMinimized && (
                <>
                  {/* Week progress circles */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Next milestone: {((streakData?.current_streak || 0) + (7 - ((streakData?.current_streak || 0) % 7)))} days
                  </div>
                  <div className="flex justify-between items-center">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                      const dayOfWeek = new Date().getDay();
                      const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                      const currentStreak = streakData?.current_streak || 0;
                      
                      // Calculate which bubbles should be filled based on current streak
                      const isToday = index === mondayIndex;
                      
                      // For today, check if user has completed 5 questions
                      if (isToday) {
                        const shouldBeFilled = questionsToday >= 5;
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full mb-1 ${
                              shouldBeFilled ? 'bg-orange-500' : 'bg-gray-300'
                            }`}></div>
                            <div className="text-xs text-gray-400">{day}</div>
                          </div>
                        );
                      }
                      
                      // For past days, fill based on streak count going backwards from yesterday
                      const daysBack = mondayIndex - index;
                      const shouldBeFilled = daysBack > 0 && daysBack <= (currentStreak - (questionsToday >= 5 ? 1 : 0));
                      
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full mb-1 ${
                            shouldBeFilled ? 'bg-orange-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="text-xs text-gray-400">{day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              
              {questionsToday < 5 ? (
                <div className="text-xs text-orange-600 font-medium mb-3 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                  Solve {5 - questionsToday} more questions to count today's streak!
                </div>
              ) : (
                <div className="text-xs text-green-700 font-medium mb-3 px-3 py-2 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                  <span>✓</span> Great! Today's streak counted
                </div>
              )}

              {/* Removed bottom View Calendar button to reduce height */}
                </>
              )}
            </CardContent>
          </Card>

          {/* Predicted SAT Score */}
          <Card 
            className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={widgetsMinimized ? handleWidgetExpand : undefined}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Predicted SAT Score</h3>
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{scorePrediction.totalScore}</div>
              <div className="text-xs text-gray-600 mb-2">Based on your performance</div>
              
              {!widgetsMinimized && (
                <>
              {/* Score breakdown */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-gray-900">{scorePrediction.readingWritingScore}</div>
                  <div className="text-xs text-gray-600">Reading & Writing</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-gray-900">{scorePrediction.mathScore}</div>
                  <div className="text-xs text-gray-600">Math</div>
                </div>
              </div>

              {/* Goal progress */}
              {goalProgress && (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">Goal Progress</span>
                    <span className="text-xs font-semibold text-gray-900">{Math.round(goalProgress.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${goalProgress.onTrack ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${goalProgress.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {goalProgress.onTrack ? <span className="font-medium">On track!</span> : `Need ${goalProgress.requiredDailyQuestions} questions/day`}
                  </div>
                </div>
              )}

              {/* Set Goal Button */}
              <Button
                variant="outline"
                size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGoalDialog(true);
                    }}
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                {satGoal ? `Update Goal (${satGoal})` : 'Set Goal'}
              </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Study Time */}
          <StudyTimeCard 
            userName={userName} 
            isMinimized={widgetsMinimized}
            onExpand={handleWidgetExpand}
          />

          {/* Questions Solved */}
          <QuestionsSolvedCardOptimized 
            userName={userName} 
            marathonStats={marathonStats}
            isMinimized={widgetsMinimized}
            onExpand={handleWidgetExpand}
          />
        </div>

        {/* Mastery Section - 2/3 + 1/3 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 h-full">
            <MasteryPerformance />
          </div>
          <div className="lg:col-span-1 h-full">
            {/* Empty space or other component if needed */}
          </div>
        </div>

        {/* Best Performing Topics & Recent Sessions - Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Best Performing Topics */}
          <div className="lg:col-span-2 h-full">
            <PerformanceOverviewOptimized userName={userName} />
          </div>
          
          {/* Recent Sessions */}
          <div className="lg:col-span-1 h-full">
            <RecentSessions userName={userName} onViewTrends={onNavigateToTrends} />
          </div>
        </div>


        {/* Performance Trends Section - 2/3 + 1/3 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 h-full">
            <PerformanceTrends userName={userName} />
          </div>
          <div className="lg:col-span-1 h-full">
            <PerformanceSummary userName={userName} />
          </div>
        </div>

        {/* Question Topics & Difficulty Section */}
        <div className="mb-6">
          <QuestionTopicsDifficulty />
        </div>

        {/* Math Topics & Difficulty Section */}
        <div className="mb-6">
          <MathTopicsDifficulty />
        </div>

        </div>
      </div>

      {/* Streak Calendar Modal */}
      <StreakCalendar
        isOpen={showStreakCalendar}
        onClose={() => setShowStreakCalendar(false)}
        activityDates={activityDates}
      />

      {/* SAT Goal Dialog */}
      <SATGoalDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
        initialGoal={satGoal || 1400}
        onSave={handleSaveGoal}
      />

      {/* Streak Notification */}
      <StreakNotification
        streakCount={streakData?.current_streak || 0}
        onClose={handleCloseStreakNotification}
        isVisible={showStreakNotification}
      />

      {/* Simple overlay message when user hasn't solved questions */}
      {!hasSolvedQuestions && (
        <div className="fixed top-20 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Solve some questions first</h2>
            <p className="text-gray-600 mb-6">
              Take a practice quiz to unlock all performance features and get personalized analytics.
            </p>
            <button
              onClick={handleTakeQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              Start Practice Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
