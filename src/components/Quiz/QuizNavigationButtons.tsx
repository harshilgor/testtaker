
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface QuizNavigationButtonsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  answeredCount: number;
}

const QuizNavigationButtons: React.FC<QuizNavigationButtonsProps> = ({
  currentQuestionIndex,
  totalQuestions,
  onNext,
  onPrevious,
  onSubmit,
  answeredCount
}) => {
  const canGoPrevious = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <Button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {canGoNext ? (
              <Button
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                className={`flex items-center ${
                  allAnswered
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {allAnswered ? 'Submit Quiz' : `Submit (${answeredCount}/${totalQuestions})`}
              </Button>
            )}
          </div>
        </div>
        
        {!allAnswered && (
          <p className="text-sm text-gray-600 text-center mt-3">
            You can submit the quiz even with unanswered questions
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizNavigationButtons;
