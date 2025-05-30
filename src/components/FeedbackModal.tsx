
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  correctRationale: string;
  incorrectRationale?: string;
  onNext: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  isCorrect,
  selectedAnswer,
  correctAnswer,
  correctRationale,
  incorrectRationale,
  onNext
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-green-600">Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <span className="text-red-600">Incorrect</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isCorrect && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Your Answer: {selectedAnswer}</h4>
              {incorrectRationale && (
                <p className="text-red-700">{incorrectRationale}</p>
              )}
            </div>
          )}

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              Correct Answer: {correctAnswer}
            </h4>
            <p className="text-green-700">{correctRationale}</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={onNext} className="min-w-32">
              Next Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
