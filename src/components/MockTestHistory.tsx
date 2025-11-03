import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, RotateCcw, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface MockTestHistoryProps {
  userName: string;
  onViewTest?: (testId: string) => void;
  onRetakeWrong?: (testId: string) => void;
}

const MockTestHistory: React.FC<MockTestHistoryProps> = ({ userName, onViewTest, onRetakeWrong }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch mock test results
  const { data: mockTests = [], isLoading } = useQuery({
    queryKey: ['mock-test-history', userName],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching mock tests:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleRetakeWrong = async (test: any) => {
    // Extract wrong answers from detailed_results
    if (!test.detailed_results) {
      console.error('No detailed results available');
      return;
    }

    const detailedResults = test.detailed_results as any;
    const answers = detailedResults.answers || {};
    const questions = detailedResults.questions || [];

    // Find all wrong answers
    const wrongQuestions = questions.filter((q: any) => {
      const userAnswer = answers[q.id];
      return userAnswer && !userAnswer.isCorrect;
    });

    if (wrongQuestions.length === 0) {
      alert('No wrong answers found for this test!');
      return;
    }

    // Store wrong questions for retake
    if (onRetakeWrong) {
      onRetakeWrong(test.id);
    } else {
      // Navigate to quiz with wrong questions
      localStorage.setItem('retakeWrongQuestions', JSON.stringify({
        testId: test.id,
        questions: wrongQuestions.map((q: any) => q.id),
        subject: 'both'
      }));
      navigate('/quiz');
    }
  };

  const handleViewTest = (testId: string) => {
    if (onViewTest) {
      onViewTest(testId);
    } else {
      // Navigate to test review page
      navigate(`/test-review/${testId}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Previous Mock Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mockTests.length === 0) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Previous Mock Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No Mock Tests Yet</h3>
            <p className="text-sm text-gray-500">
              Complete a mock test to see your results here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Previous Mock Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {mockTests.map((test) => {
            const accuracy = test.total_score ? Math.round((test.total_score / 1600) * 100) : 0;
            
            return (
              <div 
                key={test.id} 
                className="p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer border-gray-200 bg-white hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">Mock Test</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(test.completed_at || test.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {test.english_score && (
                        <span className="text-xs text-gray-600">
                          R&W: <span className="font-medium">{test.english_score}</span>
                        </span>
                      )}
                      {test.math_score && (
                        <span className="text-xs text-gray-600">
                          Math: <span className="font-medium">{test.math_score}</span>
                        </span>
                      )}
                      <span className={`text-sm font-semibold ${
                        accuracy >= 80 ? 'text-green-600' : 
                        accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        Total: {test.total_score}/1600
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetakeWrong(test);
                    }}
                    className="flex-1 text-xs h-8 border-gray-300 hover:bg-orange-50"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Retake Wrong
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTest(test.id);
                    }}
                    className="flex-1 text-xs h-8 border-gray-300 hover:bg-blue-50"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View All
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MockTestHistory;

