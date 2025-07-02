
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PerformanceSummaryCards from './Performance/PerformanceSummaryCards';
import QuizHistorySection from './Performance/QuizHistorySection';
import MockTestHistorySection from './Performance/MockTestHistorySection';
import MarathonHistorySection from './Performance/MarathonHistorySection';
import StreakTracker from './Performance/StreakTracker';
import ResultDetailView from './Performance/ResultDetailView';

interface PerformanceDashboardProps {
  onBack: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ onBack }) => {
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [resultType, setResultType] = useState<'quiz' | 'mock' | 'marathon'>('quiz');

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
          <PerformanceSummaryCards />

          {/* Streak Tracker */}
          <StreakTracker />

          {/* Quiz History */}
          <QuizHistorySection onViewDetails={(result) => handleViewDetails(result, 'quiz')} />

          {/* Mock Test History */}
          <MockTestHistorySection onViewDetails={(result) => handleViewDetails(result, 'mock')} />

          {/* Marathon History */}
          <MarathonHistorySection onViewDetails={(result) => handleViewDetails(result, 'marathon')} />
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
