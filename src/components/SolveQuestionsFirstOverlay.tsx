import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Target, BookOpen, Trophy } from 'lucide-react';

interface SolveQuestionsFirstOverlayProps {
  onTakeQuiz: () => void;
}

const SolveQuestionsFirstOverlay: React.FC<SolveQuestionsFirstOverlayProps> = ({ 
  onTakeQuiz 
}) => {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-12 text-white rounded-t-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Play className="h-20 w-20 text-yellow-300 mr-4" />
                <h1 className="text-4xl font-bold">Solve Some Questions First!</h1>
              </div>
              <p className="text-2xl text-blue-100">
                Start your SAT journey by taking a practice quiz
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Start with Practice Questions?
              </h2>
              <p className="text-gray-600 text-xl leading-relaxed max-w-4xl mx-auto">
                Our learning features are designed to help you improve based on your performance. 
                Take a few practice questions first so we can understand your current level and provide personalized recommendations.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-xl">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Personalized Learning</h3>
                <p className="text-sm text-gray-600">
                  Get custom study plans based on your performance
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-green-50 rounded-xl">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Track Progress</h3>
                <p className="text-sm text-gray-600">
                  Monitor your improvement over time
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-purple-50 rounded-xl">
                <div className="bg-purple-100 p-4 rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Unlock Features</h3>
                <p className="text-sm text-gray-600">
                  Access advanced analytics and insights
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-orange-50 rounded-xl">
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                  <Play className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Quick Start</h3>
                <p className="text-sm text-gray-600">
                  Just 10-15 questions to get started
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={onTakeQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="h-6 w-6 mr-3" />
                Start Practice Quiz Now
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-lg text-gray-500">
                💡 <strong>Pro Tip:</strong> The more questions you answer, the better our recommendations become!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolveQuestionsFirstOverlay;
