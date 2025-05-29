
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface SATGridInProps {
  selectedAnswer: string | null;
  onAnswerChange: (answer: string | null) => void;
}

const SATGridIn: React.FC<SATGridInProps> = ({
  selectedAnswer,
  onAnswerChange
}) => {
  const [gridInValue, setGridInValue] = useState<string>(
    typeof selectedAnswer === 'string' ? selectedAnswer : ''
  );

  const handleGridInChange = (value: string) => {
    setGridInValue(value);
    onAnswerChange(value || null);
  };

  return (
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
  );
};

export default SATGridIn;
