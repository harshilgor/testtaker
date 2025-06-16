
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Users, Target, Award, BarChart3, BookOpen } from 'lucide-react';
interface LandingScreenProps {
  onGetStarted: () => void;
}
const LandingScreen: React.FC<LandingScreenProps> = ({
  onGetStarted
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <div className="min-h-screen bg-white">
      {/* Sticky Transparent Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">get1600.co</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                🧠 Powered by Advanced AI
              </span>
              <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                Login / Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-8">
            An AI tutor made for <span className="text-blue-600">SAT</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your SAT preparation with personalized AI tutoring. Get more than 
            3000 + questions to practice from, real-time feedback, and comprehensive mock 
            tests designed to maximize your score.
          </p>
          
          <Button onClick={onGetStarted} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-8">
            Start Learning Today
          </Button>
          
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-20">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
            <span className="font-medium">Trusted by 10,000+ students worldwide</span>
          </div>

          <p className="text-gray-500 text-lg mb-12">
            Our students have gotten into top elite universities
          </p>
          
          <div className="flex items-center justify-center space-x-12 text-gray-400 text-2xl font-light">
            <span className="font-bold">Harvard</span>
            <span className="font-bold">MIT</span>
            <span className="font-bold">Stanford</span>
            <span className="font-bold">Yale</span>
            <span className="font-bold">Princeton</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-6">Practice non-stop, learn smarter.</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From personalized practice to comprehensive analytics, we've got your SAT preparation covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-blue-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-4">AI-Powered Tutoring</h4>
                <p className="text-gray-600 leading-relaxed">
                  Advanced algorithms analyze your performance and adapt questions to your 
                  skill level, ensuring optimal learning efficiency.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-green-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-4">Unlimited Practice</h4>
                <p className="text-gray-600 leading-relaxed">
                  Solve from over 3000 questions, 30+ mock tests and unlimited AI generated questions
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-purple-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-4">Real SAT Experience</h4>
                <p className="text-gray-600 leading-relaxed">
                  Full-length mock tests simulate the actual SAT environment, preparing you for test 
                  day with realistic timing and format.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-4xl font-bold text-blue-600">10K+</span>
                </div>
                <p className="text-gray-600 font-medium">Students Served</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-4xl font-bold text-green-600">350+</span>
                </div>
                <p className="text-gray-600 font-medium">Average Score Improvement</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-3">
                  <Award className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-4xl font-bold text-purple-600">98%</span>
                </div>
                <p className="text-gray-600 font-medium">Student Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-white text-3xl md:text-4xl font-bold mb-6">
            - from a student who faced problems finding resources to practice for SAT
          </h3>
          
          <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students who have improved their scores with our AI-powered platform.
          </p>
          
          <Button onClick={onGetStarted} size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-4">
            Start now
          </Button>
          
          <p className="text-blue-200 text-sm">
            Lets get that dream SAT score 🚀
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">get1600.co</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-6 pt-6 text-center">
            <p className="text-slate-400">San Francisco                                      
                                                          © 2025 get1600.co . All rights reserved. By Harshil Gor</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingScreen;
