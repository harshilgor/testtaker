
import React from 'react';
import { Clock, Target, Award } from 'lucide-react';

interface QuizStatsProps {
  time: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
}

const QuizStats: React.FC<QuizStatsProps> = ({
  time,
  currentQuestionIndex,
  totalQuestions,
  answeredCount
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="flex items-center space-x-6">
      <div className="flex items-center">
        <Clock className="h-4 w-4 mr-1 text-gray-500" />
        <span className="text-sm">{formatTime(time)}</span>
      </div>
      <div className="flex items-center">
        <Target className="h-4 w-4 mr-1 text-gray-500" />
        <span className="text-sm">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
      </div>
      <div className="flex items-center">
        <Award className="h-4 w-4 mr-1 text-green-500" />
        <span className="text-sm">Answered: {answeredCount}/{totalQuestions}</span>
      </div>
    </div>
  );
};

export default QuizStats;
