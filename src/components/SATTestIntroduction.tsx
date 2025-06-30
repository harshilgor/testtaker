
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, Users, Target, ArrowLeft } from 'lucide-react';

interface SATTestIntroductionProps {
  onStartTest: () => void;
  onBack?: () => void;
}

const SATTestIntroduction: React.FC<SATTestIntroductionProps> = ({ onStartTest, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Selection
          </Button>
        )}
        
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Digital SAT Practice Test
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Take a full-length practice test that adapts to your performance
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Test Structure
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Reading & Writing:</strong> 2 modules, 54 questions total</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Math:</strong> 2 modules, 44 questions total</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Adaptive:</strong> Module 2 difficulty depends on Module 1 performance</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Time Limits
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Reading & Writing:</strong> 32 minutes per module</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Math:</strong> 35 minutes per module</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Total Time:</strong> Approximately 2 hours 14 minutes</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Test Features</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Mark questions for review and navigate between questions</li>
                <li>• Eliminate answer choices to narrow down options</li>
                <li>• Real-time timer with module-specific time limits</li>
                <li>• Adaptive difficulty based on your performance</li>
                <li>• Detailed results and explanations after completion</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Notes</h4>
              <ul className="text-amber-800 space-y-1 text-sm">
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
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
