
import React from 'react';
import { Button } from '@/components/ui/button';
import { Flag, Calculator as CalculatorIcon } from 'lucide-react';
import { Question } from '../data/questions';

interface MarathonQuestionHeaderProps {
  question: Question;
  onFlag: () => void;
  isFlagged: boolean;
  calculatorEnabled: boolean;
  calculatorOpen: boolean;
  onCalculatorToggle: () => void;
}

const MarathonQuestionHeader: React.FC<MarathonQuestionHeaderProps> = ({
  question,
  onFlag,
  isFlagged,
  calculatorEnabled,
  calculatorOpen,
  onCalculatorToggle
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          question.subject === 'math' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {question.subject === 'math' ? 'Mathematics' : 'English'}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {question.subject === 'math' && calculatorEnabled && (
          <Button
            onClick={onCalculatorToggle}
            variant="outline"
            size="sm"
            className={calculatorOpen ? 'bg-blue-50 border-blue-300' : ''}
          >
            <CalculatorIcon className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          onClick={onFlag}
          variant="outline"
          size="sm"
          className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
        >
          <Flag className={`h-4 w-4 ${isFlagged ? 'fill-yellow-400' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default MarathonQuestionHeader;
