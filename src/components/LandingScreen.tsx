
import React from 'react';
import { GraduationCap, Brain, Target, Award, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LandingScreenProps {
  onGetStarted: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">TestTaker.ai</h1>
        </div>
        <Button onClick={onGetStarted} variant="outline" className="border-slate-300 hover:bg-slate-50">
          Get Started
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="h-4 w-4 mr-2" />
            Powered by Advanced AI
          </div>
          
          <h2 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
            An AI tutor made for
            <span className="text-blue-600"> SAT success</span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Transform your SAT preparation with personalized AI tutoring. Get unlimited practice questions, 
            real-time feedback, and comprehensive mock tests designed to maximize your score.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={onGetStarted} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Learning Today
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl"
            >
              See How It Works
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-slate-500">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
              <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-sm font-medium">Trusted by 10,000+ students worldwide</span>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="text-center mb-20">
          <p className="text-slate-500 font-medium mb-8">Trusted by top students preparing for elite universities</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-slate-400">Harvard</div>
            <div className="text-2xl font-bold text-slate-400">MIT</div>
            <div className="text-2xl font-bold text-slate-400">Stanford</div>
            <div className="text-2xl font-bold text-slate-400">Yale</div>
            <div className="text-2xl font-bold text-slate-400">Princeton</div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">Save hours, learn smarter.</h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From personalized practice to comprehensive analytics, we've got your SAT preparation covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Tutoring</h4>
                <p className="text-slate-600 leading-relaxed">
                  Advanced algorithms analyze your performance and adapt questions to your skill level, 
                  ensuring optimal learning efficiency.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Unlimited Practice</h4>
                <p className="text-slate-600 leading-relaxed">
                  Marathon mode provides endless practice questions in Math and English, 
                  with instant feedback and detailed explanations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Real SAT Experience</h4>
                <p className="text-slate-600 leading-relaxed">
                  Full-length mock tests simulate the actual SAT environment, 
                  preparing you for test day with realistic timing and format.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-4xl font-bold text-slate-900">10K+</span>
              </div>
              <p className="text-slate-600 font-medium">Students Served</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-4xl font-bold text-slate-900">150+</span>
              </div>
              <p className="text-slate-600 font-medium">Average Score Improvement</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-purple-600 mr-2" />
                <span className="text-4xl font-bold text-slate-900">98%</span>
              </div>
              <p className="text-slate-600 font-medium">Student Satisfaction</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h3 className="text-4xl font-bold mb-4">Ready to ace your SAT?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have improved their scores with our AI-powered platform.
          </p>
          <Button 
            onClick={onGetStarted} 
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Your Free Trial
          </Button>
          <p className="text-sm text-blue-200 mt-4">No credit card required • 7-day free trial</p>
        </div>
      </main>
    </div>
  );
};

export default LandingScreen;
