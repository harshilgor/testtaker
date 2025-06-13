
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuestionActionsProps {
  answered: boolean;
  showAnswer: boolean;
  selectedAnswer: string;
  onShowAnswer: () => void;
  onSubmit: () => void;
}

const QuestionActions: React.FC<QuestionActionsProps> = ({
  answered,
  showAnswer,
  selectedAnswer,
  onShowAnswer,
  onSubmit
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        {!answered && !showAnswer && (
          <Button
            variant="outline"
            onClick={onShowAnswer}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Show Answer
          </Button>
        )}
      </div>
      
      <div className="space-x-4">
        {!answered && (
          <Button
            onClick={onSubmit}
            disabled={!selectedAnswer && !showAnswer}
            className="min-w-32"
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionActions;
