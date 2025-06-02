
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ userName, onBack }) => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([]);

  // Fetch marathon sessions from Supabase
  const { data: marathonSessions = [] } = useQuery({
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

  // Calculate total questions attempted in quiz and marathon modes
  const totalQuizQuestions = quizResults.reduce((sum, result) => sum + result.questions.length, 0);
  const totalMarathonQuestions = marathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        </div>

        {/* Practice Scores Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Practice Scores</h2>
          
          {/* Mock Test Scores */}
          {mockTestResults.length > 0 && (
            <div className="space-y-4 mb-8">
              {mockTestResults.map((result, index) => (
                <Card key={index} className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">SAT Practice {index + 1}</h3>
                        <p className="text-gray-600">{new Date(result.date).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="text-center">
                        <div className="text-lg text-gray-600 mb-2">Your Total Score</div>
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {Math.round((result.mathScore || 0) + (result.englishScore || 0))}
                        </div>
                        <div className="text-sm text-gray-500">400 to 1600</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg text-gray-600 mb-2">Your Reading and Writing Score</div>
                        <div className="text-4xl font-bold text-gray-900 mb-2">{result.englishScore || 0}</div>
                        <div className="text-sm text-gray-500">200 to 800</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg text-gray-600 mb-2">Your Math Score</div>
                        <div className="text-4xl font-bold text-gray-900 mb-2">{result.mathScore || 0}</div>
                        <div className="text-sm text-gray-500">200 to 800</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Total Mock Tests Card */}
          <Card className="bg-white shadow-lg mb-8">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Total Mock Tests Taken</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">{mockTestResults.length}</div>
              <p className="text-gray-600">Complete SAT practice tests</p>
            </CardContent>
          </Card>

          {/* Total Questions Attempted Card */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Total Questions Attempted</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{totalQuizQuestions}</div>
                  <p className="text-gray-600">Quiz Mode Questions</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-600 mb-2">{totalMarathonQuestions}</div>
                  <p className="text-gray-600">Marathon Mode Questions</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-5xl font-bold text-gray-900 mb-2">{totalQuizQuestions + totalMarathonQuestions}</div>
                <p className="text-gray-600">Total Questions Attempted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 rounded-full p-3 flex-shrink-0">
                <div className="text-white text-xl font-bold">?</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Need help? <span className="text-blue-600">Learn more about the Digital SAT and registering</span>
                </h3>
                <p className="text-blue-800">
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
