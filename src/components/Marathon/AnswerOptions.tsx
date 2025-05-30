
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface AnswerOptionsProps {
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
  answered: boolean;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  optionA,
  optionB,
  optionC,
  optionD,
  selectedAnswer,
  onAnswerChange,
  answered
}) => {
  const options = [
    { value: 'A', text: optionA },
    { value: 'B', text: optionB },
    { value: 'C', text: optionC },
    { value: 'D', text: optionD }
  ];

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
                selectedAnswer === option.value 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50 border-gray-200'
              } ${answered ? 'cursor-default' : ''}`}
            >
              <span className="font-semibold mr-2">{option.value}.</span>
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default AnswerOptions;
