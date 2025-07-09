
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

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ userName }) => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([]);
  const [showMarathonHistory, setShowMarathonHistory] = useState(false);
  const [showQuizHistory, setShowQuizHistory] = useState(false);
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

  const handleViewMarathonResult = (session: MarathonSession) => {
    console.log('Viewing marathon result:', session);
  };

  const handleViewQuizResult = (result: QuizResult) => {
    console.log('Viewing quiz result:', result);
  };

  // Mock data for streak tracker (in a real app, this would come from the database)
  const streakData = {
    currentStreak: 4,
    longestStreak: 12,
    weeklyActivity: [true, true, false, true, true, false, false] // Mon-Sun
  };

  const totalQuizQuestions = quizResults.reduce((sum, result) => sum + result.questions.length, 0);
  const totalMarathonQuestions = marathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        </div>

        {/* Streak Display */}
        <StreakDisplay userName={userName} />

        {/* Overall Performance Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Overall Performance Summary</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Marathon Section */}
              {!isLoading && marathonStats.totalQuestions > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Marathon Sessions</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Questions Answered</div>
                      <div className="text-2xl font-bold text-gray-900">{marathonStats.totalQuestions}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Wrong Answers</div>
                      <div className="text-2xl font-bold text-gray-900">{marathonStats.totalQuestions - marathonStats.correctAnswers}</div>
                    </Card>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Accuracy</div>
                      <div className="text-2xl font-bold text-gray-900">{marathonStats.averageAccuracy}%</div>
                    </Card>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowMarathonHistory(!showMarathonHistory)}
                      className="text-gray-600"
                    >
                      {showMarathonHistory ? 'Close Marathon History' : 'View Marathon History'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Quiz Section */}
              {quizStats.totalQuizzes > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quizzes</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Questions Answered</div>
                      <div className="text-2xl font-bold text-gray-900">{quizStats.totalQuestions}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Wrong Answers</div>
                      <div className="text-2xl font-bold text-gray-900">{quizStats.totalQuestions - quizStats.correctAnswers}</div>
                    </Card>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Accuracy</div>
                      <div className="text-2xl font-bold text-gray-900">{quizStats.averageAccuracy}%</div>
                    </Card>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowQuizHistory(!showQuizHistory)}
                      className="text-gray-600"
                    >
                      {showQuizHistory ? 'Close Quiz History' : 'View Quiz History'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Show message if no data available */}
            {!isLoading && marathonStats.totalQuestions === 0 && quizStats.totalQuizzes === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No practice data available yet. Start practicing to see your performance!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conditional History Sections */}
        {showMarathonHistory && (
          <MarathonHistorySection 
            marathonSessions={marathonSessions}
            onViewResult={handleViewMarathonResult}
          />
        )}

        {showQuizHistory && (
          <QuizHistorySection 
            quizResults={quizResults}
            onViewResult={handleViewQuizResult}
          />
        )}

        {/* Practice Scores Section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4 md:mb-6">Practice Scores</h2>
          
          {/* Mock Test Scores */}
          {mockTestResults.length > 0 && (
            <div className="space-y-4 mb-6 md:mb-8">
              {mockTestResults.map((result, index) => (
                <Card key={index} className="bg-white shadow-lg">
                  <CardContent className="p-4 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">SAT Practice {index + 1}</h3>
                        <p className="text-sm md:text-base text-gray-600">{new Date(result.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                      <div className="text-center">
                        <div className="text-sm md:text-lg text-gray-600 mb-2">Your Total Score</div>
                        <div className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
                          {Math.round((result.mathScore || 0) + (result.englishScore || 0))}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">400 to 1600</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm md:text-lg text-gray-600 mb-2">Your Reading and Writing Score</div>
                        <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{result.englishScore || 0}</div>
                        <div className="text-xs md:text-sm text-gray-500">200 to 800</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm md:text-lg text-gray-600 mb-2">Your Math Score</div>
                        <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{result.mathScore || 0}</div>
                        <div className="text-xs md:text-sm text-gray-500">200 to 800</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Total Mock Tests Card */}
          <Card className="bg-white shadow-lg mb-6 md:mb-8">
            <CardContent className="p-4 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Total Mock Tests Taken</h3>
              <div className="text-3xl md:text-5xl font-bold text-blue-600 mb-2">{mockTestResults.length}</div>
              <p className="text-sm md:text-base text-gray-600">Complete SAT practice tests</p>
            </CardContent>
          </Card>

          {/* Total Questions Attempted Card */}
          <QuestionAttemptStats 
            totalQuizQuestions={totalQuizQuestions}
            totalMarathonQuestions={totalMarathonQuestions}
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
