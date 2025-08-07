import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MarathonHistorySection from './Performance/MarathonHistorySection';
import PerformanceStats from './Performance/PerformanceStats';
import QuestionAttemptStats from './Performance/QuestionAttemptStats';
import QuizHistorySection from './Performance/QuizHistorySection';
import StreakDisplay from './StreakDisplay';
import { useUserStreak } from '@/hooks/useUserStreak';
import WeakestTopicsSection from './Performance/WeakestTopicsSection';
import RecentSessions from './Performance/RecentSessions';
import PerformanceTrends from './Performance/PerformanceTrends';
import CompetitiveLandscape from './Performance/CompetitiveLandscape';
import TimePacingAnalysis from './Performance/TimePacingAnalysis';
import StreakNotification from './StreakNotification';

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
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calculate from marathon sessions (assume 1.5 mins per question)
    const marathonTimeThisMonth = marathonSessions
      .filter(session => new Date(session.created_at) >= thisMonth)
      .reduce((sum, session) => sum + (session.total_questions || 0) * 1.5, 0);

    const marathonTimeThisWeek = marathonSessions
      .filter(session => new Date(session.created_at) >= thisWeek)
      .reduce((sum, session) => sum + (session.total_questions || 0) * 1.5, 0);

    const marathonTimeLastMonth = marathonSessions
      .filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= lastMonth && sessionDate <= lastMonthEnd;
      })
      .reduce((sum, session) => sum + (session.total_questions || 0) * 1.5, 0);

    // Calculate from quiz sessions (assume 2 mins per question for quizzes)
    const quizTimeThisMonth = dbQuizResults
      .filter(result => new Date(result.created_at) >= thisMonth)
      .reduce((sum, result) => sum + (result.total_questions || 0) * 2, 0);

    const quizTimeThisWeek = dbQuizResults
      .filter(result => new Date(result.created_at) >= thisWeek)
      .reduce((sum, result) => sum + (result.total_questions || 0) * 2, 0);

    const quizTimeLastMonth = dbQuizResults
      .filter(result => {
        const resultDate = new Date(result.created_at);
        return resultDate >= lastMonth && resultDate <= lastMonthEnd;
      })
      .reduce((sum, result) => sum + (result.total_questions || 0) * 2, 0);

    return {
      thisMonthMinutes: marathonTimeThisMonth + quizTimeThisMonth,
      thisWeekMinutes: marathonTimeThisWeek + quizTimeThisWeek,
      lastMonthMinutes: marathonTimeLastMonth + quizTimeLastMonth,
    };
  };

  const studyTimeData = calculateStudyTime();
  const studyTimeHours = Math.round(studyTimeData.thisMonthMinutes / 60);
  const dailyAverageMinutes = Math.round(studyTimeData.thisMonthMinutes / new Date().getDate());
  const thisWeekHours = (studyTimeData.thisWeekMinutes / 60).toFixed(1);
  const lastMonthHours = Math.round(studyTimeData.lastMonthMinutes / 60);

  // Calculate average time per question for marathon
  const avgTimePerQuestion = marathonStats.totalQuestions > 0 ? "43s" : "0s"; // Mock value

  // Get streak data with auto-refresh
  const { streakData, questionsToday, refetch: refetchStreak } = useUserStreak(userName);

  // Check for streak notification trigger
  useEffect(() => {
    // Show notification when user just completed their 5th question of the day
    if (questionsToday >= 5 && previousQuestionsToday < 5 && previousQuestionsToday > 0) {
      setShowStreakNotification(true);
    }
    setPreviousQuestionsToday(questionsToday);
  }, [questionsToday, previousQuestionsToday]);

  // Refetch streak data periodically to catch new question attempts
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStreak();
    }, 3000); // Refetch every 3 seconds

    return () => clearInterval(interval);
  }, [refetchStreak]);

  const handleCloseStreakNotification = () => {
    setShowStreakNotification(false);
  };

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
          <Card className="bg-white">
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
                    // Fill bubbles from the most recent days going backwards
                    const isToday = index === mondayIndex;
                    const daysFromToday = index - mondayIndex;
                    const shouldBeFilled = isToday ? (questionsToday >= 5) : 
                      (daysFromToday < 0 && Math.abs(daysFromToday) <= currentStreak);
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full mb-1 ${
                          shouldBeFilled ? 'bg-orange-500' : 
                          index <= mondayIndex ? 'bg-gray-300' : 'bg-gray-200'
                        }`}></div>
                        <div className="text-xs text-gray-400">{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {questionsToday < 5 ? (
                <div className="text-xs text-orange-600 font-medium">
                  Solve {5 - questionsToday} more questions to count today's streak!
                </div>
              ) : (
                <div className="text-xs text-green-600 font-medium">
                  Great! Today's streak counted ✓
                </div>
              )}
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
              <div className="text-4xl font-bold text-gray-900 mb-1">{studyTimeHours}</div>
              <div className="text-sm text-gray-500 mb-4">Hours This Month</div>
              
               {/* Weekly summary */}
               <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                 <div>Daily Average</div>
                 <div className="text-right">{dailyAverageMinutes} min</div>
                 <div>This Week</div>
                 <div className="text-right">{thisWeekHours}h</div>
                 <div>Last Month</div>
                 <div className="text-right">{lastMonthHours}h</div>
               </div>
            </CardContent>
          </Card>

          {/* Questions Solved */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Questions Solved</h3>
                <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{totalQuestions}</div>
              <div className="text-sm text-gray-500 mb-4">Total Questions</div>
              
              {/* Progress bar */}
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">Last 7 Days</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">84 questions</div>
              </div>
              
              <div className="text-xs text-gray-500">Accuracy: {marathonStats.averageAccuracy}% Overall</div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout - Weakest Topics & Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Your Weakest Topics */}
          <div className="lg:col-span-2 h-full">
            <WeakestTopicsSection userName={userName} />
          </div>
          
          {/* Recent Sessions */}
          <div className="lg:col-span-1 h-full">
            <RecentSessions userName={userName} />
          </div>
        </div>

        {/* Time & Pacing Analysis */}
        <div className="mb-8">
          <TimePacingAnalysis userName={userName} mockTestResults={mockTestResults} />
        </div>

        {/* Performance Trends Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Trends */}
          <div className="lg:col-span-2 h-full">
            <PerformanceTrends userName={userName} />
          </div>
          
          {/* Competitive Landscape */}
          <div className="lg:col-span-1 h-full">
            <CompetitiveLandscape userName={userName} />
          </div>
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
                
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => window.location.href = '/quiz'}
                >
                  Start Quiz
                </Button>
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
                
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => window.location.href = '/marathon'}
                >
                  Start Marathon
                </Button>
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
                
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => window.location.href = '/sat-mock-test'}
                >
                  Take Mock Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
