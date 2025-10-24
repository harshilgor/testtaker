import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar, Trophy, Target, Clock } from 'lucide-react';

const SimpleStreakWidget: React.FC = () => {
  const streakData = {
    current: 18,
    longest: 42,
    thisWeek: 6,
    questionsToday: 5,
    questionsNeeded: 5
  };

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Study Streak</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {/* Main Streak Display */}
        <div className="text-center py-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {streakData.current}
          </div>
          <div className="text-xs text-gray-600">
            Day Streak
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default SimpleStreakWidget;
