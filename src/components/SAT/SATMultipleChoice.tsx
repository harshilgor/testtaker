
import React, { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SATMultipleChoiceProps {
  options: string[];
  selectedAnswer: number | null;
  onAnswerChange: (answer: number | null) => void;
}

const SATMultipleChoice: React.FC<SATMultipleChoiceProps> = ({
  options,
  selectedAnswer,
  onAnswerChange
}) => {
  const [struckOutOptions, setStruckOutOptions] = useState<Set<number>>(new Set());

  const handleOptionSelect = (optionIndex: number) => {
    // Don't select if option is struck out
    if (struckOutOptions.has(optionIndex)) return;
    
    // Simple toggle behavior: if this option is selected, deselect it, otherwise select it
    if (selectedAnswer === optionIndex) {
      onAnswerChange(null);
    } else {
      onAnswerChange(optionIndex);
    }
  };

  const toggleStrikeOut = (optionIndex: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const newStruckOut = new Set(struckOutOptions);
    if (newStruckOut.has(optionIndex)) {
      newStruckOut.delete(optionIndex);
    } else {
      newStruckOut.add(optionIndex);
      // If we're striking out the selected answer, deselect it
      if (selectedAnswer === optionIndex) {
        onAnswerChange(null);
      }
    }
    setStruckOutOptions(newStruckOut);
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isStruckOut = struckOutOptions.has(index);
        
        return (
          <div key={index} className="relative">
            <button
              onClick={() => handleOptionSelect(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                isSelected && !isStruckOut
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : isStruckOut
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              style={{ paddingRight: '4rem' }}
              disabled={isStruckOut}
            >
              <div className="flex items-center">
                <span className={`font-medium mr-3 min-w-[2rem] ${isStruckOut ? 'text-gray-400' : 'text-gray-500'}`}>
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className={`flex-1 ${isStruckOut ? 'line-through' : ''}`}>{option}</span>
                {isSelected && !isStruckOut && (
                  <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
                )}
              </div>
            </button>
            
            {/* Strike-out button - positioned absolutely to avoid conflicts */}
            <button
              onClick={(e) => toggleStrikeOut(index, e)}
              className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors z-10 ${
                isStruckOut ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isStruckOut ? 'Remove strike-out' : 'Strike out this option'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SATMultipleChoice;
