
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Flame, Star, Trophy } from 'lucide-react';

interface StreakNotificationProps {
  streakCount: number;
  onClose: () => void;
  isVisible: boolean;
}

const StreakNotification: React.FC<StreakNotificationProps> = ({ 
  streakCount, 
  onClose, 
  isVisible 
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 500); // Small delay for smooth animation

      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible]);

  const getEncouragingMessage = (streak: number) => {
    if (streak === 1) {
      return "Great start! You've begun your learning journey! 🎉";
    } else if (streak <= 3) {
      return `Fantastic! You're on a ${streak}-day streak! Keep it up! 🔥`;
    } else if (streak <= 7) {
      return `Amazing! ${streak} days in a row! You're building a great habit! ⭐`;
    } else if (streak <= 14) {
      return `Incredible! ${streak} days strong! You're a true champion! 🏆`;
    } else {
      return `Outstanding! ${streak} days of dedication! You're unstoppable! 🌟`;
    }
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 14) {
      return <Trophy className="h-8 w-8 text-yellow-500" />;
    } else if (streak >= 7) {
      return <Star className="h-8 w-8 text-blue-500" />;
    } else {
      return <Flame className="h-8 w-8 text-orange-500" />;
    }
  };

  const getGradientColor = (streak: number) => {
    if (streak >= 14) {
      return "from-yellow-400 to-orange-500";
    } else if (streak >= 7) {
      return "from-blue-400 to-purple-500";
    } else {
      return "from-orange-400 to-red-500";
    }
  };

  if (!shouldShow || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <Card className="w-96 bg-white shadow-2xl border-2 border-gray-100 rounded-3xl overflow-hidden transform animate-bounce-in">
        <CardContent className="p-8 text-center relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className={`w-20 h-20 bg-gradient-to-r ${getGradientColor(streakCount)} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            {getStreakIcon(streakCount)}
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Congratulations! 🎉
            </h2>
            <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
              {streakCount} Day{streakCount > 1 ? 's' : ''}
            </div>
            <div className="text-lg text-gray-700 font-semibold mb-4">
              Streak Achieved!
            </div>
            <p className="text-gray-600 text-base leading-relaxed">
              {getEncouragingMessage(streakCount)}
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-transform hover:scale-105"
            >
              Keep Going!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakNotification;
