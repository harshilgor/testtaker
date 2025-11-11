import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
  isEliminateMode?: boolean;
  eliminatedOptions?: Set<number>;
  onToggleEliminateOption?: (index: number) => void;
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
  isSubmitted = false,
  isEliminateMode = false,
  eliminatedOptions = new Set(),
  onToggleEliminateOption
}) => {
  const { isMobile } = useResponsiveLayout();
  const hasAnswered = selectedAnswer !== null;

  if (isMobile) {
    return (
      <div className="h-full p-4 bg-white overflow-y-auto">
        <div className="h-full flex flex-col pb-4">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3 mb-6">
              {question.options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctAnswer;
                const shouldShowCorrect = feedbackPreference === 'immediate' && showFeedback;
                const isEliminated = eliminatedOptions.has(index);
                
                return (
                  <div key={index} className="flex items-start gap-2">
                    {/* Eliminate Circle - Outside the button container */}
                    {isEliminateMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleEliminateOption) {
                            onToggleEliminateOption(index);
                          }
                        }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-4 ${
                          isEliminated
                            ? 'border-gray-400 bg-gray-300'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        title={isEliminated ? "Un-eliminate option" : "Eliminate option"}
                      >
                        {isEliminated && (
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // When eliminate mode is active, clicking the option text selects it (normal behavior)
                        // Only clicking the circle eliminates it
                        if (!isSubmitted) {
                          onAnswerSelect(index);
                        }
                      }}
                      disabled={isSubmitted}
                      className={`flex-1 p-4 text-left rounded-lg border-2 transition-all relative ${
                        isEliminated
                          ? 'opacity-50 line-through'
                          : isSelected
                          ? shouldShowCorrect
                            ? isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-blue-500 bg-blue-50'
                          : shouldShowCorrect && isCorrectAnswer
                          ? 'border-green-500 bg-green-50'
                          : isSubmitted
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : isEliminateMode
                          ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isEliminated && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <svg className="w-full h-0.5 text-red-500" viewBox="0 0 100 2" preserveAspectRatio="none">
                            <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                          isEliminated
                            ? 'border-gray-300 bg-gray-200 text-gray-500'
                            : isSelected
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
                        <span className={`flex-1 text-base leading-relaxed ${isEliminated ? 'text-gray-400' : ''}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  </div>
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
                    <p className="text-base text-green-700">{question.explanation}</p>
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
                      <p className="text-base text-red-700">{incorrectRationaleText}</p>
                    </div>

                    {/* Rationale for the CORRECT answer */}
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold text-green-800">Correct Answer Explanation</span>
                      </div>
                      <p className="text-base text-green-700">{question.explanation}</p>
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
    <div className="h-full border-l border-gray-200 flex flex-col">
      <div className="h-full p-2 flex flex-col">
        {/* Rounded Container with Curved Edges */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">

        {/* Answer Options */}
        <div className="mb-8">
          <div className="space-y-3">
            {(question.options || []).map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctAnswer;
              const shouldShowCorrect = feedbackPreference === 'immediate' && showFeedback;
              const isEliminated = eliminatedOptions.has(index);
              
              return (
                <div key={index} className="flex items-start gap-2">
                  {/* Eliminate Circle - Outside the button container */}
                  {isEliminateMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleEliminateOption) {
                          onToggleEliminateOption(index);
                        }
                      }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-4 ${
                        isEliminated
                          ? 'border-gray-400 bg-gray-300'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      title={isEliminated ? "Un-eliminate option" : "Eliminate option"}
                    >
                      {isEliminated && (
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // When eliminate mode is active, clicking the option text selects it (normal behavior)
                      // Only clicking the circle eliminates it
                      if (!isSubmitted) {
                        onAnswerSelect(index);
                      }
                    }}
                    disabled={isSubmitted}
                    className={`flex-1 p-4 text-left rounded-lg border-2 transition-all relative ${
                      isEliminated
                        ? 'opacity-50 line-through'
                        : isSelected
                        ? shouldShowCorrect
                          ? isCorrectAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-blue-500 bg-blue-50'
                        : shouldShowCorrect && isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : isSubmitted
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : isEliminateMode
                        ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isEliminated && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-full h-0.5 text-red-500" viewBox="0 0 100 2" preserveAspectRatio="none">
                          <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        isEliminated
                          ? 'border-gray-300 bg-gray-200 text-gray-500'
                          : isSelected
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
                      <span className={`flex-1 text-base leading-relaxed ${isEliminated ? 'text-gray-400' : ''}`}>{option}</span>
                    </div>
                  </button>
                </div>
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
                <p className="text-base text-green-700">{question.explanation}</p>
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
                  <p className="text-base text-green-700">{question.explanation}</p>
                </div>
              </div>
            );
          }
          return null; // Return null if no feedback should be shown yet.
        })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnswerPanel;