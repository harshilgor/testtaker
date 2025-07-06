
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
    <div className={`h-full flex flex-col ${isMobile ? 'bg-gray-50 p-3' : 'w-1/2 bg-white overflow-y-auto p-6'}`}>
      <div className="max-w-2xl mx-auto flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <h3 className={`${isMobile ? 'text-sm' : 'text-base md:text-lg'} font-medium text-gray-900`}>
            Answer Options
          </h3>
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex items-center space-x-1 md:space-x-2">
              <Checkbox
                id="mark-review"
                checked={isFlagged}
                onCheckedChange={onToggleFlag}
              />
              <label htmlFor="mark-review" className="text-xs md:text-sm text-gray-600 cursor-pointer">
                Mark for Review
              </label>
            </div>
          </div>
        </div>

        <div className="mb-4 md:mb-8">
          <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} text-gray-600 mb-2 md:mb-4`}>
            Choose the best answer.
          </p>
          <div className="space-y-2 md:space-y-3">
            {question.options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctAnswer;
              const shouldShowCorrect = feedbackPreference === 'immediate' && showFeedback;
              
              return (
                <button
                  key={index}
                  onClick={() => onAnswerSelect(index)}
                  className={`w-full p-2 md:p-4 text-left rounded-lg border-2 transition-all ${isMobile ? 'min-h-[36px]' : 'min-h-[40px] md:min-h-[44px]'} ${
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
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5 md:w-6 md:h-6'} rounded-full border-2 flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0 ${
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
                    <span className={`flex-1 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && feedbackPreference === 'immediate' && (
          <div className={`p-3 md:p-4 rounded-lg mb-4 md:mb-6 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm md:text-base'} ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAnswerSection;
