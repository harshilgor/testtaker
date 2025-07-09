
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, FileText, Zap, Play } from 'lucide-react';

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
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Select a Mock Test</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {mockTests.map((test) => {
            const pausedProgress = getPausedTestStatus(test.id);
            const hasProgress = pausedProgress && pausedProgress.currentProgress;

            return (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{test.title}</CardTitle>
                      <p className="text-gray-600">{test.description}</p>
                      {hasProgress && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800 font-medium">
                            Progress saved: {pausedProgress.currentProgress.section === 'reading-writing' ? 'Reading & Writing' : 'Math'} Module {pausedProgress.currentProgress.module}, Question {pausedProgress.currentProgress.questionIndex + 1}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.difficulty === 'Challenging' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {test.difficulty}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{test.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{test.questions} questions</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Sections:</p>
                      <div className="flex flex-wrap gap-2">
                        {test.sections.map((section, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => onSelectTest(test.id)}
                      className={`w-full text-white ${
                        hasProgress 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {hasProgress ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume Test
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Start Test
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Test Instructions</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• All tests simulate real exam conditions with accurate timing</li>
            <li>• You can flag questions for review and navigate between questions</li>
            <li>• Calculator is available for math sections</li>
            <li>• Your results will be saved and contribute to your leaderboard score</li>
            <li>• Take your time to read each question carefully</li>
            <li>• You can pause and resume tests at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MockTestSelection;
