
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SATQuestionNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  onModuleComplete: () => void;
}

const SATQuestionNavigation: React.FC<SATQuestionNavigationProps> = ({
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  onModuleComplete
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      <Button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        variant="outline"
        className="flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="flex space-x-3">
        {isLastQuestion ? (
          <Button
            onClick={onModuleComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-6"
          >
            Complete Module
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-6"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SATQuestionNavigation;
