import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Sparkles, Target, BookOpen, Trophy, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

// Media file paths
const targetWeaknessVideo = '/library/target my weakness.mp4';
const performanceVideo = '/library/performance.mp4';
const leaderboardImage = '/library/leaderboard.png';

interface WelcomePopupProps {
  userName: string;
  onClose: () => void;
  onGetStarted: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ 
  userName, 
  onClose, 
  onGetStarted 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to get1600.co!",
      subtitle: `Hi ${userName}! 🎉 We're excited to help you achieve your dream SAT score.`,
      content: (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-16 w-16 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your SAT Success Journey Starts Here
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto px-6">
            Get ready to unlock your potential with our AI-powered platform designed to help you reach your target score.
          </p>
        </div>
      )
    },
    {
      title: "Quiz that targets your weakness",
      subtitle: "AI-powered quizzes tailored to your strengths and weaknesses",
      content: (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-full max-w-4xl mx-auto">
              <video 
                className="w-full h-80 object-cover rounded-lg shadow-lg"
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
                <source src={targetWeaknessVideo} type="video/mp4" />
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
                  <div className="text-center">
                    <Target className="h-16 w-16 mx-auto mb-2" />
                    <p>Target Weakness Demo</p>
                  </div>
                </div>
              </video>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 px-6">Quiz that targets your weakness</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto px-6">
            Our AI analyzes your performance and creates custom quizzes that focus on your weakest areas, helping you improve faster and more efficiently.
          </p>
        </div>
      )
    },
    {
      title: "Solve from infinite questions",
      subtitle: "Access thousands of practice questions across all SAT topics",
      content: (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-6 rounded-full">
              <BookOpen className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 px-6">Solve from infinite questions</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto px-6">
            Practice with our extensive question bank featuring thousands of SAT questions across Math, Reading, and Writing. Never run out of practice material with our constantly updated database.
          </p>
        </div>
      )
    },
    {
      title: "Track Progress",
      subtitle: "Monitor your improvement with detailed analytics",
      content: (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-full max-w-4xl mx-auto">
              <video 
                className="w-full h-80 object-cover rounded-lg shadow-lg"
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
                <source src={performanceVideo} type="video/mp4" />
                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-2" />
                    <p>Performance Analytics Demo</p>
                  </div>
                </div>
              </video>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 px-6">Track Your Progress</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto px-6">
            Monitor your improvement with detailed analytics. See exactly where you're improving and what areas need more focus.
          </p>
        </div>
      )
    },
    {
      title: "Compete & Achieve",
      subtitle: "Join leaderboards and earn badges for motivation",
      content: (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-full max-w-4xl mx-auto">
              <img 
                src={leaderboardImage}
                alt="Leaderboard interface"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }}
              />
              <div className="w-full h-80 hidden items-center justify-center bg-orange-100 text-orange-600 rounded-lg">
                <div className="text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-2" />
                  <p>Leaderboard Demo</p>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 px-6">Compete & Achieve</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto px-6">
            Challenge friends or global users in weekly contests. Earn badges and track your rank to stay motivated and aim for a perfect SAT score.
          </p>
        </div>
      )
    },
    {
      title: "Ready to Start?",
      subtitle: "Join 10,000+ students already improving their scores",
      content: (
        <div className="text-center">
          <div className="bg-gray-50 rounded-xl p-6 mb-6 mx-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Join 10,000+ Students Already Improving Their Scores
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">350+</div>
                <div className="text-sm text-gray-600">Avg Score Improvement</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-600">Student Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">3K+</div>
                <div className="text-sm text-gray-600">Practice Questions</div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto px-6">
            💡 <strong>Pro Tip:</strong> Start with a practice quiz to get your personalized study plan!
          </p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white">
        <CardContent className="p-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="p-0">
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-lg">
            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              {currentStep > 0 && (
                <Button
                  onClick={prevStep}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
              
              {isLastStep ? (
                <div className="flex space-x-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                  >
                    Explore First
                  </Button>
                  <Button
                    onClick={onGetStarted}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Start Journey
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={nextStep}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePopup;
