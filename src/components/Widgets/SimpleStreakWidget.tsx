import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar, Trophy, Target, Clock } from 'lucide-react';
import { useOptimizedStreak } from '@/hooks/useOptimizedStreak';
import { useAuth } from '@/contexts/AuthContext';

const SimpleStreakWidget: React.FC = () => {
  const { user } = useAuth();
  const { streakData, questionsToday, isLoading } = useOptimizedStreak(user?.user_metadata?.full_name || 'User');

  if (isLoading) {
    return (
      <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Study Streak</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {/* Main Streak Display */}
        <div className="text-center py-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flame className="h-5 w-5 lg:h-6 lg:w-6 text-orange-500" />
          </div>
          <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
            {streakData?.current_streak || 0}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">
            Day Streak
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default SimpleStreakWidget;
