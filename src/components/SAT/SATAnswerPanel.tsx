
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

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
}

const SATAnswerPanel: React.FC<SATAnswerPanelProps> = ({
  question,
  currentAnswer,
  markedForReview,
  showFeedback,
  onAnswerSelect,
  onToggleMarkForReview,
  onSubmitAnswer,
  isMobile = false
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
              
              return (
                <div key={index} className="space-y-2">
                  <div 
                    className={`flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 min-h-[44px] cursor-pointer ${
                      showFeedback && isCorrect
                        ? 'border-green-500 bg-green-50'
                        : showFeedback && isIncorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => !showFeedback && onAnswerSelect(index)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="radio"
                        name="answer"
                        checked={isSelected}
                        onChange={() => !showFeedback && onAnswerSelect(index)}
                        disabled={showFeedback}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <label className="cursor-pointer flex-1 flex items-center">
                        <span className="font-medium text-gray-700 mr-3 min-w-[20px]">
                          {optionLabel}
                        </span>
                        <span className="text-gray-900 text-sm md:text-base">
                          {option}
                        </span>
                      </label>
                    </div>
                  </div>

                  {showFeedback && isSelected && (
                    <Card className={`p-3 ml-12 text-sm ${
                      isCorrect 
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          isCorrect ? 'text-green-600' : 'text-red-600'
                        }`} />
                        <div>
                          <p className="font-medium mb-1">
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                          </p>
                          <p>{question.explanation}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {showFeedback && isCorrect && currentAnswer !== index && (
                    <Card className="p-3 ml-12 text-sm bg-green-50 border-green-200 text-green-800">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                        <div>
                          <p className="font-medium mb-1">Correct Answer:</p>
                          <p>{question.explanation}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>

          {!showFeedback && currentAnswer !== undefined && (
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
