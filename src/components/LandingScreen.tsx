
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

  const handleGetStarted = (e: React.MouseEvent) => {
    console.log('Button clicked!', e);
    e.preventDefault();
    e.stopPropagation();
    onGetStarted();
  };

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
              <div className="bg-blue-600 rounded-lg p-1.5 sm:p-2">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">get1600.co</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Hide AI badge on mobile, show on desktop */}
              <span className="hidden sm:inline-flex text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                🧠 Powered by Advanced AI
              </span>
              <Button 
                onClick={handleGetStarted} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-medium text-sm sm:text-base whitespace-nowrap cursor-pointer"
              >
                Login / Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6 sm:mb-8">
            The worlds best <span className="text-blue-600">SAT prep Website!</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
            Get real-time feedback on every question, adaptive drills tailored to your strengths, and access 3,000+ practice problems plus 10+ full-length mock exams.
          </p>
          
          <Button 
            onClick={handleGetStarted} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-6 sm:mb-8 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto cursor-pointer"
          >
            Start Learning Today
          </Button>
          
          <div className="flex items-center justify-center space-x-2 text-gray-600 px-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
            </div>
            <span className="font-medium text-sm sm:text-base text-center">Trusted by 10,000+ students worldwide</span>
          </div>
        </div>
      </section>

      {/* University Section */}
      <section className="py-8 sm:py-12 bg-white px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
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
          
          <div className="max-w-7xl mx-auto space-y-12 mb-16 sm:mb-20">
            {/* Feature 1: Unlock Your SAT Insights */}
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-96">
                    <video 
                      className="w-full h-full object-contain bg-slate-50"
                      autoPlay 
                      muted 
                      loop
                      playsInline
                      preload="metadata"
                      onError={(e) => {
                        console.error('Video failed to load:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    >
                      <source src="/library/performance.mp4" type="video/mp4" />
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <div className="text-center">
                          <BarChart3 className="h-16 w-16 mx-auto mb-2" />
                          <p>Performance Analytics Demo</p>
                        </div>
                      </div>
                    </video>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900">Unlock Your SAT Insights</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-base">
                      Track your strengths and weaknesses with detailed analytics for Math, Reading, and Writing. Use personalized insights like "Target My Weakness" to focus on skills you need most. Boost your score with data-driven prep.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: Review Your Mistakes */}
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-96 order-2 lg:order-1">
                    <video 
                      className="w-full h-full object-contain bg-slate-50"
                      autoPlay 
                      muted 
                      loop
                      playsInline
                      preload="metadata"
                      onError={(e) => {
                        console.error('Video failed to load:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    >
                      <source src="/library/learn.mp4" type="video/mp4" />
                      <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-600">
                        <div className="text-center">
                          <BookOpen className="h-16 w-16 mx-auto mb-2" />
                          <p>Learning Demo</p>
                        </div>
                      </div>
                    </video>
                  </div>
                  <div className="p-8 flex flex-col justify-center order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-teal-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900">Learn from Every Error</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-base">
                      Get instant explanations and step-by-step breakdowns for every mistake. Turn weaknesses into strengths with targeted drills and AI-powered feedback tailored to your needs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Practice in 3 Modes */}
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-96">
                    <img 
                      src="/library/homepage.png" 
                      alt="Practice modes interface"
                      className="w-full h-full object-contain bg-slate-50"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full hidden items-center justify-center bg-slate-100 text-slate-600">
                      <div className="text-center">
                        <Target className="h-16 w-16 mx-auto mb-2" />
                        <p>Practice Modes Demo</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Target className="h-6 w-6 text-slate-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900">Train Your Way</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-base">
                      Choose Full Timed Tests, Topic Drills, or Adaptive Quizzes like "Target My Weakness" to fit your prep style. Flexible practice keeps you engaged and improving daily.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4: Compete with Others */}
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-96 order-2 lg:order-1">
                    <img 
                      src="/library/leaderboard.png" 
                      alt="Leaderboard interface"
                      className="w-full h-full object-contain bg-slate-50"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full hidden items-center justify-center bg-teal-100 text-teal-600">
                      <div className="text-center">
                        <Award className="h-16 w-16 mx-auto mb-2" />
                        <p>Leaderboard Demo</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Award className="h-6 w-6 text-teal-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900">Rise Up the Leaderboard</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-base">
                      Challenge friends or global users in weekly contests. Earn badges and track your rank to stay motivated and aim for a perfect SAT score.
                    </p>
                  </div>
                </div>
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
            onClick={handleGetStarted} 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-3 sm:mb-4 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto cursor-pointer"
          >
            Start now
          </Button>
          
          <p className="text-blue-200 text-sm px-4">
            Lets get that dream SAT score 🚀
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Logo */}
            <div className="lg:col-span-1">
              <div className="mb-8">
                <div className="text-2xl font-serif text-white leading-tight">
                  <div>get1600</div>
                  <div>.co</div>
                </div>
              </div>
            </div>

            {/* CAREERS */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Careers</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Overview</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Students</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Life at get1600</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Featured Locations</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  Open Roles
                  <svg className="h-3 w-3 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Disability Accommodation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Statement on Equal Employment Opportunities</a></li>
              </ul>
            </div>

            {/* RESOURCES */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Student Logins</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Teacher Login</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pressroom</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Investor Relations</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Alumni Network</a></li>
              </ul>
              </div>

            {/* OUR SERVICES */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Our Services</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Practice Tests</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mock Exams</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  Adaptive Learning
                  <svg className="h-3 w-3 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  Performance Analytics
                  <svg className="h-3 w-3 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Study Plans</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  Question Bank
                  <svg className="h-3 w-3 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  Score Predictions
                  <svg className="h-3 w-3 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tutoring Services</a></li>
              </ul>
            </div>
            
            {/* CONNECT */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Connect</h4>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-300 text-sm">
                © 2025 get1600.co. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center space-x-8 text-sm">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy and Cookies</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  Your Privacy Choices
                  <svg className="h-4 w-4 ml-1 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms & Conditions</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Security & Fraud Awareness</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Regulatory Disclosures</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
