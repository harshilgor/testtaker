import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Target, Clock } from 'lucide-react';

const SimpleStatsWidget: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'alltime'>('alltime');

  const questionsData = {
    today: { count: 12, accuracy: 91.7 },
    '7days': { count: 89, accuracy: 87.6 },
    alltime: { count: 2847, accuracy: 84.2 }
  };

  const currentData = questionsData[timeFilter];

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Questions Solved</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {/* Main Metric */}
        <div className="text-center py-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {currentData.count.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            Questions Solved
          </div>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex gap-1 mb-3">
          <Button
            variant={timeFilter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('today')}
            className="flex-1 text-xs py-1 px-2"
          >
            Today
          </Button>
          <Button
            variant={timeFilter === '7days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('7days')}
            className="flex-1 text-xs py-1 px-2"
          >
            7 Days
          </Button>
          <Button
            variant={timeFilter === 'alltime' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('alltime')}
            className="flex-1 text-xs py-1 px-2"
          >
            All Time
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default SimpleStatsWidget;
