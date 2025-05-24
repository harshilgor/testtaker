import React from 'react';
import { GraduationCap, Brain, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface LandingScreenProps {
  onGetStarted: () => void;
}
const LandingScreen: React.FC<LandingScreenProps> = ({
  onGetStarted
}) => {
  return <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6 mx-[51px] my-[15px]">
            <GraduationCap className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">Testtaker.ai</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">With unlimited questions Master the SAT with our AI-powered test preparation platform. Get personalized practice questions, comprehensive mock tests, and intelligent feedback to achieve your target score.</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Learning</h3>
            <p className="text-gray-600">
              Advanced algorithms adapt to your learning style and identify areas for improvement.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Targeted Practice</h3>
            <p className="text-gray-600">
              Marathon mode provides unlimited practice questions in Math and English.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real SAT Experience</h3>
            <p className="text-gray-600">
              Full-length mock tests simulate the actual SAT testing environment.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
          Get Started
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Join thousands of students who improved their SAT scores
        </p>
      </div>
    </div>;
};
export default LandingScreen;