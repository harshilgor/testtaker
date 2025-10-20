import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Target, BookOpen, Trophy } from 'lucide-react';

interface PracticeTestPromptProps {
  onTakePracticeTest: () => void;
  onDismiss: () => void;
}

const PracticeTestPrompt: React.FC<PracticeTestPromptProps> = ({ 
  onTakePracticeTest, 
  onDismiss 
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-8 text-white rounded-t-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Play className="h-12 w-12 text-yellow-300 mr-3" />
                <h1 className="text-3xl font-bold">Take Your First Practice Test!</h1>
              </div>
              <p className="text-xl text-blue-100">
                Before exploring our features, let's get to know your current level
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why Take a Practice Test First?
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                Our AI needs to understand your current strengths and weaknesses to provide personalized recommendations and track your progress effectively.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Personalized Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Get custom study plans tailored to your specific needs
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                <div className="bg-green-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Track Your Progress</h3>
                  <p className="text-sm text-gray-600">
                    Monitor improvement with accurate baseline measurements
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Unlock All Features</h3>
                  <p className="text-sm text-gray-600">
                    Access advanced analytics and personalized insights
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Play className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quick & Easy</h3>
                  <p className="text-sm text-gray-600">
                    Just 10-15 questions to get started
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onTakePracticeTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="h-5 w-5 mr-2" />
                Take Practice Test Now
              </Button>
              <Button
                onClick={onDismiss}
                variant="outline"
                className="px-8 py-3 text-lg font-medium rounded-xl border-2 hover:bg-gray-50"
              >
                Maybe Later
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                💡 <strong>Pro Tip:</strong> The more questions you answer, the better our recommendations become!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeTestPrompt;
