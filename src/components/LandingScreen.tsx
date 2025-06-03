
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, BarChart3, Users, BookOpen, Star, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import LoginSignup from './LoginSignup';

interface LandingScreenProps {
  onGetStarted: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const testimonials = [
    {
      name: "Sarah Chen",
      score: "1520",
      text: "The AI tutor helped me identify my weak areas and gave me personalized practice. I improved my score by 180 points!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      score: "1480",
      text: "24/7 AI assistance made all the difference. I could practice anytime and get instant feedback on my mistakes.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      score: "1550",
      text: "The mock tests were incredibly realistic. The AI explanations helped me understand concepts I'd been struggling with for months.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "David Kim",
      score: "1460",
      text: "The performance analytics showed me exactly where to focus my study time. So much better than generic prep books!",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Jessica Wu",
      score: "1530",
      text: "I love how the AI adapts to my learning style. It's like having a personal tutor available 24/7.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Alex Thompson",
      score: "1490",
      text: "The instant feedback feature is game-changing. I could see my improvement in real-time.",
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=64&h=64&fit=crop&crop=face",
      rating: 5
    }
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Real-time Performance Tracking",
      description: "Monitor your progress with detailed analytics and personalized insights that adapt to your learning style."
    },
    {
      icon: Brain,
      title: "Adaptive Learning AI",
      description: "Our AI identifies your weak points and creates custom practice sessions to target areas needing improvement."
    },
    {
      icon: BookOpen,
      title: "AI-Generated Explanations",
      description: "Get instant, detailed explanations for every answer with step-by-step breakdowns from our AI tutor."
    }
  ];

  const comparisonData = [
    { feature: "24/7 Availability", us: true, tutors: false, books: false, apps: true },
    { feature: "Unlimited Practice Questions", us: true, tutors: false, books: false, apps: false },
    { feature: "Instant Scoring & Feedback", us: true, tutors: false, books: false, apps: true },
    { feature: "Personalized Study Plans", us: true, tutors: true, books: false, apps: false },
    { feature: "Full-Length Mock Tests", us: true, tutors: true, books: true, apps: false },
    { feature: "Affordable Pricing", us: true, tutors: false, books: true, apps: true }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Transparent Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">SAT AI Prep Ace</h1>
            </div>
            <div className="flex items-center space-x-3">
              <LoginSignup onLogin={onGetStarted} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Master the SAT with
                <span className="text-blue-600 block mt-2">Personalized AI Tutoring</span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
                Access 3,000+ SAT practice questions, 30+ full-length mock tests, instant feedback, 
                and personalized analytics—all in one place.
              </p>
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-8"
              >
                Start Practicing for Free
              </Button>
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-slate-600">
                <Users className="h-5 w-5" />
                <span className="text-lg font-medium">Trusted by over 10,000 students preparing for the SAT</span>
              </div>
            </div>
            
            {/* AI Tutor Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-4 flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-white text-sm font-medium">AI Tutor Dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-600 rounded-full p-2">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 flex-1">
                      <p className="text-sm text-slate-800">Based on your recent practice, I recommend focusing on algebra and data analysis. Your geometry skills are excellent!</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">85%</p>
                      <p className="text-sm text-slate-600">Math Score</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">78%</p>
                      <p className="text-sm text-slate-600">Reading Score</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-slate-800 mb-2">Next Study Session</p>
                    <p className="text-xs text-slate-600">Practice 15 algebra questions focusing on quadratic equations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Scrolling Testimonials */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">What Our Students Say</h3>
            <p className="text-lg text-slate-600">Real results from real students</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <Card className="bg-white border border-slate-200 shadow-lg">
                      <CardContent className="p-8 text-center">
                        <div className="flex justify-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-lg text-slate-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                        <div className="flex items-center justify-center space-x-4">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{testimonial.name}</p>
                            <p className="text-sm text-blue-600 font-medium">SAT Score: {testimonial.score}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Our AI Tutor?</h3>
            <p className="text-lg text-slate-600">Advanced features designed for your success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">How We Compare</h3>
            <p className="text-lg text-slate-600">See why our AI tutor outperforms traditional methods</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg border border-slate-200">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-4 font-semibold text-slate-900">Features</th>
                  <th className="text-center p-4 font-semibold text-blue-600">SAT AI Prep Ace</th>
                  <th className="text-center p-4 font-semibold text-slate-600">Private Tutors</th>
                  <th className="text-center p-4 font-semibold text-slate-600">Prep Books</th>
                  <th className="text-center p-4 font-semibold text-slate-600">Other Apps</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-25">
                    <td className="p-4 font-medium text-slate-900">{row.feature}</td>
                    <td className="text-center p-4">
                      {row.us ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {row.tutors ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {row.books ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {row.apps ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Ace the SAT?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students on their path to SAT success with our AI-powered platform
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 rounded-lg p-2">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">SAT AI Prep Ace</h3>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md">
                The most advanced AI-powered SAT preparation platform. Achieve your target score with personalized learning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">© 2024 SAT AI Prep Ace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
