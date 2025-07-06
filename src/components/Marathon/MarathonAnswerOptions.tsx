
import React from 'react';
import { X } from 'lucide-react';
import { getAnswerOptions } from '@/utils/questionUtils';

interface MarathonAnswerOptionsProps {
  question: any;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  eliminateMode: boolean;
  eliminatedOptions: Set<string>;
  onEliminateOption: (answer: string) => void;
  showFeedback: boolean;
  answered: boolean;
}

const MarathonAnswerOptions: React.FC<MarathonAnswerOptionsProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  eliminateMode,
  eliminatedOptions,
  onEliminateOption,
  showFeedback,
  answered
}) => {
  const options = getAnswerOptions(question);

  return (
    <div className="space-y-3 mb-6">
      {options.map((option) => {
        const isSelected = selectedAnswer === option.letter;
        const isEliminated = eliminatedOptions.has(option.letter);
        const isCorrect = showFeedback && option.letter === question.correct_answer;
        const isIncorrect = showFeedback && isSelected && option.letter !== question.correct_answer;

        return (
          <div
            key={option.letter}
            onClick={() => handleAnswerSelect(option.letter)}
            className={`border-2 rounded-xl transition-all mx-2 relative cursor-pointer ${
              isCorrect
                ? 'border-green-500 bg-green-50'
                : isIncorrect
                ? 'border-red-500 bg-red-50'
                : isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            } ${answered ? 'cursor-default' : ''}`}
          >
            <div className="flex items-center p-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-semibold flex-shrink-0 ${
                isCorrect
                  ? 'border-green-500 bg-green-500 text-white'
                  : isIncorrect
                  ? 'border-red-500 bg-red-500 text-white'
                  : isSelected
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}>
                {option.letter}
              </div>
              
              <div className={`flex-1 text-gray-900 leading-relaxed text-sm md:text-base pr-2 relative ${
                isEliminated ? 'text-gray-400' : ''
              }`}>
                {option.text}
                {isEliminated && (
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-0.5 bg-gray-400"></div>
                  </div>
                )}
              </div>

              {eliminateMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEliminateOption(option.letter);
                  }}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  function handleAnswerSelect(answer: string) {
    if (answered) return;
    onAnswerSelect(answer);
  }
};

export default MarathonAnswerOptions;
