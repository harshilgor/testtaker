
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, TrendingUp, Target, Award, Clock, Trophy, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  // Calculate total questions attempted in quiz and marathon modes
  const totalQuizQuestions = quizResults.reduce((sum, result) => sum + result.questions.length, 0);
  const totalMarathonQuestions = marathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4 border-slate-300 hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Performance Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Track your progress and achievements</p>
          </div>
        </div>

        {/* Marathon Progress Section */}
        {!isLoading && marathonStats.totalQuestions > 0 && (
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Trophy className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900">Your Marathon Progress</span>
                  <p className="text-slate-600 text-sm font-normal mt-1">Unlimited practice performance</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{marathonStats.totalQuestions}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Questions</p>
                </div>
                <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{marathonStats.correctAnswers}</p>
                  <p className="text-sm text-slate-600 font-medium">Correct Answers</p>
                </div>
                <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{marathonStats.averageAccuracy}%</p>
                  <p className="text-sm text-slate-600 font-medium">Accuracy Rate</p>
                </div>
                <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{marathonStats.totalSessions}</p>
                  <p className="text-sm text-slate-600 font-medium">Sessions Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Marathon Sessions */}
        {!isLoading && marathonSessions.length > 0 && (
          <Card className="mb-8 border-0 shadow-xl bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900">Recent Marathon Sessions</span>
                  <p className="text-slate-600 text-sm font-normal mt-1">Your latest practice sessions</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marathonSessions.slice(0, 5).map((session, index) => {
                  const accuracy = session.total_questions > 0 ? Math.round((session.correct_answers / session.total_questions) * 100) : 0;
                  return (
                    <div key={session.id} className="flex items-center justify-between p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center space-x-4">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <Zap className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg">Marathon Session #{marathonSessions.length - index}</h3>
                          <p className="text-slate-600">
                            {new Date(session.created_at).toLocaleDateString()} • {session.total_questions} questions • {session.difficulty} difficulty
                          </p>
                          {session.subjects && session.subjects.length > 0 && (
                            <p className="text-sm text-slate-500 mt-1">
                              Subjects: {session.subjects.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <span className={`text-2xl font-bold ${
                            accuracy >= 70 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {accuracy}%
                          </span>
                          <p className="text-sm text-slate-500">Accuracy</p>
                        </div>
                        <div className="text-center">
                          <span className="text-xl font-medium text-slate-700">
                            {session.correct_answers}/{session.total_questions}
                          </span>
                          <p className="text-sm text-slate-500">Correct</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Practice Scores Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            Practice Scores
          </h2>
          
          {/* Mock Test Scores */}
          {mockTestResults.length > 0 && (
            <div className="space-y-6 mb-8">
              {mockTestResults.map((result, index) => (
                <Card key={index} className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">SAT Practice {index + 1}</h3>
                        <p className="text-slate-600 text-lg">{new Date(result.date).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center border-slate-300 hover:bg-white/50">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                        <div className="text-lg text-slate-600 mb-2">Your Total Score</div>
                        <div className="text-5xl font-bold text-slate-900 mb-2">
                          {Math.round((result.mathScore || 0) + (result.englishScore || 0))}
                        </div>
                        <div className="text-sm text-slate-500">400 to 1600</div>
                      </div>
                      
                      <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                        <div className="text-lg text-slate-600 mb-2">Reading and Writing</div>
                        <div className="text-4xl font-bold text-slate-900 mb-2">{result.englishScore || 0}</div>
                        <div className="text-sm text-slate-500">200 to 800</div>
                      </div>
                      
                      <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                        <div className="text-lg text-slate-600 mb-2">Math Score</div>
                        <div className="text-4xl font-bold text-slate-900 mb-2">{result.mathScore || 0}</div>
                        <div className="text-sm text-slate-500">200 to 800</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Total Mock Tests Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-emerald-50 mb-8">
            <CardContent className="p-8 text-center">
              <div className="bg-green-100 p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Total Mock Tests Taken</h3>
              <div className="text-6xl font-bold text-green-600 mb-2">{mockTestResults.length}</div>
              <p className="text-slate-600 text-lg">Complete SAT practice tests</p>
            </CardContent>
          </Card>

          {/* Total Questions Attempted Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-8 text-center">
              <div className="bg-purple-100 p-3 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Total Questions Attempted</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-5xl font-bold text-purple-600 mb-2">{totalQuizQuestions}</div>
                  <p className="text-slate-600 text-lg">Quiz Mode Questions</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-5xl font-bold text-orange-600 mb-2">{totalMarathonQuestions}</div>
                  <p className="text-slate-600 text-lg">Marathon Mode Questions</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-purple-200">
                <div className="text-6xl font-bold text-slate-900 mb-2">{totalQuizQuestions + totalMarathonQuestions}</div>
                <p className="text-slate-600 text-xl">Total Questions Attempted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="bg-blue-500 rounded-full p-4 flex-shrink-0">
                <div className="text-white text-2xl font-bold">?</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">
                  Need help? <span className="text-blue-600">Learn more about the Digital SAT and registering</span>
                </h3>
                <p className="text-blue-800 text-lg">
                  Get comprehensive guidance on SAT preparation, test formats, and registration process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
