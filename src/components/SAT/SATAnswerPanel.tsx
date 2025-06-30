
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  eliminatedAnswers: Set<number>;
  eliminateMode: boolean;
  onAnswerSelect: (answerIndex: number) => void;
  onToggleMarkForReview: () => void;
  onEliminateAnswer: (answerIndex: number) => void;
}

const SATAnswerPanel: React.FC<SATAnswerPanelProps> = ({
  question,
  currentAnswer,
  markedForReview,
  eliminatedAnswers,
  eliminateMode,
  onAnswerSelect,
  onToggleMarkForReview,
  onEliminateAnswer
}) => {
  if (!question) {
    return (
      <div className="h-full overflow-y-auto p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading options...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-2xl">
        {!question.passage && (
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

          <RadioGroup 
            value={currentAnswer?.toString() || ""} 
            onValueChange={(value) => onAnswerSelect(parseInt(value))}
            className="space-y-3"
          >
            {question.options.map((option, index) => {
              const isEliminated = eliminatedAnswers.has(index);
              const optionLabel = String.fromCharCode(65 + index);
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 ${
                    isEliminated ? 'opacity-50 bg-gray-100' : 'bg-white'
                  } ${currentAnswer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <RadioGroupItem 
                      value={index.toString()} 
                      id={`option-${index}`}
                      disabled={isEliminated}
                      className="text-blue-600"
                    />
                    <label 
                      htmlFor={`option-${index}`} 
                      className="cursor-pointer flex-1 flex items-center"
                    >
                      <span className="font-medium text-gray-700 mr-3 min-w-[20px]">
                        {optionLabel}
                      </span>
                      <span className={isEliminated ? 'line-through text-gray-400' : 'text-gray-900'}>
                        {option}
                      </span>
                    </label>
                  </div>
                  
                  {eliminateMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEliminateAnswer(index)}
                      className={`p-1 h-6 w-6 ${
                        isEliminated 
                          ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default SATAnswerPanel;
