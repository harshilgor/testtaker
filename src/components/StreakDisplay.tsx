
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Flame, Award, Calendar as CalendarIcon, X } from 'lucide-react';

import { useOptimizedStreak } from '@/hooks/useOptimizedStreak';

interface StreakDisplayProps {
  userName: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ userName }) => {
  // Try optimized hook first, fallback to legacy
  const { streakData: optimizedData, isLoading: optimizedLoading } = useOptimizedStreak(userName);
  const { streakData: legacyData, isLoading: legacyLoading } = useOptimizedStreak(userName);
  
  const streakData = optimizedData || legacyData;
  const isLoading = optimizedLoading || legacyLoading;
  
  const [showMonthlyView, setShowMonthlyView] = useState(false);

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
    
    // Get user's login activity for this week based on actual streak data
    const weeklyActivity = getUserWeeklyActivity();
    
    return days.map((day, index) => {
      const isToday = index === mondayIndex;
      const isPastDay = index < mondayIndex;
      const isFutureDay = index > mondayIndex;
      const hasActivity = weeklyActivity[index] || false;
      
      return { day, hasActivity, isToday, isPastDay, isFutureDay };
    });
  };

  // Function to check user's weekly activity based on login history only
  const getUserWeeklyActivity = () => {
    const activity = [false, false, false, false, false, false, false];
    const today = new Date();
    const currentDay = today.getDay();
    const mondayIndex = currentDay === 0 ? 6 : currentDay - 1;
    
    // Get user's login history from localStorage
    const loginHistory = JSON.parse(localStorage.getItem('userLoginHistory') || '[]');
    
    // Calculate dates for this week
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayIndex);
    
    // Check each day of the week for activity
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + i);
      const dateString = checkDate.toDateString();
      
      // Check if user has activity on this date
      const hasLogin = loginHistory.some((login: any) => 
        new Date(login.date).toDateString() === dateString
      );
      
      // Mark activity for past days and today only (not future days)
      if (hasLogin && i <= mondayIndex) {
        activity[i] = true;
      }
    }
    
    // Calculate actual consecutive streak from the activity data
    const actualStreak = calculateActualStreak(activity, mondayIndex);
    
    // If the calculated streak doesn't match the database streak, log it
    if (streakData && actualStreak !== streakData.current_streak) {
      console.log('Streak mismatch - Visual:', actualStreak, 'Database:', streakData.current_streak);
      console.log('Activity array:', activity);
      console.log('Login history:', loginHistory);
    }
    
    return activity;
  };

  // Calculate the actual consecutive streak from activity data
  const calculateActualStreak = (activity: boolean[], mondayIndex: number) => {
    let streak = 0;
    
    // Count backwards from today to find consecutive days
    for (let i = mondayIndex; i >= 0; i--) {
      if (activity[i]) {
        streak++;
      } else {
        break; // Stop at first gap
      }
    }
    
    return streak;
  };

  // Get dates where user had activity for the calendar
  const getActivityDates = () => {
    const loginHistory = JSON.parse(localStorage.getItem('userLoginHistory') || '[]');
    return loginHistory.map((login: any) => new Date(login.date));
  };

  // Always show streak display, even if streak is 0
  if (streakData) {
    const { current_streak, longest_streak } = streakData;
    const weekView = getWeekView();
    const activityDates = getActivityDates();
    
    // Calculate the visual streak based on login activity
    const today = new Date();
    const mondayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const weeklyActivity = getUserWeeklyActivity();
    const visualStreak = calculateActualStreak(weeklyActivity, mondayIndex);
    
    // Use visual streak for display, database streak as fallback
    const displayStreak = visualStreak > 0 ? visualStreak : current_streak;

    // Show active streak display (show if we have visual streak or database streak)
    if (displayStreak > 0) {
      return (
        <>
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
                       {displayStreak}
                       <span className="text-sm text-gray-600 ml-1">day streak</span>
                     </h3>
                     <p className="text-sm text-gray-600">
                       {displayStreak === 1 
                         ? "Great start! Keep going." 
                         : "Keep up the momentum!"
                       }
                     </p>
                  </div>
                </div>
                
                 <div className="flex items-center space-x-3">
                   {longest_streak > current_streak && (
                     <div className="text-right">
                       <div className="flex items-center space-x-1 text-gray-600">
                         <Award className="h-4 w-4" />
                         <span className="text-xs">Best</span>
                       </div>
                       <p className="text-lg font-semibold text-gray-800">{longest_streak}</p>
                     </div>
                   )}
                   
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setShowMonthlyView(true)}
                     className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-1 h-8 w-8"
                   >
                     <CalendarIcon className="h-4 w-4" />
                   </Button>
                 </div>
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
                            : item.isPastDay
                              ? 'bg-gray-200 text-gray-400'
                              : 'border border-gray-300 bg-white'
                      }`}
                    >
                      {item.hasActivity ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : item.isPastDay ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{item.day}</div>
                  </div>
                ))}
              </div>
              
              {displayStreak >= 7 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800 font-medium text-sm">
                      {displayStreak >= 30 ? "🏆 Streak Master!" : 
                       displayStreak >= 14 ? "🎯 Streak Champion!" : 
                       "⭐ Week Warrior!"}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Show success message if there's activity today */}
              {displayStreak > 0 && (
                <div className="mt-3 text-center">
                  <p className="text-green-600 text-sm font-medium">Great! Today's streak counted ✓</p>
                  
                  {/* Calendar Button */}
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMonthlyView(true)}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 px-3 py-1 h-7 text-xs font-normal"
                    >
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      View Calendar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Calendar Dialog */}
          <Dialog open={showMonthlyView} onOpenChange={setShowMonthlyView}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Monthly Attendance</DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMonthlyView(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="p-4">
                <Calendar
                  mode="multiple"
                  selected={activityDates}
                  className="rounded-md border"
                  modifiers={{
                    activity: activityDates
                  }}
                  modifiersStyles={{
                    activity: {
                      backgroundColor: '#22c55e',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Days with activity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                    <span>Days without activity</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
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
