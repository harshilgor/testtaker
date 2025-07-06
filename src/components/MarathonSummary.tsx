
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, Award } from 'lucide-react';
import { getSessionTotalPoints } from '@/services/pointsService';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface MarathonSummaryProps {
  sessionStats: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    showAnswerUsed: number;
    timeSpent: number;
    pointsEarned: number;
  };
  sessionId?: string;
  onBackToDashboard: () => void;
  onBackToSettings: () => void;
  userName: string;
}

const MarathonSummary: React.FC<MarathonSummaryProps> = ({
  sessionStats,
  sessionId,
  onBackToDashboard,
  onBackToSettings,
  userName
}) => {
  const [actualPointsEarned, setActualPointsEarned] = useState(sessionStats.pointsEarned);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useResponsiveLayout();

  useEffect(() => {
    const fetchActualPoints = async () => {
      if (sessionId) {
        try {
          console.log('MarathonSummary: Fetching actual points for session:', sessionId);
          const points = await getSessionTotalPoints(sessionId, 'marathon');
          console.log('MarathonSummary: Actual points from database:', points);
          setActualPointsEarned(points);
        } catch (error) {
          console.error('MarathonSummary: Error fetching session points:', error);
          // Calculate points based on correct answers if database fetch fails
          const calculatedPoints = sessionStats.correctAnswers * 10;
          setActualPointsEarned(calculatedPoints);
        }
      } else {
        // Calculate points based on correct answers
        const calculatedPoints = sessionStats.correctAnswers * 10;
        setActualPointsEarned(calculatedPoints);
      }
      setLoading(false);
    };

    fetchActualPoints();
  }, [sessionId, sessionStats.pointsEarned, sessionStats.correctAnswers]);

  const accuracy = sessionStats.totalQuestions > 0 
    ? Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100) 
    : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-3 md:py-6 px-2 md:px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <CardContent className={`${isMobile ? 'p-3' : 'p-6 md:p-8'}`}>
            {/* Header Section */}
            <div className={`text-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
              <div className={`rounded-full ${isMobile ? 'p-3 w-16 h-16' : 'p-6 w-24 h-24'} mx-auto ${isMobile ? 'mb-3' : 'mb-6'} flex items-center justify-center ${
                accuracy >= 70 ? 'bg-blue-100' : accuracy >= 50 ? 'bg-gray-100' : 'bg-red-100'
              }`}>
                <Trophy className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} ${
                  accuracy >= 70 ? 'text-blue-600' : accuracy >= 50 ? 'text-gray-600' : 'text-red-600'
                }`} />
              </div>
              <h2 className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} font-bold text-gray-900 ${isMobile ? 'mb-1' : 'mb-3'}`}>Marathon Complete!</h2>
              <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-lg'}`}>Great job, {userName}!</p>
            </div>

            {/* Stats Grid */}
            <div className={`grid grid-cols-2 ${isMobile ? 'gap-2 mb-4' : 'gap-4 md:gap-6 mb-8'}`}>
              <Card className="bg-blue-50 border-blue-100 rounded-xl">
                <CardContent className={`${isMobile ? 'p-2' : 'p-4 md:p-6'} text-center`}>
                  <div className={`flex items-center justify-center ${isMobile ? 'mb-1' : 'mb-3'}`}>
                    <Target className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-blue-600 ${isMobile ? 'mr-1' : 'mr-2'}`} />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-700 font-medium`}>Questions</span>
                  </div>
                  <div className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold text-blue-800 ${isMobile ? 'mb-0' : 'mb-1'}`}>{sessionStats.totalQuestions}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-blue-600`}>Attempted</div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-100 rounded-xl">
                <CardContent className={`${isMobile ? 'p-2' : 'p-4 md:p-6'} text-center`}>
                  <div className={`flex items-center justify-center ${isMobile ? 'mb-1' : 'mb-3'}`}>
                    <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-green-600 ${isMobile ? 'mr-1' : 'mr-2'}`} />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-green-700 font-medium`}>Correct</span>
                  </div>
                  <div className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold text-green-800 ${isMobile ? 'mb-0' : 'mb-1'}`}>{sessionStats.correctAnswers}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-green-600`}>Answers</div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-100 rounded-xl">
                <CardContent className={`${isMobile ? 'p-2' : 'p-4 md:p-6'} text-center`}>
                  <div className={`flex items-center justify-center ${isMobile ? 'mb-1' : 'mb-3'}`}>
                    <Target className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-red-600 ${isMobile ? 'mr-1' : 'mr-2'}`} />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-700 font-medium`}>Wrong</span>
                  </div>
                  <div className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold text-red-800 ${isMobile ? 'mb-0' : 'mb-1'}`}>{sessionStats.incorrectAnswers}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-red-600`}>Answers</div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-100 rounded-xl">
                <CardContent className={`${isMobile ? 'p-2' : 'p-4 md:p-6'} text-center`}>
                  <div className={`flex items-center justify-center ${isMobile ? 'mb-1' : 'mb-3'}`}>
                    <Award className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-purple-600 ${isMobile ? 'mr-1' : 'mr-2'}`} />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-purple-700 font-medium`}>Points</span>
                  </div>
                  <div className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold text-purple-800 ${isMobile ? 'mb-0' : 'mb-1'}`}>
                    {loading ? '...' : actualPointsEarned}
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-purple-600`}>Earned</div>
                </CardContent>
              </Card>
            </div>

            {/* Accuracy and Time Section - Equal Heights and Font Sizes */}
            <div className={`grid grid-cols-2 ${isMobile ? 'gap-3 mb-4' : 'gap-6 mb-8'}`}>
              <div className={`text-center ${isMobile ? 'h-20' : 'h-40'} flex flex-col justify-center`}>
                <div className={`${isMobile ? 'text-3xl' : 'text-6xl md:text-7xl'} font-bold text-blue-600 ${isMobile ? 'mb-1' : 'mb-3'}`}>{accuracy}%</div>
                <div className={`text-gray-600 font-medium ${isMobile ? 'text-xs' : 'text-lg'}`}>Overall Accuracy</div>
              </div>
              
              <div className={`text-center ${isMobile ? 'h-20' : 'h-40'} flex flex-col justify-center`}>
                <div className={`flex items-center justify-center ${isMobile ? 'mb-1' : 'mb-3'}`}>
                  <Clock className={`${isMobile ? 'h-3 w-3' : 'h-6 w-6'} text-gray-600 ${isMobile ? 'mr-1' : 'mr-2'}`} />
                </div>
                <div className={`${isMobile ? 'text-2xl' : 'text-6xl md:text-7xl'} font-bold text-gray-800 ${isMobile ? 'mb-1' : 'mb-3'}`}>{formatTime(sessionStats.timeSpent)}</div>
                <div className={`text-gray-600 font-medium ${isMobile ? 'text-xs' : 'text-lg'}`}>Time Spent</div>
              </div>
            </div>

            {/* Show Answer Used Section */}
            {sessionStats.showAnswerUsed > 0 && (
              <Card className={`bg-orange-50 border-orange-100 rounded-xl ${isMobile ? 'mb-4' : 'mb-8'}`}>
                <CardContent className={`${isMobile ? 'p-2' : 'p-4'} text-center`}>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-orange-700 ${isMobile ? 'mb-0' : 'mb-1'} font-medium`}>Show Answer Used</div>
                  <div className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-orange-800`}>{sessionStats.showAnswerUsed} times</div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons with proper spacing */}
            <div className={`flex flex-col sm:flex-row ${isMobile ? 'gap-2' : 'gap-4'} justify-center ${isMobile ? 'px-2' : 'px-4'}`}>
              <Button
                onClick={onBackToSettings}
                variant="outline"
                className={`border-blue-600 text-blue-600 hover:bg-blue-50 ${isMobile ? 'px-4 py-2' : 'px-8 py-3'} rounded-xl font-medium ${isMobile ? 'min-h-[40px]' : 'min-h-[48px]'} ${isMobile ? 'text-sm' : ''}`}
              >
                New Marathon
              </Button>
              <Button
                onClick={onBackToDashboard}
                className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'px-4 py-2' : 'px-8 py-3'} rounded-xl font-medium ${isMobile ? 'min-h-[40px]' : 'min-h-[48px]'} ${isMobile ? 'text-sm' : ''}`}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarathonSummary;
