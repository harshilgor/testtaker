
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Lightbulb, X } from 'lucide-react';

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
  question_prompt?: string;
  incorrect_rationale_a?: string;
  incorrect_rationale_b?: string;
  incorrect_rationale_c?: string;
  incorrect_rationale_d?: string;
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
  eliminateMode?: boolean;
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
  isSubmitted,
  eliminateMode = false
}) => {
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(new Set());
  
  const handleAnswerSelect = (selectedAnswer: number) => {
    onAnswerChange(selectedAnswer);
    
    if (feedbackPreference === 'immediate') {
      onSubmitAnswer();
    }
  };

  const handleToggleEliminate = (optionIndex: number) => {
    const newEliminated = new Set(eliminatedOptions);
    if (newEliminated.has(optionIndex)) {
      newEliminated.delete(optionIndex);
    } else {
      newEliminated.add(optionIndex);
    }
    setEliminatedOptions(newEliminated);
  };

  const getIncorrectRationale = (selectedAnswer: number) => {
    const optionLetter = String.fromCharCode(65 + selectedAnswer); // A, B, C, D
    switch (optionLetter) {
      case 'A': return question.incorrect_rationale_a;
      case 'B': return question.incorrect_rationale_b;
      case 'C': return question.incorrect_rationale_c;
      case 'D': return question.incorrect_rationale_d;
      default: return null;
    }
  };

  const isAnswered = answeredQuestions.has(question.id);
  const isFlagged = flaggedQuestions.has(question.id);
  const isCorrectAnswer = currentAnswer === question.correctAnswer;
  const userSelectedWrongAnswer = isSubmitted && currentAnswer !== null && !isCorrectAnswer;

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

      {/* Answer Options Header */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Answer Options</h3>
        
        {/* Question Prompt - Display above answer options */}
        {question.question_prompt && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-lg">
            <p className="text-blue-800 font-medium text-sm leading-relaxed">
              {question.question_prompt}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-4">Choose the best answer.</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isSelected = currentAnswer === index;
          const isCorrectOption = index === question.correctAnswer;
          const isEliminated = eliminatedOptions.has(index);

          return (
            <div key={index} className="space-y-2">
              <div
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer relative
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
                    <span className={`text-gray-900 text-sm md:text-base ${isEliminated ? 'line-through' : ''}`}>
                      {option}
                    </span>
                  </label>
                </div>
                {eliminateMode && !isSubmitted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleEliminate(index);
                    }}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Consolidated Rationale Feedback Section */}
      {isSubmitted && (
        <div className="mt-6 space-y-4">
          {/* Show incorrect rationale first if user selected wrong answer */}
          {userSelectedWrongAnswer && currentAnswer !== null && getIncorrectRationale(currentAnswer) && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="font-medium text-red-800 mb-2">
                    Why your answer ({String.fromCharCode(65 + currentAnswer)}) is incorrect:
                  </p>
                  <p className="text-red-700 text-sm leading-relaxed">
                    {getIncorrectRationale(currentAnswer)}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Always show correct rationale when submitted */}
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-green-800 mb-2">
                  {userSelectedWrongAnswer 
                    ? `Why ${String.fromCharCode(65 + question.correctAnswer)} is the correct answer:` 
                    : 'Correct Answer Explanation:'
                  }
                </p>
                <p className="text-green-700 text-sm leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          </Card>

          {/* Summary section for wrong answers */}
          {userSelectedWrongAnswer && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
              <div className="space-y-2 text-sm">
                <p className="text-red-700">
                  <span className="font-medium">Your answer ({String.fromCharCode(65 + currentAnswer!)}):</span> Incorrect
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Correct answer ({String.fromCharCode(65 + question.correctAnswer)}):</span> {question.options[question.correctAnswer]}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {feedbackPreference === 'end' && !isSubmitted && (
        <Button onClick={onSubmitAnswer} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Submit Answer
        </Button>
      )}
    </div>
  );
};

export default QuizAnswerSection;
