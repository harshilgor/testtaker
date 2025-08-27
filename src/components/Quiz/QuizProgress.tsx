
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface QuizProgressProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestionIndex,
  totalQuestions,
  answeredCount
}) => {
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <Card className="mb-6 border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-slate-600">{Math.round(progress)}% Answered</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
};

export default QuizProgress;
