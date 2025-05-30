
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
  allIncorrectRationales: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  onNext: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  isCorrect,
  selectedAnswer,
  correctAnswer,
  correctRationale,
  incorrectRationale,
  allIncorrectRationales,
  onNext
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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

        <div className="space-y-6">
          {/* Your Answer Section (only if incorrect) */}
          {!isCorrect && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Your Answer: {selectedAnswer}</h4>
              {incorrectRationale && (
                <p className="text-red-700">{incorrectRationale}</p>
              )}
            </div>
          )}

          {/* Correct Answer Section */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              Correct Answer: {correctAnswer}
            </h4>
            <p className="text-green-700">{correctRationale}</p>
          </div>

          {/* All Wrong Answer Explanations */}
          {Object.keys(allIncorrectRationales).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 mb-3">Why Other Answers Are Wrong:</h4>
              
              {Object.entries(allIncorrectRationales).map(([option, rationale]) => {
                if (!rationale || option === correctAnswer) return null;
                
                return (
                  <div 
                    key={option}
                    className={`p-3 rounded-lg border ${
                      option === selectedAnswer 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <h5 className={`font-medium mb-1 ${
                      option === selectedAnswer ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      Option {option}:
                    </h5>
                    <p className={`text-sm ${
                      option === selectedAnswer ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {rationale}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4">
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
