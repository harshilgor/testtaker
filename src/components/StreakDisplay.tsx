
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Award, Calendar } from 'lucide-react';
import { useUserStreak } from '@/hooks/useUserStreak';

interface StreakDisplayProps {
  userName: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ userName }) => {
  const { streakData, isLoading, refetch } = useUserStreak(userName);

  // Refetch streak data when component mounts
  useEffect(() => {
    if (userName) {
      refetch();
    }
  }, [userName, refetch]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-orange-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-orange-100 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData || streakData.current_streak === 0) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-200 rounded-full p-3">
              <Flame className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Start Your Streak!</h3>
              <p className="text-gray-600 text-sm">Complete a practice session to begin your learning streak</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current_streak, longest_streak } = streakData;

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                🔥 {current_streak}-day streak!
              </h3>
              <p className="text-gray-600">
                {current_streak === 1 
                  ? "Great start! Keep practicing to build your streak." 
                  : "Amazing! You're building great study habits."
                }
              </p>
            </div>
          </div>
          
          {longest_streak > current_streak && (
            <div className="text-right">
              <div className="flex items-center space-x-2 text-gray-600">
                <Award className="h-5 w-5" />
                <span className="text-sm">Personal Best</span>
              </div>
              <p className="text-xl font-semibold text-gray-800">{longest_streak} days</p>
            </div>
          )}
        </div>
        
        {current_streak >= 7 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                {current_streak >= 30 ? "🏆 Streak Master!" : 
                 current_streak >= 14 ? "🎯 Streak Champion!" : 
                 "⭐ Week Warrior!"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;
