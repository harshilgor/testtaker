
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerOptionsProps {
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
  answered: boolean;
  correctAnswer?: string;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  optionA,
  optionB,
  optionC,
  optionD,
  selectedAnswer,
  onAnswerChange,
  answered,
  correctAnswer = ''
}) => {
  const options = [
    { value: 'A', text: optionA },
    { value: 'B', text: optionB },
    { value: 'C', text: optionC },
    { value: 'D', text: optionD }
  ];

  const getOptionStyle = (optionValue: string) => {
    if (!correctAnswer) {
      // Normal state - no feedback yet
      return selectedAnswer === optionValue 
        ? 'bg-blue-50 border-blue-200' 
        : 'hover:bg-gray-50 border-gray-200';
    }

    // Feedback state - show correct/incorrect
    const isCorrect = optionValue === correctAnswer;
    const isSelected = optionValue === selectedAnswer;

    if (isCorrect) {
      return 'bg-green-100 border-green-400 text-green-800';
    } else if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-400 text-red-800';
    } else {
      return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getOptionIcon = (optionValue: string) => {
    if (!correctAnswer) return null;

    const isCorrect = optionValue === correctAnswer;
    const isSelected = optionValue === selectedAnswer;

    if (isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (isSelected && !isCorrect) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="mb-8">
      <RadioGroup
        value={selectedAnswer}
        onValueChange={onAnswerChange}
        disabled={answered}
        className="space-y-4"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-start space-x-3">
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="mt-1"
              disabled={answered}
            />
            <Label 
              htmlFor={option.value} 
              className={`flex-1 text-base leading-relaxed cursor-pointer p-3 rounded-lg border transition-colors ${
                getOptionStyle(option.value)
              } ${answered ? 'cursor-default' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold mr-2">{option.value}.</span>
                  {option.text}
                </div>
                {getOptionIcon(option.value)}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default AnswerOptions;
