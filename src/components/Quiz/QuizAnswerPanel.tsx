import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { QuizQuestion } from '@/types/question';

interface QuizAnswerPanelProps {
  question: QuizQuestion;
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
  isSubmitted?: boolean;
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
  loading,
  isSubmitted = false
}) => {
  const { isMobile } = useResponsiveLayout();
  const hasAnswered = selectedAnswer !== null;

  if (isMobile) {
    return (
      <div className="h-full p-4 bg-white overflow-y-auto">
        <div className="h-full flex flex-col pb-4">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-4">
              Choose the best answer.
            </p>
            <div className="space-y-3 mb-6">
              {question.options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctAnswer;
                const shouldShowCorrect = feedbackPreference === 'immediate' && showFeedback;
                
                return (
                  <button
                    key={index}
                    onClick={() => !isSubmitted && onAnswerSelect(index)}
                    disabled={isSubmitted}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? shouldShowCorrect
                          ? isCorrectAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-blue-500 bg-blue-50'
                        : shouldShowCorrect && isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : isSubmitted
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
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
                      <span className="flex-1 text-sm leading-relaxed">
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* === UPDATED FEEDBACK SECTION (MOBILE) === */}
            {showFeedback && feedbackPreference === 'immediate' && (() => {
              // Case 1: The user's answer is correct.
              if (isCorrect) {
                return (
                  <div className="p-4 rounded-lg mb-6 bg-green-50 border border-green-200">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-green-800">Correct!</span>
                    </div>
                    <p className="text-sm text-green-700">{question.explanation}</p>
                  </div>
                );
              }

              // Case 2: The user's answer is incorrect.
              if (!isCorrect && selectedAnswer !== null) {
                // Get the rationale for the incorrect answer they chose.
                const optionLetter = String.fromCharCode(65 + selectedAnswer).toLowerCase();
            const rationaleKey = `incorrect_rationale_${optionLetter}` as keyof QuizQuestion;
                const incorrectRationaleText = (question[rationaleKey] as string) || "A specific explanation for this incorrect option was not provided.";

                return (
                  <div className="space-y-4">
                    {/* Rationale for the user's INCORRECT answer */}
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold text-red-800">Incorrect</span>
                      </div>
                      <p className="text-sm text-red-700">{incorrectRationaleText}</p>
                    </div>

                    {/* Rationale for the CORRECT answer */}
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold text-green-800">Correct Answer Explanation</span>
                      </div>
                      <p className="text-sm text-green-700">{question.explanation}</p>
                    </div>
                  </div>
                );
              }
              return null; // Return null if no feedback should be shown yet.
            })()}
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
          <h3 className="text-lg font-medium text-gray-900">Answer Options</h3>
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
                  onClick={() => !isSubmitted && onAnswerSelect(index)}
                  disabled={isSubmitted}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? shouldShowCorrect
                        ? isCorrectAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : shouldShowCorrect && isCorrectAnswer
                      ? 'border-green-500 bg-green-50'
                      : isSubmitted
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
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

        {/* === UPDATED FEEDBACK SECTION (DESKTOP) === */}
        {showFeedback && feedbackPreference === 'immediate' && (() => {
          // Case 1: The user's answer is correct.
          if (isCorrect) {
            return (
              <div className="p-4 rounded-lg mb-6 bg-green-50 border border-green-200">
                <div className="flex items-center mb-2">
                  <span className="font-semibold text-green-800">Correct!</span>
                </div>
                <p className="text-sm text-green-700">{question.explanation}</p>
              </div>
            );
          }

          // Case 2: The user's answer is incorrect.
          if (!isCorrect && selectedAnswer !== null) {
            // Get the rationale for the incorrect answer they chose.
            const optionLetter = String.fromCharCode(65 + selectedAnswer).toLowerCase();
            const rationaleKey = `incorrect_rationale_${optionLetter}` as keyof QuizQuestion;
            const incorrectRationaleText = (question[rationaleKey] as string) || "A specific explanation for this incorrect option was not provided.";

            return (
              <div className="space-y-4">
                {/* Rationale for the user's INCORRECT answer */}
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-red-800">Incorrect</span>
                  </div>
                  <p className="text-sm text-red-700">{incorrectRationaleText}</p>
                </div>

                {/* Rationale for the CORRECT answer */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-green-800">Correct Answer Explanation</span>
                  </div>
                  <p className="text-sm text-green-700">{question.explanation}</p>
                </div>
              </div>
            );
          }
          return null; // Return null if no feedback should be shown yet.
        })()}
      </div>
    </div>
  );
};

export default QuizAnswerPanel;