
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Timer } from 'lucide-react';

interface QuizHeaderProps {
  onBack: () => void;
  mode: 'quiz' | 'marathon';
  totalPoints: number;
  sessionPoints: number;
  displayTime: number;
  backButtonText?: string;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  onBack,
  mode,
  totalPoints,
  sessionPoints,
  displayTime,
  backButtonText = "Back"
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4 sm:mb-0">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backButtonText}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {mode === 'marathon' ? 'Marathon Mode' : 'Quiz'}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center text-blue-600">
          <Trophy className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {totalPoints} pts (+{sessionPoints})
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <Timer className="h-5 w-5 mr-2" />
          <span className="font-medium">{formatTime(displayTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;
