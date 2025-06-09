
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

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

interface QuizAnswerOptionsProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  showCorrectAnswer?: boolean;
  isCorrect?: boolean;
}

const QuizAnswerOptions: React.FC<QuizAnswerOptionsProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showCorrectAnswer = false,
  isCorrect = false
}) => {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900">Answer Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => onAnswerSelect(index)}
              variant="outline"
              className={`w-full justify-start text-left h-auto p-4 ${
                selectedAnswer === index
                  ? showCorrectAnswer
                    ? isCorrect
                      ? 'bg-green-50 border-green-500 text-green-900 hover:bg-green-100'
                      : 'bg-red-50 border-red-500 text-red-900 hover:bg-red-100'
                    : 'bg-blue-50 border-blue-500 text-blue-900 hover:bg-blue-100'
                  : showCorrectAnswer && index === question.correctAnswer
                    ? 'bg-green-50 border-green-500 text-green-900 hover:bg-green-100'
                    : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start w-full">
                <span className="font-medium mr-3 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-left whitespace-pre-wrap break-words flex-1">{option}</span>
                {showCorrectAnswer && (
                  <div className="ml-2 flex-shrink-0">
                    {index === question.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {selectedAnswer === index && !isCorrect && index !== question.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizAnswerOptions;
