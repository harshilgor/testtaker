
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';

interface QuizHeaderProps {
  onBack: () => void;
  mode: 'quiz' | 'marathon';
  totalPoints: number;
  sessionPoints: number;
  displayTime: number;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  onBack,
  mode,
  totalPoints,
  sessionPoints,
  displayTime
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Button onClick={onBack} variant="outline" className="flex items-center border-slate-300">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'marathon' ? 'Marathon Mode' : 'Quiz'}
        </h1>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
          <Trophy className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {totalPoints} pts (+{sessionPoints})
          </span>
        </div>
      </div>
      <div className="text-sm text-slate-600">
        {Math.floor(displayTime / 60000)}:{((displayTime % 60000) / 1000).toFixed(0).padStart(2, '0')}
      </div>
    </div>
  );
};

export default QuizHeader;
