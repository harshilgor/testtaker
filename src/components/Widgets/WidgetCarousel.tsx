import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import SimpleStatsWidget from './SimpleStatsWidget';
import LeaderboardRankingWidget from './LeaderboardRankingWidget';
import SimpleStreakWidget from './SimpleStreakWidget';
import SimpleRecentActivityWidget from './SimpleRecentActivityWidget';

const WidgetCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const widgets = [
    { component: SimpleStatsWidget, title: 'Your Stats' },
    { component: LeaderboardRankingWidget, title: 'Leaderboard' },
    { component: SimpleStreakWidget, title: 'Study Streak' },
    { component: SimpleRecentActivityWidget, title: 'Recent Activity' }
  ];

  const nextWidget = () => {
    setCurrentIndex((prev) => (prev + 1) % widgets.length);
  };

  const prevWidget = () => {
    setCurrentIndex((prev) => (prev - 1 + widgets.length) % widgets.length);
  };

  const CurrentWidget = widgets[currentIndex].component;

  return (
    <div className="h-full flex flex-col">
      {/* Header with Navigation */}
      <div className="flex items-center justify-end mb-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={prevWidget}
            className="h-6 w-6 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextWidget}
            className="h-6 w-6 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1">
        <CurrentWidget />
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-1 mt-3">
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
  );
};

export default WidgetCarousel;
