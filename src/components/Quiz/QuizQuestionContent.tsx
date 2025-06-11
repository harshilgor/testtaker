
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
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
  onEndQuiz: () => void;
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
  onEndQuiz,
  canGoNext
}) => {
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Question {questionNumber}
              </h2>
              <Button
                onClick={onEndQuiz}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                End Quiz
              </Button>
            </div>
            <Button
              onClick={onToggleFlag}
              variant="outline"
              size="sm"
              className={isFlagged ? 'text-yellow-600 border-yellow-300 bg-yellow-50' : 'border-gray-300'}
            >
              <Flag className={`h-4 w-4 ${isFlagged ? 'fill-yellow-400' : ''}`} />
            </Button>
          </div>
          
          <div className="mb-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed mb-4 text-lg">
                {question.question}
              </p>
            </div>
            
            {question.hasImage && question.imageUrl && (
              <div className="mb-6">
                <QuestionImage imageUrl={question.imageUrl} alt="Question Image" />
              </div>
            )}
          </div>

          {/* Show feedback if immediate feedback is enabled and user answered */}
          {feedbackPreference === 'immediate' && showFeedback && selectedAnswer !== null && (
            <div className={`p-6 rounded-lg border-2 mb-6 ${
              isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-3">
                <span className={`font-semibold text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <div className={`text-sm leading-relaxed ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                <p className="mb-3">{question.explanation}</p>
                {!isCorrect && (
                  <p className="font-medium">
                    The correct answer is: {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons positioned below the question content */}
      {selectedAnswer !== null && (
        <div className="flex justify-center">
          {canGoNext ? (
            <Button
              onClick={onNext}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
            >
              Next Question
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizQuestionContent;
