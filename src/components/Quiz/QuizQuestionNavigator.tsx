
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  imageUrl?: string;
  hasImage?: boolean;
}

interface QuizQuestionNavigatorProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  flaggedQuestions: boolean[];
  onGoToQuestion: (index: number) => void;
}

const QuizQuestionNavigator: React.FC<QuizQuestionNavigatorProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onGoToQuestion
}) => {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900">Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => onGoToQuestion(index)}
              className={`w-8 h-8 rounded text-sm font-medium border transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white border-blue-600'
                  : answers[index] !== null
                  ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              } ${flaggedQuestions[index] ? 'ring-2 ring-yellow-400' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
            <span className="text-gray-600">Unanswered</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
            <span className="text-gray-600">Flagged</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizQuestionNavigator;
