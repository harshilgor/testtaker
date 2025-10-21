
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
  difficulty?: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  mode,
  modeColor,
  title,
  timeElapsed,
  onExit,
  isMobile,
  additionalContent,
  difficulty
}) => {
  return (
    <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between h-14 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`${modeColor} rounded px-3 py-1 text-sm font-medium`}>
          {mode}
        </div>
        {title && (
          <span className={`text-sm font-medium ${isMobile ? 'truncate max-w-32' : ''}`}>
            {title}
          </span>
        )}
        {difficulty && (
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            difficulty.toLowerCase() === 'easy' ? 'bg-green-600' :
            difficulty.toLowerCase() === 'medium' ? 'bg-yellow-600' :
            difficulty.toLowerCase() === 'hard' ? 'bg-red-600' :
            'bg-gray-600'
          }`}>
            {difficulty.toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {timeElapsed !== undefined && (
          <div className="text-base font-mono">
            {formatTime(timeElapsed)}
          </div>
        )}
        
        {additionalContent}
        
        <Button
          onClick={onExit}
          variant="outline"
          size="sm"
          className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800 text-sm px-4 py-2 h-9"
        >
          Exit {mode === 'QUIZ' ? 'Quiz' : 'Marathon'}
        </Button>
      </div>
    </div>
  );
};

export default TopNavigation;
