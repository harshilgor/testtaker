import React from 'react';
import { AnswerPanelProps, BaseQuestion } from '@/types/question';
import { cn } from '@/lib/utils';

interface AnswerOption {
  letter: string;
  text: string;
  value: number | string;
}

interface UnifiedAnswerOptionsProps<T extends BaseQuestion> extends AnswerPanelProps<T> {
  options?: AnswerOption[];
  variant?: 'quiz' | 'sat' | 'marathon';
  isMobile?: boolean;
}

const UnifiedAnswerOptions = <T extends BaseQuestion>({
  question,
  selectedAnswer,
  onAnswerSelect,
  showFeedback = false,
  isCorrect,
  disabled = false,
  options,
  variant = 'quiz',
  isMobile = false
}: UnifiedAnswerOptionsProps<T>) => {
  if (!question) return null;

  // Extract options from question or use provided options
  const questionOptions = options || (
    'options' in question && Array.isArray(question.options)
      ? question.options.map((text: string, index: number) => ({
          letter: String.fromCharCode(65 + index), // A, B, C, D
          text,
          value: index
        }))
      : []
  );

  if (questionOptions.length === 0) return null;

  const paddingClass = isMobile ? 'p-4' : 'p-8';
  const correctAnswer = 'correctAnswer' in question ? question.correctAnswer : null;

  const getOptionStyle = (option: AnswerOption, isSelected: boolean) => {
    const baseClasses = [
      'w-full p-3 md:p-4 rounded-lg border-2 text-left transition-all duration-200',
      'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      disabled ? 'cursor-not-allowed' : 'cursor-pointer'
    ];

    if (showFeedback && correctAnswer !== null) {
      // Show feedback state
      const isCorrectOption = option.value === correctAnswer;
      
      if (isCorrectOption) {
        baseClasses.push('border-green-500 bg-green-50 text-green-800');
      } else if (isSelected) {
        baseClasses.push('border-red-500 bg-red-50 text-red-800');
      } else {
        baseClasses.push('border-gray-200 bg-gray-50 text-gray-500');
      }
    } else {
      // Normal state
      if (isSelected) {
        baseClasses.push('border-blue-500 bg-blue-50 text-blue-800 font-medium');
      } else {
        baseClasses.push('border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50');
      }
    }

    return cn(baseClasses);
  };

  return (
    <div className={`h-full bg-white overflow-y-auto ${paddingClass}`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium text-gray-900 mb-4`}>
            Answer Options
          </h2>
          
          <div className="space-y-3">
            {questionOptions.map((option) => {
              const isSelected = selectedAnswer === option.value;
              
              return (
                <button
                  key={`${option.letter}-${option.value}`}
                  onClick={() => !disabled && onAnswerSelect(option.value)}
                  disabled={disabled}
                  className={getOptionStyle(option, isSelected)}
                >
                  <div className="flex items-start space-x-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium ${
                      isSelected 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}>
                      {option.letter}
                    </span>
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed`}>
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showFeedback && 'explanation' in question && question.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Explanation</h3>
              <p className="text-blue-800 leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAnswerOptions;