
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Eye, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SATMultipleChoiceProps {
  options: string[];
  selectedAnswer: number | null;
  onAnswerSelect: (answer: number | null) => void;
  eliminatedOptions: Set<number>;
  onEliminateOption: (optionIndex: number) => void;
  rationales?: {
    correct: string;
    incorrect: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
    };
  };
  correctAnswer?: number;
  showExplanations?: boolean;
}

const SATMultipleChoice: React.FC<SATMultipleChoiceProps> = ({
  options,
  selectedAnswer,
  onAnswerSelect,
  eliminatedOptions,
  onEliminateOption,
  rationales,
  correctAnswer,
  showExplanations = false
}) => {
  const [showRationales, setShowRationales] = useState(false);
  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleOptionClick = (index: number) => {
    if (eliminatedOptions.has(index)) return;
    
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

  const getRationaleForOption = (index: number): string | undefined => {
    if (!rationales) return undefined;
    
    const optionLetter = optionLabels[index] as 'A' | 'B' | 'C' | 'D';
    
    if (correctAnswer === index) {
      return rationales.correct;
    } else {
      return rationales.incorrect[optionLetter];
    }
  };

  return (
    <div className="space-y-3">
      {/* Show Rationales Button */}
      {rationales && !showExplanations && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setShowRationales(!showRationales)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{showRationales ? 'Hide' : 'Show'} Explanations</span>
          </Button>
        </div>
      )}

      {options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isEliminated = eliminatedOptions.has(index);
        const isCorrect = correctAnswer === index;
        const isIncorrect = showExplanations && selectedAnswer === index && correctAnswer !== index;
        const rationale = getRationaleForOption(index);
        
        return (
          <div key={index} className="space-y-2">
            <div 
              className={`relative border-2 rounded-lg transition-all cursor-pointer ${
                isEliminated
                  ? 'border-red-200 bg-red-50 opacity-50'
                  : showExplanations && isCorrect
                  ? 'border-green-500 bg-green-50'
                  : showExplanations && isIncorrect
                  ? 'border-red-500 bg-red-50'
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
                    : showExplanations && isCorrect
                    ? 'border-green-500 bg-green-500 text-white'
                    : showExplanations && isIncorrect
                    ? 'border-red-500 bg-red-500 text-white'
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
                
                {!isEliminated && !showExplanations && (
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

            {/* Show rationale if explanations are enabled */}
            {(showRationales || showExplanations) && rationale && (
              <Card className={`p-3 ml-12 text-sm ${
                isCorrect 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className="flex items-start space-x-2">
                  <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    isCorrect ? 'text-green-600' : 'text-blue-600'
                  }`} />
                  <p>{rationale}</p>
                </div>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SATMultipleChoice;
