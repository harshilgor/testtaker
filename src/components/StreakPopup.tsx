
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Flame } from 'lucide-react';

import { useOptimizedStreak } from '@/hooks/useOptimizedStreak';

interface StreakPopupProps {
  userName: string;
  onNavigateToPerformance: () => void;
}

const StreakPopup: React.FC<StreakPopupProps> = ({ userName, onNavigateToPerformance }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Try optimized hook first, fallback to legacy
  const { streakData: optimizedData, isLoading: optimizedLoading, refetch: optimizedRefetch } = useOptimizedStreak(userName);
  const { streakData: legacyData, isLoading: legacyLoading, checkTodayActivity } = useOptimizedStreak(userName);
  
  const streakData = optimizedData || legacyData;
  const isLoading = optimizedLoading || legacyLoading;

  useEffect(() => {
    // Check if popup has been shown today
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('streak-popup-last-shown');
    
    console.log('StreakPopup - checking conditions:', { 
      today, 
      lastShown, 
      isLoading, 
      streakData,
      hasStreak: streakData && streakData.current_streak >= 1
    });
    
    // Show popup if not shown today, not loading, and user has a streak of 1 or more
    if (lastShown !== today && !isLoading && streakData && streakData.current_streak >= 1) {
      // Show popup after a small delay
      const timer = setTimeout(() => {
        console.log('Showing streak popup for streak:', streakData.current_streak);
        setIsVisible(true);
        localStorage.setItem('streak-popup-last-shown', today);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading, streakData]);

  // Trigger activity check when component mounts
  useEffect(() => {
    if (!isLoading) {
      // Use optimized refetch if available, otherwise fallback to legacy method
      if (optimizedRefetch) {
        optimizedRefetch();
      } else if (checkTodayActivity) {
        checkTodayActivity();
      }
    }
  }, [isLoading, optimizedRefetch, checkTodayActivity]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNavigate = () => {
    onNavigateToPerformance();
    setIsVisible(false);
  };

  if (!isVisible || !streakData || streakData.current_streak < 1) {
    return null;
  }

  // Generate week view based on current streak
  const getWeekView = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date();
    const currentDay = today.getDay();
    const mondayIndex = currentDay === 0 ? 6 : currentDay - 1; // Convert Sunday=0 to Monday=0 system
    
    return days.map((day, index) => {
      const isToday = index === mondayIndex;
      const daysPastMonday = index;
      
      // Show completed if within current streak and not future days
      const isCompleted = streakData.current_streak > 0 && 
                         daysPastMonday <= mondayIndex && 
                         streakData.current_streak >= (mondayIndex - daysPastMonday + 1);
      
      return { day, isCompleted, isToday };
    });
  };

  const weekView = getWeekView();

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <Card className="w-80 bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
        <CardContent className="p-6 relative">
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{streakData.current_streak}</div>
              <div className="text-sm text-gray-600">day streak</div>
            </div>
          </div>

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

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">
              {streakData.current_streak === 1 
                ? "Great start! You've begun your learning journey."
                : "Fantastic! Keep up the momentum."
              }
            </p>
            <Button
              onClick={handleNavigate}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl"
            >
              View Performance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakPopup;
