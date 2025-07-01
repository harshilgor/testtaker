
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, Trophy, TrendingUp } from 'lucide-react';

interface LandingScreenProps {
  onGetStarted: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SAT Practice</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master the SAT with
            <span className="text-blue-600 block">Confidence</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Best website to practice for SAT - Access thousands of real practice questions, 
            take full mock tests, and track your progress with detailed analytics.
          </p>

          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started Free
          </Button>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="bg-blue-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Marathon Mode</h3>
                <p className="text-gray-600 text-sm">Practice unlimited questions with real-time feedback and progress tracking</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="bg-purple-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mock Tests</h3>
                <p className="text-gray-600 text-sm">Take full-length practice tests with realistic timing and scoring</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="bg-green-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Analytics</h3>
                <p className="text-gray-600 text-sm">Detailed insights into your performance and areas for improvement</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto">
          © 2024 SAT Practice. Built to help students succeed.
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
