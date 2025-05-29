
import React from 'react';
import { Question } from '../data/questions';

interface MarathonAnswerOptionsProps {
  question: Question;
  selectedAnswer: number | string | null;
  showAnswer: boolean;
  isSubmitting: boolean;
  darkMode: boolean;
  onAnswerSelect: (answerIndex: number) => void;
}

const MarathonAnswerOptions: React.FC<MarathonAnswerOptionsProps> = ({
  question,
  selectedAnswer,
  showAnswer,
  isSubmitting,
  darkMode,
  onAnswerSelect
}) => {
  return (
    <div className="space-y-3">
      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => onAnswerSelect(index)}
          disabled={showAnswer || isSubmitting}
          className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
            showAnswer
              ? index === question.correctAnswer
                ? 'border-green-500 bg-green-50'
                : selectedAnswer === index
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-gray-50'
              : selectedAnswer === index
              ? 'border-blue-500 bg-blue-50'
              : `border-gray-200 hover:border-gray-300 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`
          }`}
        >
          <div className="flex items-center">
            <span className="font-medium mr-3 text-gray-500">
              {String.fromCharCode(65 + index)}.
            </span>
            <span>{option}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MarathonAnswerOptions;
