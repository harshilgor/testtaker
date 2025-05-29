
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Eye, GraduationCap, ArrowRight } from 'lucide-react';

interface MarathonActionButtonsProps {
  showAnswer: boolean;
  hintsUsed: number;
  isSubmitting: boolean;
  showExplanation: boolean;
  selectedAnswer: number | string | null;
  onGetHint: () => void;
  onShowAnswer: () => void;
  onSubmitAnswer: () => void;
}

const MarathonActionButtons: React.FC<MarathonActionButtonsProps> = ({
  showAnswer,
  hintsUsed,
  isSubmitting,
  showExplanation,
  selectedAnswer,
  onGetHint,
  onShowAnswer,
  onSubmitAnswer
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <div className="flex space-x-2">
        {!showAnswer && hintsUsed < 3 && !isSubmitting && (
          <Button onClick={onGetHint} variant="outline" size="sm">
            <Lightbulb className="h-4 w-4 mr-1" />
            Hint ({hintsUsed}/3)
          </Button>
        )}
        
        {!showAnswer && !isSubmitting && (
          <Button onClick={onShowAnswer} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Show Answer
          </Button>
        )}
        
        {showExplanation && (
          <Button variant="outline" size="sm">
            <GraduationCap className="h-4 w-4 mr-1" />
            Teach Me This Concept
          </Button>
        )}
      </div>

      <Button
        onClick={onSubmitAnswer}
        disabled={selectedAnswer === null}
        className="bg-orange-600 hover:bg-orange-700"
      >
        {isSubmitting ? 'Processing...' : 'Next Question'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default MarathonActionButtons;
