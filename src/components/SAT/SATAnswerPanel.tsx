
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Lightbulb, X } from 'lucide-react';

interface Question {
  id: string;
  content: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
}

interface SATAnswerPanelProps {
  question: Question | null;
  currentAnswer: number | undefined;
  markedForReview: boolean;
  showFeedback: boolean;
  onAnswerSelect: (answerIndex: number) => void;
  onToggleMarkForReview: () => void;
  onSubmitAnswer: () => void;
  isMobile?: boolean;
  eliminateMode?: boolean;
  eliminatedAnswers?: Set<number>;
  onEliminateAnswer?: (answerIndex: number) => void;
}

const SATAnswerPanel: React.FC<SATAnswerPanelProps> = ({
  question,
  currentAnswer,
  markedForReview,
  showFeedback,
  onAnswerSelect,
  onToggleMarkForReview,
  onSubmitAnswer,
  isMobile = false,
  eliminateMode = false,
  eliminatedAnswers = new Set(),
  onEliminateAnswer
}) => {
  if (!question) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading options...</div>
        </div>
      </div>
    );
  }

  const paddingClass = isMobile ? 'p-4' : 'p-6';

  return (
    <div className={`h-full overflow-y-auto ${paddingClass} bg-white`}>
      <div className="max-w-2xl mx-auto">
        {!question.passage && !isMobile && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Question</h3>
            <p className="text-lg leading-relaxed text-gray-900">
              {question.content}
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="mark-review"
              checked={markedForReview}
              onCheckedChange={onToggleMarkForReview}
            />
            <label htmlFor="mark-review" className="text-sm text-gray-600 cursor-pointer">
              Mark for Review
            </label>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Choose the best answer.
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index);
              const isSelected = currentAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const isIncorrect = showFeedback && isSelected && !isCorrect;
              const isEliminated = eliminatedAnswers.has(index);
              
              return (
                <div key={index} className="space-y-2">
                   <div 
                    className={`flex items-center space-x-3 p-3 rounded-lg border min-h-[44px] cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => onAnswerSelect(index)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="radio"
                        name="answer"
                        checked={isSelected}
                        onChange={() => onAnswerSelect(index)}
                        className="text-blue-600 focus:ring-blue-500 pointer-events-none"
                        tabIndex={-1}
                      />
                      <label className="cursor-pointer flex-1 flex items-center pointer-events-none">
                        <span className="font-medium text-gray-700 mr-3 min-w-[20px]">
                          {optionLabel}
                        </span>
                        <span className={`text-gray-900 text-sm md:text-base ${isEliminated ? 'line-through' : ''}`}>
                          {option}
                        </span>
                      </label>
                    </div>
                    
                    {/* Eliminate button - only show when eliminate mode is active */}
                    {eliminateMode && onEliminateAnswer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEliminateAnswer(index);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        aria-label={`${isEliminated ? 'Restore' : 'Eliminate'} option ${optionLabel}`}
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>

                  {/* No immediate feedback in SAT Practice Test mode */}
                </div>
              );
            })}
          </div>

          {currentAnswer !== undefined && (
            <div className="mt-6">
              <Button
                onClick={onSubmitAnswer}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded min-h-[44px]"
              >
                Submit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SATAnswerPanel;
