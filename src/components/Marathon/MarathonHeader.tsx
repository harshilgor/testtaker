
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { formatTimeRemaining } from '@/utils/timeUtils';

interface MarathonHeaderProps {
  isMathQuestion: boolean;
  timeRemaining?: number;
  eliminateMode: boolean;
  onEliminateModeChange: (checked: boolean) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

const MarathonHeader: React.FC<MarathonHeaderProps> = ({
  isMathQuestion,
  timeRemaining,
  eliminateMode,
  onEliminateModeChange
}) => {
  return (
    <div className="bg-slate-800 text-white px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="bg-blue-600 rounded px-2 md:px-3 py-1 text-xs md:text-sm font-medium">
          MARATHON
        </div>
        <span className="text-xs md:text-sm">
          {isMathQuestion ? 'Section 2, Module 1: Math' : 'Section 1, Module 1: Reading and Writing'}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-6">
        {timeRemaining && (
          <div className="flex items-center space-x-2 text-sm md:text-lg font-mono">
            <span>{formatTimeRemaining(timeRemaining)}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="hidden sm:inline">Eliminate</span>
          <Switch
            checked={eliminateMode}
            onCheckedChange={onEliminateModeChange}
            className="data-[state=checked]:bg-blue-600 scale-75 md:scale-100"
          />
        </div>
      </div>
    </div>
  );
};

export default MarathonHeader;
