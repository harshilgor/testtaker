
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PerformanceSummaryCards from './Performance/PerformanceSummaryCards';
import QuizHistorySection from './Performance/QuizHistorySection';
import MockTestHistorySection from './Performance/MockTestHistorySection';
import MarathonHistorySection from './Performance/MarathonHistorySection';
import StreakTracker from './Performance/StreakTracker';
import ResultDetailView from './Performance/ResultDetailView';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceDashboardProps {
  onBack: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ onBack }) => {
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [resultType, setResultType] = useState<'quiz' | 'mock' | 'marathon'>('quiz');
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [mockTestResults, setMockTestResults] = useState<any[]>([]);
  const [marathonSessions, setMarathonSessions] = useState<any[]>([]);
  const [totalQuestionsAttempted, setTotalQuestionsAttempted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch quiz results
      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch mock test results
      const { data: mockData } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      // Fetch marathon sessions
      const { data: marathonData } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setQuizResults(quizData || []);
      setMockTestResults(mockData || []);
      setMarathonSessions(marathonData || []);

      // Calculate total questions attempted
      const quizQuestions = (quizData || []).reduce((sum, quiz) => sum + quiz.total_questions, 0);
      const marathonQuestions = (marathonData || []).reduce((sum, session) => sum + (session.total_questions || 0), 0);
      setTotalQuestionsAttempted(quizQuestions + marathonQuestions);

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result: any, type: 'quiz' | 'mock' | 'marathon') => {
    setSelectedResult(result);
    setResultType(type);
  };

  const handleBackToPerformance = () => {
    setSelectedResult(null);
  };

  if (selectedResult) {
    return (
      <ResultDetailView
        result={selectedResult}
        resultType={resultType}
        onBack={handleBackToPerformance}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        </div>

        <div className="space-y-8">
          {/* Performance Summary */}
          <PerformanceSummaryCards 
            totalQuestionsAttempted={totalQuestionsAttempted}
            mockTestCount={mockTestResults.length}
          />

          {/* Streak Tracker */}
          <StreakTracker />

          {/* Quiz History */}
          <QuizHistorySection 
            quizResults={quizResults}
            onViewResult={(result) => handleViewDetails(result, 'quiz')} 
          />

          {/* Mock Test History */}
          <MockTestHistorySection 
            mockTestResults={mockTestResults}
            onViewResult={(result) => handleViewDetails(result, 'mock')} 
          />

          {/* Marathon History */}
          <MarathonHistorySection 
            marathonSessions={marathonSessions}
            onViewResult={(result) => handleViewDetails(result, 'marathon')} 
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
