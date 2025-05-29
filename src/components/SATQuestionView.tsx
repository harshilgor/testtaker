
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Flag, ArrowLeft, ArrowRight, CheckCircle, X } from 'lucide-react';
import { SATQuestion } from '../data/satQuestions';

interface SATQuestionViewProps {
  question: SATQuestion;
  selectedAnswer: number | string | null;
  isFlagged: boolean;
  onAnswerChange: (answer: number | string | null) => void;
  onFlag: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  onModuleComplete: () => void;
}

const SATQuestionView: React.FC<SATQuestionViewProps> = ({
  question,
  selectedAnswer,
  isFlagged,
  onAnswerChange,
  onFlag,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  onModuleComplete
}) => {
  const [gridInValue, setGridInValue] = useState<string>(
    typeof selectedAnswer === 'string' ? selectedAnswer : ''
  );
  const [struckOutOptions, setStruckOutOptions] = useState<Set<number>>(new Set());
  const [lastClickTime, setLastClickTime] = useState<{[key: number]: number}>({});

  const handleMultipleChoiceSelect = (optionIndex: number) => {
    // Don't select if option is struck out
    if (struckOutOptions.has(optionIndex)) return;
    
    // Handle double-click to deselect
    const now = Date.now();
    const lastClick = lastClickTime[optionIndex] || 0;
    
    if (now - lastClick < 300) { // Double click within 300ms
      // Double click - deselect if this option is currently selected
      if (selectedAnswer === optionIndex) {
        onAnswerChange(null);
      }
    } else {
      // Single click - select this option
      onAnswerChange(optionIndex);
    }
    
    setLastClickTime({ ...lastClickTime, [optionIndex]: now });
  };

  const handleGridInChange = (value: string) => {
    setGridInValue(value);
    onAnswerChange(value || null);
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
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            question.section === 'reading-writing' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {question.section === 'reading-writing' ? 'Reading & Writing' : 'Math'}
          </span>
          <span className="text-sm text-gray-600">{question.topic}</span>
        </div>
        
        <Button
          onClick={onFlag}
          variant="outline"
          size="sm"
          className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
        >
          <Flag className={`h-4 w-4 mr-2 ${isFlagged ? 'fill-yellow-400' : ''}`} />
          {isFlagged ? 'Flagged' : 'Flag'}
        </Button>
      </div>

      {/* Question Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed mb-6">
          {question.question}
        </h2>

        {/* Answer Options */}
        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isStruckOut = struckOutOptions.has(index);
              
              return (
                <div key={index} className="relative">
                  <div
                    onClick={() => handleMultipleChoiceSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected && !isStruckOut
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : isStruckOut
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ paddingRight: '3rem' }}
                  >
                    <div className="flex items-center">
                      <span className={`font-medium mr-3 ${isStruckOut ? 'text-gray-400' : 'text-gray-500'}`}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className={isStruckOut ? 'line-through' : ''}>{option}</span>
                      {isSelected && !isStruckOut && (
                        <CheckCircle className="h-5 w-5 text-blue-600 ml-auto mr-8" />
                      )}
                    </div>
                  </div>
                  
                  {/* Strike-out button - positioned to avoid overlap */}
                  <button
                    onClick={(e) => toggleStrikeOut(index, e)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-200 transition-colors z-20 ${
                      isStruckOut ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={isStruckOut ? 'Remove strike-out' : 'Strike out this option'}
                    style={{ minWidth: '28px', minHeight: '28px' }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Grid-In Input */}
        {question.type === 'grid-in' && (
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your answer:
            </label>
            <Input
              type="text"
              value={gridInValue}
              onChange={(e) => handleGridInChange(e.target.value)}
              placeholder="Type your numerical answer"
              className="text-lg text-center"
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter numbers, fractions, or decimals. Do not include units.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          variant="outline"
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-3">
          {isLastQuestion ? (
            <Button
              onClick={onModuleComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              Complete Module
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-6"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SATQuestionView;
