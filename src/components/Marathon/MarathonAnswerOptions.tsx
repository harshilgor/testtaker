
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

  const handleAnswerSelect = (answer: string) => {
    if (answered) return;
    onAnswerSelect(answer);
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedAnswer === option.letter;
        const isEliminated = eliminatedOptions.has(option.letter);
        const isCorrect = showFeedback && option.letter === question.correct_answer;
        const isIncorrect = showFeedback && isSelected && option.letter !== question.correct_answer;

        return (
          <div
            key={option.letter}
            onClick={() => handleAnswerSelect(option.letter)}
            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
              isCorrect
                ? 'border-green-500 bg-green-50'
                : isIncorrect
                ? 'border-red-500 bg-red-50'
                : isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            } ${answered ? 'cursor-default' : ''}`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <input
                type="radio"
                name={`answer-${question.id}`}
                checked={isSelected}
                onChange={() => {}}
                className="text-blue-600 focus:ring-blue-500"
                disabled={answered}
              />
              <label className="cursor-pointer flex-1 flex items-center">
                <span className="font-medium text-gray-700 mr-3 min-w-[20px]">
                  {option.letter}
                </span>
                <span className={`text-gray-900 text-sm md:text-base ${
                  isEliminated ? 'line-through text-gray-400' : ''
                }`}>
                  {option.text}
                </span>
              </label>
            </div>

            {eliminateMode && !answered && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminateOption(option.letter);
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MarathonAnswerOptions;
