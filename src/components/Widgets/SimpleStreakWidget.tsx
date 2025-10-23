import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar, Trophy } from 'lucide-react';

const SimpleStreakWidget: React.FC = () => {
  const streakData = {
    current: 12,
    longest: 28,
    thisWeek: 5
  };

  return (
    <Card className="h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Study Streak</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {streakData.current}
          </div>
          <div className="text-sm text-gray-600">
            Day Streak
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">Longest</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{streakData.longest} days</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">This Week</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{streakData.thisWeek} days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleStreakWidget;
