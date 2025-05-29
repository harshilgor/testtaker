
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PerformanceSummaryCards from './Performance/PerformanceSummaryCards';
import QuizHistorySection from './Performance/QuizHistorySection';
import MockTestHistorySection from './Performance/MockTestHistorySection';
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
}

interface MockTestResult {
  score: number;
  questions: any[];
  answers: (number | null)[];
  date: string;
  userName: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ userName, onBack }) => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([]);
  const [selectedView, setSelectedView] = useState<'quiz' | 'mock' | null>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    const storedQuizzes = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const storedMockTests = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
    
    setQuizResults(storedQuizzes.filter((result: QuizResult) => result.userName === userName));
    setMockTestResults(storedMockTests.filter((result: MockTestResult) => result.userName === userName));
  }, [userName]);

  const averageQuizScore = quizResults.length > 0 
    ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)
    : 0;

  const averageMockScore = mockTestResults.length > 0
    ? Math.round(mockTestResults.reduce((sum, result) => sum + result.score, 0) / mockTestResults.length)
    : 0;

  const handleViewQuizResult = (result: QuizResult) => {
    setSelectedView('quiz');
    setSelectedResult(result);
  };

  const handleViewMockResult = (result: MockTestResult) => {
    setSelectedView('mock');
    setSelectedResult(result);
  };

  const handleBackToResults = () => {
    setSelectedResult(null);
    setSelectedView(null);
  };

  if (selectedResult) {
    return (
      <ResultDetailView
        result={selectedResult}
        resultType={selectedView!}
        onBack={handleBackToResults}
      />
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
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        </div>

        <PerformanceSummaryCards
          quizCount={quizResults.length}
          averageQuizScore={averageQuizScore}
          mockTestCount={mockTestResults.length}
          averageMockScore={averageMockScore}
        />

        <QuizHistorySection
          quizResults={quizResults}
          onViewResult={handleViewQuizResult}
        />

        <MockTestHistorySection
          mockTestResults={mockTestResults}
          onViewResult={handleViewMockResult}
        />
      </div>
    </div>
  );
};

export default PerformanceDashboard;
