
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, FileText, Zap, Play } from 'lucide-react';
import MockTestCard from './MockTestCard';
import MockTestHistory from './MockTestHistory';

interface MockTestSelectionProps {
  userName: string;
  onBack: () => void;
  onSelectTest: (testType: string) => void;
}

const MockTestSelection: React.FC<MockTestSelectionProps> = ({ 
  userName, 
  onBack, 
  onSelectTest 
}) => {
  // Check for paused test in localStorage
  const getPausedTestStatus = (testId: string) => {
    const savedProgress = localStorage.getItem(`sat-test-progress-${testId}`);
    return savedProgress ? JSON.parse(savedProgress) : null;
  };

  const mockTests = [
    {
      id: 'digital-sat-1',
      title: 'Digital SAT Practice Test 1',
      description: 'Complete SAT practice test with adaptive modules',
      duration: '2h 14m',
      sections: ['Reading & Writing', 'Math'],
      questions: 98,
      difficulty: 'Standard'
    },
    {
      id: 'digital-sat-2',
      title: 'Digital SAT Practice Test 2',
      description: 'Alternative practice test with different question set',
      duration: '2h 14m',
      sections: ['Reading & Writing', 'Math'],
      questions: 98,
      difficulty: 'Standard'
    },
    {
      id: 'math-focus',
      title: 'Math-Focused Practice Test',
      description: 'Extended math practice with additional problem sets',
      duration: '1h 30m',
      sections: ['Math Only'],
      questions: 60,
      difficulty: 'Challenging'
    },
    {
      id: 'reading-focus',
      title: 'Reading & Writing Focus Test',
      description: 'Comprehensive reading and writing practice',
      duration: '1h 20m',
      sections: ['Reading & Writing Only'],
      questions: 54,
      difficulty: 'Standard'
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Select a Mock Test</h1>
        </div>

        {/* Standard Mock Tests */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <MockTestCard 
              testType="reading-writing" 
              onLaunch={() => onSelectTest('reading-focus')} 
            />
            <MockTestCard 
              testType="math" 
              onLaunch={() => onSelectTest('math-focus')} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MockTestCard 
              testType="full" 
              onLaunch={() => onSelectTest('digital-sat-1')} 
            />
          </div>
        </div>

        {/* Previous Mock Tests */}
        <div className="mb-8">
          <MockTestHistory userName={userName} />
        </div>

        <Card className="rounded-2xl border border-gray-200 shadow-sm mt-8">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Test Instructions</h3>
            <ul className="text-gray-600 space-y-1.5 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>All tests simulate real exam conditions with accurate timing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>You can flag questions for review and navigate between questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Calculator is available for math sections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Your results will be saved and contribute to your leaderboard score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Take your time to read each question carefully</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>You can pause and resume tests at any time</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MockTestSelection;
