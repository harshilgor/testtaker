
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Trophy, Timer } from 'lucide-react';

interface QuizHeaderProps {
  onBack: () => void;
  mode: 'quiz' | 'marathon';
  totalPoints: number;
  sessionPoints: number;
  displayTime: number;
  backButtonText?: string;
  showPoints?: boolean;
  onEndQuiz?: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  onBack,
  mode,
  totalPoints,
  sessionPoints,
  displayTime,
  backButtonText = "Back",
  showPoints = true,
  onEndQuiz
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'marathon' ? 'Marathon Mode' : 'Quiz Mode'}
        </h1>
        <div className="flex items-center gap-4 mt-1">
          {showPoints && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {totalPoints} pts (+{sessionPoints} this session)
              </span>
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={onEndQuiz || onBack}
        variant="destructive"
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        {mode === 'marathon' ? 'End Marathon' : 'End Quiz'}
      </Button>
    </div>
  );
};

export default QuizHeader;
