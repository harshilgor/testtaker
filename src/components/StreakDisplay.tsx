
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Award, Calendar } from 'lucide-react';
import { useUserStreak } from '@/hooks/useUserStreak';

interface StreakDisplayProps {
  userName: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ userName }) => {
  const { streakData, isLoading } = useUserStreak(userName);

  console.log('StreakDisplay - isLoading:', isLoading, 'streakData:', streakData);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-orange-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-orange-100 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate week view for streak display
  const getWeekView = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date();
    const currentDay = today.getDay();
    const mondayIndex = currentDay === 0 ? 6 : currentDay - 1; // Convert Sunday=0 to Monday=0 system
    
    return days.map((day, index) => {
      const isToday = index === mondayIndex;
      const daysPastMonday = index;
      
      // Show completed if within current streak and not future days
      const isCompleted = streakData && streakData.current_streak > 0 && 
                         daysPastMonday <= mondayIndex && 
                         streakData.current_streak >= (mondayIndex - daysPastMonday + 1);
      
      return { day, isCompleted, isToday };
    });
  };

  // Always show streak display, even if streak is 0
  if (streakData) {
    const { current_streak, longest_streak } = streakData;
    const weekView = getWeekView();

    // Show active streak display
    if (current_streak > 0) {
      return (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-3 flex items-center justify-center">
                  <Flame className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="text-3xl mr-2">🔥</span>
                    {current_streak}
                    <span className="text-sm text-gray-600 ml-2">day streak</span>
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

            {/* Week view */}
            <div className="flex justify-between items-center mb-4">
              {weekView.map((item, index) => (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.isCompleted 
                        ? 'bg-green-500 text-white' 
                        : item.isToday 
                          ? 'bg-orange-300 border-2 border-orange-500' 
                          : 'border-2 border-gray-200'
                    }`}
                  >
                    {item.isCompleted && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{item.day}</div>
                </div>
              ))}
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
    }
  }

  // Show start streak message if no streak or streak is 0
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
};

export default StreakDisplay;
