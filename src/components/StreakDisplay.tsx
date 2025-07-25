
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
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-orange-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-orange-100 rounded w-24"></div>
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
    const mondayIndex = currentDay === 0 ? 6 : currentDay - 1;
    
    // Get user's login activity for this week
    const weeklyActivity = getUserWeeklyActivity();
    
    return days.map((day, index) => {
      const isToday = index === mondayIndex;
      const hasActivity = weeklyActivity[index] || false;
      
      return { day, hasActivity, isToday };
    });
  };

  // Function to check user's weekly activity
  const getUserWeeklyActivity = () => {
    const activity = [false, false, false, false, false, false, false];
    const today = new Date();
    const currentDay = today.getDay();
    const mondayIndex = currentDay === 0 ? 6 : currentDay - 1;
    
    // Get user's login history from localStorage or create based on streak
    const loginHistory = JSON.parse(localStorage.getItem('userLoginHistory') || '[]');
    
    // Calculate dates for this week
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayIndex);
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + i);
      const dateString = checkDate.toDateString();
      
      // Check if user has activity on this date
      const hasLogin = loginHistory.some((login: any) => 
        new Date(login.date).toDateString() === dateString
      );
      
      // Also check if it's within current streak
      const isWithinStreak = streakData && streakData.current_streak > 0 && 
                           i <= mondayIndex && 
                           streakData.current_streak >= (mondayIndex - i + 1);
      
      activity[i] = hasLogin || isWithinStreak;
    }
    
    return activity;
  };

  // Always show streak display, even if streak is 0
  if (streakData) {
    const { current_streak, longest_streak } = streakData;
    const weekView = getWeekView();

    // Show active streak display
    if (current_streak > 0) {
      return (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-2 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="text-xl mr-1">🔥</span>
                    {current_streak}
                    <span className="text-sm text-gray-600 ml-1">day streak</span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    {current_streak === 1 
                      ? "Great start! Keep going." 
                      : "Keep up the momentum!"
                    }
                  </p>
                </div>
              </div>
              
              {longest_streak > current_streak && (
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span className="text-xs">Best</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{longest_streak}</p>
                </div>
              )}
            </div>

            {/* Compact Week view */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-orange-200">
              {weekView.map((item, index) => (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      item.hasActivity 
                        ? 'bg-green-500 text-white' 
                        : item.isToday 
                          ? 'bg-orange-300 border-2 border-orange-500' 
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {item.hasActivity ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{item.day}</div>
                </div>
              ))}
            </div>
            
            {current_streak >= 7 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-800 font-medium text-sm">
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
    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-200 rounded-full p-2">
            <Flame className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-700">Start Your Streak!</h3>
            <p className="text-gray-600 text-sm">Complete a practice session to begin</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;
