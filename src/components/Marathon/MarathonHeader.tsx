
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  onEliminateModeChange,
  currentQuestionNumber,
  totalQuestions
}) => {
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-600 rounded px-3 py-1 text-sm font-medium">
          MARATHON
        </div>
        <span className="text-sm">
          {isMathQuestion ? 'Section 2, Module 1: Math' : 'Section 1, Module 1: Reading and Writing'}
        </span>
      </div>
      
      <div className="flex items-center space-x-6">
        {timeRemaining && (
          <div className="flex items-center space-x-2 text-lg font-mono">
            <span>{formatTimeRemaining(timeRemaining)}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm">
          <span>Eliminate Answers</span>
          <Switch
            checked={eliminateMode}
            onCheckedChange={onEliminateModeChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default MarathonHeader;
