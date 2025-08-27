
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface QuestionAttemptStatsProps {
  totalQuizQuestions: number;
  totalMarathonQuestions: number;
}

const QuestionAttemptStats: React.FC<QuestionAttemptStatsProps> = ({
  totalQuizQuestions,
  totalMarathonQuestions
}) => {
  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-4 md:p-8 text-center">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Total Questions Attempted</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div>
            <div className="text-2xl md:text-4xl font-bold text-purple-600 mb-2">{totalQuizQuestions}</div>
            <p className="text-sm md:text-base text-gray-600">Quiz Mode Questions</p>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-bold text-orange-600 mb-2">{totalMarathonQuestions}</div>
            <p className="text-sm md:text-base text-gray-600">Marathon Mode Questions</p>
          </div>
        </div>
        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
          <div className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">{totalQuizQuestions + totalMarathonQuestions}</div>
          <p className="text-sm md:text-base text-gray-600">Total Questions Attempted</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionAttemptStats;
