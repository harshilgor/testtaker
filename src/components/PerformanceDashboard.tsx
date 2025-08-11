import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MarathonHistorySection from './Performance/MarathonHistorySection';
import PerformanceStats from './Performance/PerformanceStats';
import QuestionAttemptStats from './Performance/QuestionAttemptStats';
import QuizHistorySection from './Performance/QuizHistorySection';
import StreakDisplay from './StreakDisplay';
import { useUserStreak } from '@/hooks/useUserStreak';
import PerformanceOverview from './Performance/PerformanceOverview';
import RecentSessions from './Performance/RecentSessions';
import PerformanceTrends from './Performance/PerformanceTrends';
import CompetitiveLandscape from './Performance/CompetitiveLandscape';
import TimePacingAnalysis from './Performance/TimePacingAnalysis';
import StreakNotification from './StreakNotification';
import QuestionsSolvedCard from './QuestionsSolvedCard';
import { useOptimizedStreak } from '@/hooks/useOptimizedStreak';
import StreakCalendar from './StreakCalendar';

interface PerformanceDashboardProps {
  userName: string;
  onBack: () => void;
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

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ userName, onBack }) => {
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

  // Fetch difficulty breakdown from attempts
  const { data: difficultyBreakdown = { quiz: { easy: 0, medium: 0, hard: 0 }, marathon: { easy: 0, medium: 0, hard: 0 } } } = useQuery({
    queryKey: ['difficulty-breakdown', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { quiz: { easy: 0, medium: 0, hard: 0 }, marathon: { easy: 0, medium: 0, hard: 0 } };

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('difficulty, session_type')
        .eq('user_id', user.user.id);

      if (error || !data) {
        console.error('Error fetching difficulty breakdown:', error);
        return { quiz: { easy: 0, medium: 0, hard: 0 }, marathon: { easy: 0, medium: 0, hard: 0 } };
      }

      const init = { easy: 0, medium: 0, hard: 0 } as { [k: string]: number };
      const quiz = { ...init } as { [k: string]: number };
      const marathon = { ...init } as { [k: string]: number };

      (data as { difficulty: string | null; session_type: string | null }[]).forEach((a) => {
        const d = (a.difficulty || '').toLowerCase();
        if (!['easy', 'medium', 'hard'].includes(d)) return;
        if (a.session_type === 'quiz') {
          // @ts-ignore
          quiz[d] += 1;
        } else if (a.session_type === 'marathon') {
          // @ts-ignore
          marathon[d] += 1;
        }
      });

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
    if (marathonSessions.length > 0) {
      const totalQuestions = marathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);
      const correctAnswers = marathonSessions.reduce((sum, session) => sum + (session.correct_answers || 0), 0);
      
      setMarathonStats({
        totalQuestions,
        correctAnswers,
        averageAccuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        totalSessions: marathonSessions.length,
        bestStreak: 0
      });
    }
  }, [marathonSessions]);

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
  
  // Calculate SAT prediction (simplified - would need more complex logic in real app)
  const predictedSATScore = Math.min(1600, Math.max(400, 800 + (marathonStats.averageAccuracy * 8)));
  
  // Calculate real study time based on session data
  const calculateStudyTime = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate TODAY's study time from marathon sessions (assume 1.5 mins per question)
    const marathonTimeToday = marathonSessions
      .filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= today;
      })
      .reduce((sum, session) => sum + (session.total_questions || 0) * 1.5, 0);

    // Calculate THIS MONTH's study time from marathon sessions
    const marathonTimeThisMonth = marathonSessions
      .filter(session => new Date(session.created_at) >= thisMonth)
      .reduce((sum, session) => sum + (session.total_questions || 0) * 1.5, 0);

    const marathonTimeThisWeek = marathonSessions
      .filter(session => new Date(session.created_at) >= thisWeek)
      .reduce((sum, session) => sum + (session.total_questions || 0) * 1.5, 0);

    // Calculate TODAY's study time from quiz sessions (assume 2 mins per question for quizzes)
    const quizTimeToday = dbQuizResults
      .filter(result => {
        const resultDate = new Date(result.created_at);
        return resultDate >= today;
      })
      .reduce((sum, result) => sum + (result.total_questions || 0) * 2, 0);

    // Calculate THIS MONTH's study time from quiz sessions
    const quizTimeThisMonth = dbQuizResults
      .filter(result => new Date(result.created_at) >= thisMonth)
      .reduce((sum, result) => sum + (result.total_questions || 0) * 2, 0);

    const quizTimeThisWeek = dbQuizResults
      .filter(result => new Date(result.created_at) >= thisWeek)
      .reduce((sum, result) => sum + (result.total_questions || 0) * 2, 0);

    return {
      todayMinutes: marathonTimeToday + quizTimeToday,
      thisMonthMinutes: marathonTimeThisMonth + quizTimeThisMonth,
      thisWeekMinutes: marathonTimeThisWeek + quizTimeThisWeek,
    };
  };

  const studyTimeData = calculateStudyTime();
  
  // Format today's study time
  const todayStudyTime = studyTimeData.todayMinutes;
  const todayHours = todayStudyTime / 60;
  const todayDisplay = todayHours >= 1 
    ? { value: todayHours.toFixed(1), unit: 'Hours studied today' }
    : { value: Math.round(todayStudyTime).toString(), unit: 'Minutes studied today' };
  
  // This month's study time in hours
  const thisMonthHours = Math.round(studyTimeData.thisMonthMinutes / 60);
  const dailyAverageMinutes = Math.round(studyTimeData.thisMonthMinutes / new Date().getDate());
  const thisWeekHours = (studyTimeData.thisWeekMinutes / 60).toFixed(1);

  // Calculate average time per question for marathon
  const avgTimePerQuestion = marathonStats.totalQuestions > 0 ? "43s" : "0s"; // Mock value

  // Get streak data with optimized performance
  const { streakData: optimizedStreakData, questionsToday, refetch: refetchStreak } = useOptimizedStreak(userName);
  
  // Fallback to legacy hook for compatibility
  const { streakData: legacyStreakData } = useUserStreak(userName);
  
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

  // Get dates where user had activity for the calendar
  const getActivityDates = () => {
    const loginHistory = JSON.parse(localStorage.getItem('userLoginHistory') || '[]');
    return loginHistory.map((login: any) => new Date(login.date));
  };

  const activityDates = getActivityDates();

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        </div>


        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Streak */}
          <Card className="bg-white relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
                <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {streakData?.current_streak || 0}
              </div>
              <div className="text-sm text-gray-500 mb-4">Day Streak</div>
              
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
                <div className="text-xs text-orange-600 font-medium mb-3">
                  Solve {5 - questionsToday} more questions to count today's streak!
                </div>
              ) : (
                <div className="text-xs text-green-600 font-medium mb-3">
                  Great! Today's streak counted ✓
                </div>
              )}

              {/* View Calendar Button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStreakCalendar(true)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-1 h-7 text-xs"
                >
                  View Calendar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Predicted SAT Score */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Predicted SAT Score</h3>
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{predictedSATScore}</div>
              <div className="text-sm text-green-600 mb-4">+40 pts from last month</div>
              
              {/* Progress bar */}
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">Goal: 1400</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(predictedSATScore / 1400) * 100}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{predictedSATScore}/1400</div>
              </div>
              
              <div className="text-xs text-blue-600 font-medium">Keep practicing to reach your goal!</div>
            </CardContent>
          </Card>

          {/* Study Time */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Study Time</h3>
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{todayDisplay.value}</div>
              <div className="text-sm text-gray-500 mb-4">{todayDisplay.unit}</div>
              
               {/* Weekly summary */}
               <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                 <div>Daily Average</div>
                 <div className="text-right">{dailyAverageMinutes} min</div>
                 <div>This Week</div>
                 <div className="text-right">{thisWeekHours}h</div>
                 <div>This Month</div>
                 <div className="text-right">{thisMonthHours}h</div>
               </div>
            </CardContent>
          </Card>

          {/* Questions Solved */}
          <QuestionsSolvedCard userName={userName} marathonStats={marathonStats} />
        </div>

        {/* Two Column Layout - Weakest Topics & Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Your Weakest Topics */}
          <div className="lg:col-span-2 h-full">
            <PerformanceOverview userName={userName} />
          </div>
          
          {/* Recent Sessions */}
          <div className="lg:col-span-1 h-full">
            <RecentSessions userName={userName} />
          </div>
        </div>

        {/* Time & Pacing + Competitive Landscape */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 h-full">
            <TimePacingAnalysis userName={userName} mockTestResults={mockTestResults} />
          </div>
          <div className="lg:col-span-1 h-full">
            <CompetitiveLandscape userName={userName} />
          </div>
        </div>

        {/* Performance Trends Section */}
        <div className="mb-8">
          <PerformanceTrends userName={userName} />
        </div>

        {/* Practice Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Practice Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quiz Mode */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">?</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Quiz Mode</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-4xl font-bold text-gray-900">{quizStats.totalQuestions}</span>
                    <span className="text-2xl font-bold text-gray-900">{quizStats.averageAccuracy}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Questions Solved</span>
                    <span>Avg. Accuracy</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex justify-between">
                    <span>Last Attempt</span>
                    <span>August 1, 2025</span>
                  </div>
                </div>
                
<Accordion type="single" collapsible>
  <AccordionItem value="quiz-difficulty">
    <AccordionTrigger className="text-sm text-gray-800">Difficulty breakdown</AccordionTrigger>
    <AccordionContent>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xl font-bold text-green-600">{difficultyBreakdown.quiz.easy}</div>
          <div className="text-xs text-gray-500">Easy</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-600">{difficultyBreakdown.quiz.medium}</div>
          <div className="text-xs text-gray-500">Medium</div>
        </div>
        <div>
          <div className="text-xl font-bold text-purple-600">{difficultyBreakdown.quiz.hard}</div>
          <div className="text-xs text-gray-500">Hard</div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>
              </CardContent>
            </Card>

            {/* Marathon Mode */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">⚡</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Marathon Mode</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-4xl font-bold text-gray-900">{marathonStats.totalQuestions}</span>
                    <span className="text-2xl font-bold text-gray-900">{avgTimePerQuestion}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Questions Solved</span>
                    <span>Avg. Time/Question</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex justify-between">
                    <span>Longest Session</span>
                    <span>45 Questions</span>
                  </div>
                </div>
                
<Accordion type="single" collapsible>
  <AccordionItem value="marathon-difficulty">
    <AccordionTrigger className="text-sm text-gray-800">Difficulty breakdown</AccordionTrigger>
    <AccordionContent>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xl font-bold text-green-600">{difficultyBreakdown.marathon.easy}</div>
          <div className="text-xs text-gray-500">Easy</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-600">{difficultyBreakdown.marathon.medium}</div>
          <div className="text-xs text-gray-500">Medium</div>
        </div>
        <div>
          <div className="text-xl font-bold text-purple-600">{difficultyBreakdown.marathon.hard}</div>
          <div className="text-xs text-gray-500">Hard</div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>
              </CardContent>
            </Card>

            {/* Mock Tests */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">📄</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Mock Tests</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-4xl font-bold text-gray-900">{mockTestResults.length}</span>
                    <span className="text-2xl font-bold text-gray-900">{
                      mockTestResults.length > 0 
                        ? Math.round(mockTestResults.reduce((sum, result) => sum + ((result.mathScore || 0) + (result.englishScore || 0)), 0) / mockTestResults.length)
                        : 0
                    }</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Tests Completed</span>
                    <span>Avg. Score</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex justify-between">
                    <span>Last Attempt</span>
                    <span>July 25, 2025</span>
                  </div>
                </div>
                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Streak Calendar Modal */}
      <StreakCalendar
        isOpen={showStreakCalendar}
        onClose={() => setShowStreakCalendar(false)}
        activityDates={activityDates}
      />

      {/* Streak Notification */}
      <StreakNotification
        streakCount={streakData?.current_streak || 0}
        onClose={handleCloseStreakNotification}
        isVisible={showStreakNotification}
      />
    </div>
  );
};

export default PerformanceDashboard;
