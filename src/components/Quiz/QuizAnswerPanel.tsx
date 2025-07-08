
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

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

interface QuizAnswerPanelProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  feedbackPreference: 'immediate' | 'end';
  showFeedback: boolean;
  isCorrect: boolean;
  onNext: () => void;
  loading: boolean;
}

const QuizAnswerPanel: React.FC<QuizAnswerPanelProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  isFlagged,
  onToggleFlag,
  currentQuestionIndex,
  totalQuestions,
  feedbackPreference,
  showFeedback,
  isCorrect,
  onNext,
  loading
}) => {
  const { isMobile } = useResponsiveLayout();
  const hasAnswered = selectedAnswer !== null;

  console.log('QuizAnswerPanel - isMobile:', isMobile);

  if (isMobile) {
    return (
      <div className="h-full p-4 bg-white overflow-y-auto">
        <div className="h-full flex flex-col">
          {/* Mobile flag checkbox */}
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="mark-review"
              checked={isFlagged}
              onCheckedChange={onToggleFlag}
            />
            <label htmlFor="mark-review" className="text-sm text-gray-600 cursor-pointer">
              Mark for Review
            </label>
          </div>

          <div className="flex-1 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-3">
              Choose the best answer.
            </p>
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctAnswer;
                const shouldShowCorrect = feedbackPreference === 'immediate' && showFeedback;
                
                return (
                  <button
                    key={index}
                    onClick={() => onAnswerSelect(index)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? shouldShowCorrect
                          ? isCorrectAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-blue-500 bg-blue-50'
                        : shouldShowCorrect && isCorrectAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                        isSelected
                          ? shouldShowCorrect
                            ? isCorrectAnswer
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-red-500 bg-red-500 text-white'
                            : 'border-blue-500 bg-blue-500 text-white'
                          : shouldShowCorrect && isCorrectAnswer
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1 text-sm">
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showFeedback && feedbackPreference === 'immediate' && (
              <div className={`mt-4 p-3 rounded-lg ${
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  <span className={`font-semibold text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className={`text-xs ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-full p-8 bg-white border-l border-gray-200 flex flex-col">
      <div className="flex-1">
        {/* Question Info Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Question</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mark-review"
                checked={isFlagged}
                onCheckedChange={onToggleFlag}
              />
              <label htmlFor="mark-review" className="text-sm text-gray-600">
                Mark for Review
              </label>
            </div>
          </div>
        </div>

        {/* Answer Options */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-4">Choose the best answer.</p>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctAnswer;
              const shouldShowCorrect = feedbackPreference === 'immediate' && showFeedback;
              
              return (
                <button
                  key={index}
                  onClick={() => onAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? shouldShowCorrect
                        ? isCorrectAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : shouldShowCorrect && isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      isSelected
                        ? shouldShowCorrect
                          ? isCorrectAnswer
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-red-500 bg-red-500 text-white'
                          : 'border-blue-500 bg-blue-500 text-white'
                        : shouldShowCorrect && isCorrectAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        {showFeedback && feedbackPreference === 'immediate' && (
          <div className={`p-4 rounded-lg mb-6 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Next Button - Desktop only */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          disabled={loading}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuizAnswerPanel;
