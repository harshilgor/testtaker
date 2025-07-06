
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, Award } from 'lucide-react';
import { getSessionTotalPoints } from '@/services/pointsService';

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
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className={`rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center ${
                accuracy >= 70 ? 'bg-blue-100' : accuracy >= 50 ? 'bg-gray-100' : 'bg-red-100'
              }`}>
                <Trophy className={`h-12 w-12 ${
                  accuracy >= 70 ? 'text-blue-600' : accuracy >= 50 ? 'text-gray-600' : 'text-red-600'
                }`} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Marathon Complete!</h2>
              <p className="text-gray-600 text-lg">Great job, {userName}!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
              <Card className="bg-blue-50 border-blue-100 rounded-xl">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-700 font-medium">Questions</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-800 mb-1">{sessionStats.totalQuestions}</div>
                  <div className="text-xs text-blue-600">Attempted</div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-100 rounded-xl">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Trophy className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-sm text-green-700 font-medium">Correct</span>
                  </div>
                  <div className="text-3xl font-bold text-green-800 mb-1">{sessionStats.correctAnswers}</div>
                  <div className="text-xs text-green-600">Answers</div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-100 rounded-xl">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-red-600 mr-2" />
                    <span className="text-sm text-red-700 font-medium">Wrong</span>
                  </div>
                  <div className="text-3xl font-bold text-red-800 mb-1">{sessionStats.incorrectAnswers}</div>
                  <div className="text-xs text-red-600">Answers</div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-100 rounded-xl">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-purple-600 mr-2" />
                    <span className="text-sm text-purple-700 font-medium">Points</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-800 mb-1">
                    {loading ? '...' : actualPointsEarned}
                  </div>
                  <div className="text-xs text-purple-600">Earned</div>
                </CardContent>
              </Card>
            </div>

            {/* Accuracy and Time Section - Equal Heights and Font Sizes */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center h-40 flex flex-col justify-center">
                <div className="text-6xl md:text-7xl font-bold text-blue-600 mb-3">{accuracy}%</div>
                <div className="text-gray-600 font-medium text-lg">Overall Accuracy</div>
              </div>
              
              <div className="text-center h-40 flex flex-col justify-center">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-gray-600 mr-2" />
                </div>
                <div className="text-6xl md:text-7xl font-bold text-gray-800 mb-3">{formatTime(sessionStats.timeSpent)}</div>
                <div className="text-gray-600 font-medium text-lg">Time Spent</div>
              </div>
            </div>

            {/* Show Answer Used Section */}
            {sessionStats.showAnswerUsed > 0 && (
              <Card className="bg-orange-50 border-orange-100 rounded-xl mb-8">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-orange-700 mb-1 font-medium">Show Answer Used</div>
                  <div className="text-xl font-bold text-orange-800">{sessionStats.showAnswerUsed} times</div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons with proper spacing */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button
                onClick={onBackToSettings}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-medium min-h-[48px]"
              >
                New Marathon
              </Button>
              <Button
                onClick={onBackToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium min-h-[48px]"
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
