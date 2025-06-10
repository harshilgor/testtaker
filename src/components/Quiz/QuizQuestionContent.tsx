
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag, CheckCircle, XCircle } from 'lucide-react';
import QuestionImage from '../QuestionImage';

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

interface QuizQuestionContentProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: number | null;
  isFlagged: boolean;
  showFeedback: boolean;
  feedbackPreference: 'immediate' | 'end';
  onToggleFlag: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
}

const QuizQuestionContent: React.FC<QuizQuestionContentProps> = ({
  question,
  questionNumber,
  selectedAnswer,
  isFlagged,
  showFeedback,
  feedbackPreference,
  onToggleFlag,
  onNext,
  onSubmit,
  canGoNext
}) => {
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Question {questionNumber}
          </h2>
          <Button
            onClick={onToggleFlag}
            variant="outline"
            size="sm"
            className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
          >
            <Flag className={`h-4 w-4 ${isFlagged ? 'fill-yellow-400' : ''}`} />
          </Button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-800 leading-relaxed mb-4">
            {question.question}
          </p>
          
          {question.hasImage && question.imageUrl && (
            <div className="mb-4">
              <QuestionImage imageUrl={question.imageUrl} alt="Question Image" />
            </div>
          )}
        </div>

        {/* Show feedback if immediate feedback is enabled and user answered */}
        {feedbackPreference === 'immediate' && showFeedback && selectedAnswer !== null && (
          <div className={`p-4 rounded-lg border mb-6 ${
            isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {question.explanation}
            </p>
            {!isCorrect && (
              <p className="text-sm text-red-700 mt-2">
                The correct answer is: {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
              </p>
            )}
          </div>
        )}

        {/* Next button for end feedback preference */}
        {feedbackPreference === 'end' && selectedAnswer !== null && (
          <div className="mt-6">
            {canGoNext ? (
              <Button
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizQuestionContent;
