
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Flame } from 'lucide-react';
import { useUserStreak } from '@/hooks/useUserStreak';

interface StreakPopupProps {
  userName: string;
  onNavigateToPerformance: () => void;
}

const StreakPopup: React.FC<StreakPopupProps> = ({ userName, onNavigateToPerformance }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const { streakData, isLoading } = useUserStreak(userName);

  useEffect(() => {
    // Check if popup has been shown this session
    const popupShown = sessionStorage.getItem('streak-popup-shown');
    
    if (!popupShown && !isLoading && streakData && streakData.current_streak > 0) {
      // Show popup after a small delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
        sessionStorage.setItem('streak-popup-shown', 'true');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, streakData]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNavigate = () => {
    onNavigateToPerformance();
    setIsVisible(false);
  };

  if (!isVisible || !streakData || streakData.current_streak === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <Card className="w-80 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Flame className="h-6 w-6 text-yellow-200 animate-pulse" />
              <h3 className="font-bold text-lg">Streak Active!</h3>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-white/90 text-sm mb-2">
              🔥 You're on a {streakData.current_streak}-day streak!
            </p>
            <p className="text-white/80 text-xs">
              Keep practicing to maintain your momentum
            </p>
          </div>

          <Button
            onClick={handleNavigate}
            variant="secondary"
            className="w-full bg-white text-orange-600 hover:bg-white/90 font-medium"
          >
            View Performance Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakPopup;
