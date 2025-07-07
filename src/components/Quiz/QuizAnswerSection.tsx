
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface QuizAnswerSectionProps {
  question: any;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  feedbackPreference: 'immediate' | 'end';
  showFeedback: boolean;
  isCorrect: boolean;
  isMobile: boolean;
}

const QuizAnswerSection: React.FC<QuizAnswerSectionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  isFlagged,
  onToggleFlag,
  feedbackPreference,
  showFeedback,
  isCorrect,
  isMobile
}) => {
  return (
    <div className={`${isMobile ? 'h-full p-4 bg-white' : 'w-1/2 h-full p-6 bg-white overflow-y-auto'}`}>
      <div className="h-full flex flex-col">
        {/* Remove the "Answer Options" header for mobile to match Marathon Mode */}
        {!isMobile && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-medium text-gray-900">
              Answer Options
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Checkbox
                  id="mark-review"
                  checked={isFlagged}
                  onCheckedChange={onToggleFlag}
                />
                <label htmlFor="mark-review" className="text-xs text-gray-600 cursor-pointer">
                  Mark for Review
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Mobile layout matching Marathon Mode */}
        {isMobile && (
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
        )}

        <div className="flex-1 overflow-y-auto">
          <p className={`${isMobile ? 'text-sm' : 'text-xs md:text-sm'} text-gray-600 mb-3`}>
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
                    <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
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
                    <span className={`flex-1 ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
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
                <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAnswerSection;
