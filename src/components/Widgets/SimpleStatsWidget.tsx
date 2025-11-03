import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Target, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface SimpleStatsWidgetProps { variant?: 'bare' | 'card' }

const SimpleStatsWidget: React.FC<SimpleStatsWidgetProps> = ({ variant = 'card' }) => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'alltime'>('alltime');
  const { questionAttempts, loading } = useData();

  const questionsData = useMemo(() => {
    if (!questionAttempts || questionAttempts.length === 0) {
      return {
        today: { count: 0, accuracy: 0 },
        '7days': { count: 0, accuracy: 0 },
        alltime: { count: 0, accuracy: 0 }
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter attempts by time period
    const todayAttempts = questionAttempts.filter(attempt => {
      const attemptDate = new Date(attempt.created_at);
      return attemptDate >= today;
    });

    const weekAttempts = questionAttempts.filter(attempt => {
      const attemptDate = new Date(attempt.created_at);
      return attemptDate >= sevenDaysAgo;
    });

    // Calculate accuracy for each period
    const calculateAccuracy = (attempts: any[]) => {
      if (attempts.length === 0) return 0;
      const correct = attempts.filter(a => a.is_correct).length;
      return Math.round((correct / attempts.length) * 100);
    };

    return {
      today: {
        count: todayAttempts.length,
        accuracy: calculateAccuracy(todayAttempts)
      },
      '7days': {
        count: weekAttempts.length,
        accuracy: calculateAccuracy(weekAttempts)
      },
      alltime: {
        count: questionAttempts.length,
        accuracy: calculateAccuracy(questionAttempts)
      }
    };
  }, [questionAttempts]);

  const currentData = questionsData[timeFilter];

  if (loading) {
    if (variant === 'bare') {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    return (
      <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  const Content = (
    <div className="w-full h-full flex flex-col">
      {/* Main Metric */}
      <div className="text-center py-3">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
        </div>
        <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
          {currentData.count.toLocaleString()}
        </div>
        <div className="text-xs lg:text-sm text-gray-600">
          Questions Solved
        </div>
      </div>

      {/* Time Filter Buttons */}
      <div className="flex gap-1 mb-3">
        <Button
          variant={timeFilter === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeFilter('today')}
          className="flex-1 text-xs lg:text-sm py-1 px-2"
        >
          Today
        </Button>
        <Button
          variant={timeFilter === '7days' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeFilter('7days')}
          className="flex-1 text-xs lg:text-sm py-1 px-2"
        >
          7 Days
        </Button>
        <Button
          variant={timeFilter === 'alltime' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeFilter('alltime')}
          className="flex-1 text-xs lg:text-sm py-1 px-2"
        >
          All Time
        </Button>
      </div>
    </div>
  );

  if (variant === 'bare') {
    return Content;
  }

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Questions Solved</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {Content}
      </CardContent>
    </Card>
  );
};

export default SimpleStatsWidget;
