import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import TestWidget from './TestWidget';
import SimpleStatsWidget from './SimpleStatsWidget';
import LeaderboardRankingWidget from './LeaderboardRankingWidget';
import SimpleStreakWidget from './SimpleStreakWidget';
import WidgetErrorBoundary from './WidgetErrorBoundary';
// import SimpleRecentActivityWidget from './SimpleRecentActivityWidget';

const WidgetCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const widgets = [
    { component: SimpleStatsWidget, title: 'Questions Solved' },
    { component: SimpleStreakWidget, title: 'Study Streak' },
    { component: LeaderboardRankingWidget, title: 'Leaderboard Rank' }
  ];

  const nextWidget = () => {
    setCurrentIndex((prev) => (prev + 1) % widgets.length);
  };

  const prevWidget = () => {
    setCurrentIndex((prev) => (prev - 1 + widgets.length) % widgets.length);
  };

  const CurrentWidget = widgets[currentIndex].component;

  return (
    <div className="w-full h-full relative">
      {/* Widget Content - Full Size */}
      <div className="w-full h-full overflow-hidden">
        <WidgetErrorBoundary>
          <CurrentWidget />
        </WidgetErrorBoundary>
      </div>

      {/* Navigation Buttons - Overlayed inside the widget */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={prevWidget}
          className="h-6 w-6 p-0 bg-white/80 hover:bg-white shadow-sm"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={nextWidget}
          className="h-6 w-6 p-0 bg-white/80 hover:bg-white shadow-sm"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Dots Indicator - Overlayed at bottom */}
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
  );
};

export default WidgetCarousel;
