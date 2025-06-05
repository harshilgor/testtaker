
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, Clock, BookOpen, Brain, TrendingUp, Target, Award, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import AdminPanel from './AdminPanel';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface DashboardProps {
  userName: string;
  onMarathonSelect: () => void;
  onMockTestSelect: () => void;
  onQuizSelect: () => void;
}

interface MarathonStats {
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
  totalSessions: number;
  bestStreak: number;
}

interface MarathonSession {
  id: string;
  total_questions: number;
  correct_answers: number;
  difficulty: string;
  created_at: string;
  subjects: string[];
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  onMarathonSelect,
  onMockTestSelect,
  onQuizSelect
}) => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { isAdmin } = useAdminAccess();
  const [marathonStats, setMarathonStats] = useState<MarathonStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    averageAccuracy: 0,
    totalSessions: 0,
    bestStreak: 0
  });

  // Fetch marathon sessions from Supabase
  const { data: marathonSessions = [], isLoading } = useQuery({
    queryKey: ['marathon-sessions', userName],
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

  if (showAdminPanel) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-4 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-6 md:mb-8 relative">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
          <p className="text-base md:text-lg text-gray-600">
            Choose your practice mode to get started
          </p>
          
          {/* Admin Access Button - Only visible to admin */}
          {isAdmin && (
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Marathon Stats Section */}
        {!isLoading && marathonStats.totalQuestions > 0 && (
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                <span>Your Marathon Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{marathonStats.totalQuestions}</p>
                  <p className="text-xs md:text-sm text-gray-600">Questions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{marathonStats.correctAnswers}</p>
                  <p className="text-xs md:text-sm text-gray-600">Correct</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{marathonStats.averageAccuracy}%</p>
                  <p className="text-xs md:text-sm text-gray-600">Accuracy</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{marathonStats.totalSessions}</p>
                  <p className="text-xs md:text-sm text-gray-600">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Marathon History Section */}
        {!isLoading && marathonSessions.length > 0 && (
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                <span>Recent Marathon Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {marathonSessions.slice(0, 5).map((session) => {
                  const accuracy = session.total_questions > 0 ? Math.round((session.correct_answers / session.total_questions) * 100) : 0;
                  return (
                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 border border-gray-200 rounded-lg">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="text-sm md:text-base font-medium">Marathon Session</h3>
                        <p className="text-xs md:text-sm text-gray-600">
                          {new Date(session.created_at).toLocaleDateString()} • {session.total_questions} questions • {session.difficulty} difficulty
                        </p>
                        {session.subjects && session.subjects.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Subjects: {session.subjects.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 md:gap-4">
                        <span className={`text-base md:text-lg font-bold ${
                          accuracy >= 70 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {accuracy}%
                        </span>
                        <span className="text-xs md:text-sm text-gray-500">
                          {session.correct_answers}/{session.total_questions}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Marathon Mode */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="bg-orange-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Zap className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Marathon Mode</h3>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">3000+ real SAT Practice questions with unlimited practice</p>
                
                <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Unlimited
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Self-Paced
                  </div>
                </div>

                <Button onClick={onMarathonSelect} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
                  Start Marathon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Mode */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="bg-purple-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Brain className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Quiz</h3>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">Create custom quizzes from specific topics and difficulty levels</p>
                
                <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Custom
                  </div>
                  <div className="flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    Targeted
                  </div>
                </div>

                <Button onClick={onQuizSelect} className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
                  Create Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mock Test Mode */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="bg-blue-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Mock Test</h3>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">Take a full SAT mock test with real timing and adaptive scoring</p>
                
                <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Real Format
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Timed
                  </div>
                </div>

                <Button onClick={onMockTestSelect} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
                  Take Mock Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
