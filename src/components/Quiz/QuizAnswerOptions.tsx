
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
  feedbackPreference: 'immediate' | 'end';
  hasAnswered: boolean;
}

const QuizAnswerOptions: React.FC<QuizAnswerOptionsProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showCorrectAnswer = false,
  isCorrect = false,
  feedbackPreference,
  hasAnswered
}) => {
  const handleOptionClick = (index: number) => {
    // Prevent changing answer after submission in immediate feedback mode
    if (feedbackPreference === 'immediate' && hasAnswered) {
      return;
    }
    onAnswerSelect(index);
  };

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-lg text-gray-900 font-medium">Choose your answer:</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleOptionClick(index)}
              variant="outline"
              disabled={feedbackPreference === 'immediate' && hasAnswered}
              className={`w-full justify-start text-left h-auto p-4 border-2 transition-all duration-200 ${
                selectedAnswer === index
                  ? showCorrectAnswer
                    ? isCorrect
                      ? 'bg-green-50 border-green-500 text-green-900 hover:bg-green-100'
                      : 'bg-red-50 border-red-500 text-red-900 hover:bg-red-100'
                    : 'bg-blue-50 border-blue-500 text-blue-900 hover:bg-blue-100'
                  : showCorrectAnswer && index === question.correctAnswer
                    ? 'bg-green-50 border-green-500 text-green-900 hover:bg-green-100'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              } ${feedbackPreference === 'immediate' && hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start w-full">
                <span className="font-semibold mr-4 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-left whitespace-pre-wrap break-words flex-1 leading-relaxed">{option}</span>
                {showCorrectAnswer && (
                  <div className="ml-3 flex-shrink-0">
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
