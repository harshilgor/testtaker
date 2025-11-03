import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import TestWidget from './TestWidget';
import SimpleStatsWidget from './SimpleStatsWidget';
import LeaderboardRankingWidget from './LeaderboardRankingWidget';
import SimpleStreakWidget from './SimpleStreakWidget';
import TotalXPWidget from './TotalXPWidget';
import WidgetErrorBoundary from './WidgetErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import SimpleRecentActivityWidget from './SimpleRecentActivityWidget';

const WidgetCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const widgets = [
    { component: SimpleStatsWidget, title: 'Questions Solved' },
    { component: SimpleStreakWidget, title: 'Study Streak' },
    { component: LeaderboardRankingWidget, title: 'Leaderboard Rank' },
    { component: TotalXPWidget, title: 'Total XP' }
  ];

  const nextWidget = () => {
    setCurrentIndex((prev) => (prev + 1) % widgets.length);
  };

  const prevWidget = () => {
    setCurrentIndex((prev) => (prev - 1 + widgets.length) % widgets.length);
  };

  const CurrentWidget = widgets[currentIndex].component;

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900 truncate">
            {widgets[currentIndex].title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={prevWidget}
              className="h-6 w-6 p-0 bg-white hover:bg-white"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextWidget}
              className="h-6 w-6 p-0 bg-white hover:bg-white"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full min-h-[200px] relative">
          {/* Widget Content */}
          <div className="w-full h-full overflow-visible">
            <WidgetErrorBoundary>
              {/* Render widgets in 'bare' variant to avoid nested cards and overlap */}
              { /* @ts-expect-error - pass variant prop optionally */ }
              <CurrentWidget variant="bare" />
            </WidgetErrorBoundary>
          </div>
          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {widgets.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WidgetCarousel;
