
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/timeUtils';

interface TopNavigationProps {
  mode: string;
  modeColor: string;
  title: string;
  timeElapsed?: number;
  onExit: () => void;
  isMobile?: boolean;
  additionalContent?: React.ReactNode;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  mode,
  modeColor,
  title,
  timeElapsed,
  onExit,
  isMobile,
  additionalContent
}) => {
  return (
    <div className="bg-slate-800 text-white px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className={`${modeColor} rounded px-2 md:px-3 py-1 text-xs md:text-sm font-medium`}>
          {mode}
        </div>
        {title && (
          <span className={`text-xs md:text-sm font-medium ${isMobile ? 'truncate max-w-32' : ''}`}>
            {title}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {timeElapsed !== undefined && (
          <div className="text-sm md:text-base font-mono">
            {formatTime(timeElapsed)}
          </div>
        )}
        
        {additionalContent}
        
        <Button
          onClick={onExit}
          variant="outline"
          size="sm"
          className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800 text-xs px-2 md:px-3 py-1 min-h-[32px] md:min-h-[44px]"
        >
          Exit
        </Button>
      </div>
    </div>
  );
};

export default TopNavigation;
