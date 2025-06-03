
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Target, TrendingUp, Users } from 'lucide-react';

interface LandingScreenProps {
  onGetStarted: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">SAT AI Prep Ace</h1>
            </div>
            <Button 
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 text-sm md:text-base"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Master the SAT with
              <span className="block text-blue-600 mt-2">AI-Powered Practice</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience personalized SAT preparation with thousands of practice questions, 
              adaptive learning, and real-time performance tracking.
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Journey
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <Brain className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Smart Learning</h3>
              <p className="text-sm md:text-base text-gray-600">AI adapts to your learning style and identifies areas for improvement</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <Target className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Targeted Practice</h3>
              <p className="text-sm md:text-base text-gray-600">Focus on specific topics and question types that need work</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-sm md:text-base text-gray-600">Monitor your improvement with detailed analytics and insights</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 rounded-full p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-sm md:text-base text-gray-600">Join thousands of students achieving their SAT goals</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm md:text-base text-gray-600">
            © 2024 SAT AI Prep Ace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
