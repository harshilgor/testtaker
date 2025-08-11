
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Users, Target, Award, BarChart3, BookOpen } from 'lucide-react';
import logo1600 from '@/assets/logo-1600.png';

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Sticky Transparent Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src={logo1600} alt="get1600" className="h-6 sm:h-8 w-auto" />
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">get1600.co</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Hide AI badge on mobile, show on desktop */}
              <span className="hidden sm:inline-flex text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                🧠 Powered by Advanced AI
              </span>
              <Button 
                onClick={onGetStarted} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-medium text-sm sm:text-base whitespace-nowrap"
              >
                Login / Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6 sm:mb-8">
            An AI tutor made for <span className="text-blue-600">SAT</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
            Get real-time feedback on every question, adaptive drills tailored to your strengths, and access 3,000+ practice problems plus 10+ full-length mock exams.
          </p>
          
          <Button 
            onClick={onGetStarted} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-6 sm:mb-8 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
          >
            Start Learning Today
          </Button>
          
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-16 sm:mb-20 px-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
            </div>
            <span className="font-medium text-sm sm:text-base text-center">Trusted by 10,000+ students worldwide</span>
          </div>

          <p className="text-gray-500 text-base sm:text-lg mb-8 sm:mb-12 px-4">
            Our students have gotten into top elite universities
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12 text-gray-400 text-lg sm:text-2xl font-light px-4">
            <span className="font-bold">Harvard</span>
            <span className="font-bold">MIT</span>
            <span className="font-bold">Stanford</span>
            <span className="font-bold">Yale</span>
            <span className="font-bold">Princeton</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">What do we have to offer?</h3>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              From personalized practice to comprehensive analytics, we've got your SAT preparation covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
            <Card className="p-6 sm:p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-blue-100 rounded-2xl p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Focus on your weakness</h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Adaptive learning mode to analyze your performance and adapt questions to your skill level, ensuring optimal learning efficiency.</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 sm:p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-green-100 rounded-2xl p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Unlimited Practice</h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Solve from over 3000 questions and unlimited AI generated questions</p>
              </CardContent>
            </Card>
            
            <Card className="p-6 sm:p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="bg-purple-100 rounded-2xl p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Real SAT Experience</h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">20+ Full-length mock tests simulate the actual SAT environment</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-12 sm:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                  <span className="text-3xl sm:text-4xl font-bold text-blue-600">10K+</span>
                </div>
                <p className="text-gray-600 font-medium text-sm sm:text-base">Students Served</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                  <span className="text-3xl sm:text-4xl font-bold text-green-600">350+</span>
                </div>
                <p className="text-gray-600 font-medium text-sm sm:text-base">Average Score Improvement</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2" />
                  <span className="text-3xl sm:text-4xl font-bold text-purple-600">98%</span>
                </div>
                <p className="text-gray-600 font-medium text-sm sm:text-base">Student Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">- The only SAT prep website you need</h3>
          
          <p className="text-blue-100 text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Join thousands of students who have improved their scores with our AI-powered platform.
          </p>
          
          <Button 
            onClick={onGetStarted} 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-3 sm:mb-4 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
          >
            Start now
          </Button>
          
          <p className="text-blue-200 text-sm px-4">
            Lets get that dream SAT score 🚀
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src={logo1600} alt="get1600" className="h-4 sm:h-5 w-auto" />
              <span className="text-base sm:text-lg font-semibold">get1600.co</span>
            </div>
            
            <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-4 sm:mt-6 pt-4 sm:pt-6 text-center">
            <p className="text-slate-400 text-xs sm:text-sm px-2">
              San Francisco - If you have any feedback contact - harshilgor06@gmail.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
