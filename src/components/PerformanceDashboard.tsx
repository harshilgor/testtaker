
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import MarathonHistorySection from './Performance/MarathonHistorySection';
import QuizHistorySection from './Performance/QuizHistorySection';
import ResultDetailView from './Performance/ResultDetailView';

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
  sessionId?: string;
  timeSpent?: number;
  pointsEarned?: number;
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
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedResultType, setSelectedResultType] = useState<'quiz' | 'mock' | 'marathon' | null>(null);
  const [marathonExpanded, setMarathonExpanded] = useState(false);
  const [quizExpanded, setQuizExpanded] = useState(false);

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

  const handleViewMarathonResult = (session: MarathonSession) => {
    setSelectedResult(session);
    setSelectedResultType('marathon');
  };

  const handleViewQuizResult = (result: QuizResult) => {
    setSelectedResult(result);
    setSelectedResultType('quiz');
  };

  const handleBackToResults = () => {
    setSelectedResult(null);
    setSelectedResultType(null);
  };

  if (selectedResult && selectedResultType) {
    return (
      <ResultDetailView
        result={selectedResult}
        resultType={selectedResultType}
        onBack={handleBackToResults}
      />
    );
  }

  // Calculate total questions attempted in quiz and marathon modes
  const totalQuizQuestions = quizResults.reduce((sum, result) => sum + result.questions.length, 0);
  const totalMarathonQuestions = marathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        </div>

        {/* Marathon Progress Section */}
        <Card className="mb-6 md:mb-8">
          <Collapsible open={marathonExpanded} onOpenChange={setMarathonExpanded}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl md:text-2xl font-semibold text-gray-700">
                    Your Marathon Progress ({marathonSessions.length} sessions)
                  </CardTitle>
                  {marathonExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <MarathonHistorySection 
                  marathonSessions={marathonSessions}
                  onViewResult={handleViewMarathonResult}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Quiz Progress Section */}
        <Card className="mb-6 md:mb-8">
          <Collapsible open={quizExpanded} onOpenChange={setQuizExpanded}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl md:text-2xl font-semibold text-gray-700">
                    Your Quiz Progress ({quizResults.length} quizzes)
                  </CardTitle>
                  {quizExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <QuizHistorySection 
                  quizResults={quizResults}
                  onViewResult={handleViewQuizResult}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

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
                      <ArrowRight className="h-4 w-4 text-gray-400" />
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
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Total Questions Attempted</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div>
                  <div className="text-2xl md:text-4xl font-bold text-purple-600 mb-2">{totalQuizQuestions}</div>
                  <p className="text-sm md:text-base text-gray-600">Quiz Mode Questions</p>
                </div>
                <div>
                  <div className="text-2xl md:text-4xl font-bold text-orange-600 mb-2">{totalMarathonQuestions}</div>
                  <p className="text-sm md:text-base text-gray-600">Marathon Mode Questions</p>
                </div>
              </div>
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                <div className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">{totalQuizQuestions + totalMarathonQuestions}</div>
                <p className="text-sm md:text-base text-gray-600">Total Questions Attempted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="bg-blue-500 rounded-full p-3 flex-shrink-0">
                <div className="text-white text-lg md:text-xl font-bold">?</div>
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-2">
                  Need help? <span className="text-blue-600">Learn more about the Digital SAT and registering</span>
                </h3>
                <p className="text-sm md:text-base text-blue-800">
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
