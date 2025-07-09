
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface QuizTopHeaderProps {
  topics: string[];
  time: number;
  onBack: () => void;
  eliminateMode?: boolean;
  onToggleEliminateMode?: (enabled: boolean) => void;
}

const QuizTopHeader: React.FC<QuizTopHeaderProps> = ({ topics, time, onBack, eliminateMode = false, onToggleEliminateMode }) => {
  const { isMobile } = useResponsiveLayout();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-600 px-3 py-1 rounded text-sm font-medium">
          QUIZ
        </div>
        {!isMobile && (
          <div className="text-sm">
            Topics: {topics.join(', ')}
          </div>
        )}
        {isMobile && (
          <div className="text-sm">
            {topics.join(', ')}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-sm font-medium">
          {formatTime(time)}
        </div>
        {onToggleEliminateMode && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white">Eliminate Options</span>
            <Switch
              checked={eliminateMode}
              onCheckedChange={onToggleEliminateMode}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        )}
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800"
        >
          Exit Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizTopHeader;
