
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, ArrowLeft, Target } from 'lucide-react';

interface SATTestIntroductionProps {
  onStartTest: () => void;
  onBack?: () => void;
}

const SATTestIntroduction: React.FC<SATTestIntroductionProps> = ({ onStartTest, onBack }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-600 hover:bg-gray-50 mb-4 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Selection
          </Button>
        )}
        
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900 mb-2">
              Digital SAT Practice Test
            </CardTitle>
            <p className="text-gray-600">
              Take a full-length practice test that adapts to your performance
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Test Structure
                </h3>
                <div className="space-y-3 text-gray-600">
                  <div>
                    <div className="font-medium text-gray-900">Reading & Writing</div>
                    <div className="text-sm">2 modules, 54 questions total</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Math</div>
                    <div className="text-sm">2 modules, 44 questions total</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Adaptive</div>
                    <div className="text-sm">Module 2 difficulty depends on Module 1 performance</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Time Limits
                </h3>
                <div className="space-y-3 text-gray-600">
                  <div>
                    <div className="font-medium text-gray-900">Reading & Writing</div>
                    <div className="text-sm">32 minutes per module</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Math</div>
                    <div className="text-sm">35 minutes per module</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Total Time</div>
                    <div className="text-sm">Approximately 2 hours 14 minutes</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Test Features</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Mark questions for review and navigate between questions</li>
                <li>• Eliminate answer choices to narrow down options</li>
                <li>• Real-time timer with module-specific time limits</li>
                <li>• Adaptive difficulty based on your performance</li>
                <li>• Detailed results and explanations after completion</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-3">Important Notes</h4>
              <ul className="text-orange-800 space-y-2 text-sm">
                <li>• Once you start, the timer begins immediately</li>
                <li>• You can pause and resume the test if needed</li>
                <li>• Your progress is automatically saved</li>
                <li>• Find a quiet environment to simulate real test conditions</li>
              </ul>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button
                onClick={onStartTest}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
              >
                Start SAT Practice Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SATTestIntroduction;
