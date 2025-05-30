
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuestionNavigatorProps {
  questions: any[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  flaggedQuestions: boolean[];
  onGoToQuestion: (index: number) => void;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onGoToQuestion
}) => {
  return (
    <Card className="lg:col-span-1 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg text-slate-900">Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => onGoToQuestion(index)}
              className={`w-8 h-8 rounded text-sm font-medium border transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white border-blue-600'
                  : answers[index] !== null
                  ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              } ${flaggedQuestions[index] ? 'ring-2 ring-yellow-400' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
            <span className="text-slate-600">Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
            <span className="text-slate-600">Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded mr-2"></div>
            <span className="text-slate-600">Unanswered</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
            <span className="text-slate-600">Flagged</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionNavigator;
