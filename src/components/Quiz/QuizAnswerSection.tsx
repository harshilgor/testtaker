
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
}

interface QuizAnswerSectionProps {
  question: Question;
  currentAnswer: number | null;
  answeredQuestions: Set<string>;
  flaggedQuestions: Set<string>;
  feedbackPreference: 'immediate' | 'end';
  onAnswerChange: (answer: number) => void;
  onToggleFlag: () => void;
  onSubmitAnswer: () => void;
  showRationale: boolean;
  onShowRationale: () => void;
  isSubmitted: boolean;
}

const QuizAnswerSection: React.FC<QuizAnswerSectionProps> = ({
  question,
  currentAnswer,
  answeredQuestions,
  flaggedQuestions,
  feedbackPreference,
  onAnswerChange,
  onToggleFlag,
  onSubmitAnswer,
  showRationale,
  onShowRationale,
  isSubmitted
}) => {
  const handleAnswerSelect = (selectedAnswer: number) => {
    onAnswerChange(selectedAnswer);
    
    if (feedbackPreference === 'immediate') {
      // Submit directly without toast notification
      onSubmitAnswer();
    }
  };

  const isAnswered = answeredQuestions.has(question.id);
  const isFlagged = flaggedQuestions.has(question.id);
  const isCorrect = currentAnswer !== null && currentAnswer === question.correctAnswer;
  const isIncorrect = currentAnswer !== null && currentAnswer !== question.correctAnswer;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`flag-${question.id}`}
          checked={isFlagged}
          onCheckedChange={() => onToggleFlag()}
        />
        <label htmlFor={`flag-${question.id}`} className="text-sm text-gray-600 cursor-pointer">
          Flag for Review
        </label>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isSelected = currentAnswer === index;
          const isCorrectOption = index === question.correctAnswer;

          return (
            <div key={index} className="space-y-2">
              <div
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer
                  ${isSubmitted && isCorrectOption
                    ? 'border-green-500 bg-green-50'
                    : isSubmitted && isSelected && !isCorrectOption
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                onClick={() => !isSubmitted && handleAnswerSelect(index)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="radio"
                    name={`answer-${question.id}`}
                    checked={isSelected}
                    onChange={() => {}}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitted}
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

              {isSubmitted && isSelected && (
                <Card className={`p-3 ml-12 text-sm ${isCorrectOption ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isCorrectOption ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                      <p className="font-medium mb-1">{isCorrectOption ? 'Correct!' : 'Incorrect'}</p>
                      <p>{question.explanation}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {feedbackPreference === 'end' && !isSubmitted && (
        <Button onClick={onSubmitAnswer} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Submit Answer
        </Button>
      )}
    </div>
  );
};

export default QuizAnswerSection;
