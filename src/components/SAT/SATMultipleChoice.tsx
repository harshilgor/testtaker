
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SATMultipleChoiceProps {
  options: string[];
  selectedAnswer: number | null;
  onAnswerSelect: (answer: number | null) => void;
  eliminatedOptions: Set<number>;
  onEliminateOption: (optionIndex: number) => void;
}

const SATMultipleChoice: React.FC<SATMultipleChoiceProps> = ({
  options,
  selectedAnswer,
  onAnswerSelect,
  eliminatedOptions,
  onEliminateOption
}) => {
  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleOptionClick = (index: number) => {
    if (eliminatedOptions.has(index)) return;
    
    // Toggle selection: if already selected, deselect it
    if (selectedAnswer === index) {
      onAnswerSelect(null);
    } else {
      onAnswerSelect(index);
    }
  };

  const handleEliminateClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onEliminateOption(index);
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isEliminated = eliminatedOptions.has(index);
        
        return (
          <div 
            key={index}
            className={`relative border-2 rounded-lg transition-all cursor-pointer ${
              isEliminated
                ? 'border-red-200 bg-red-50 opacity-50'
                : isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
            onClick={() => handleOptionClick(index)}
          >
            <div className="flex items-center p-4">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-semibold flex-shrink-0 ${
                isEliminated
                  ? 'border-red-300 bg-red-100 text-red-600'
                  : isSelected
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-600'
              }`}>
                {optionLabels[index]}
              </div>
              
              <div className={`flex-1 pr-8 ${
                isEliminated ? 'line-through text-red-600' : 'text-gray-900'
              }`}>
                {option}
              </div>
              
              {!isEliminated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => handleEliminateClick(e, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SATMultipleChoice;
