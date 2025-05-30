
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  const getAllOptions = () => {
    const options = ['A', 'B', 'C', 'D'];
    return options.map(option => ({
      option,
      rationale: option === correctAnswer ? correctRationale : allIncorrectRationales[option as keyof typeof allIncorrectRationales],
      isCorrect: option === correctAnswer,
      isSelected: option === selectedAnswer
    })).filter(item => item.rationale); // Only show options that have rationales
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isCorrect ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-green-600">Correct Answer!</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <span className="text-red-600">Incorrect Answer</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Result Summary */}
          <div className={`p-4 rounded-lg border-2 ${
            isCorrect 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Your Answer:</span>
              <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {selectedAnswer}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Correct Answer:</span>
              <span className="font-bold text-green-700">{correctAnswer}</span>
            </div>
          </div>

          {/* Detailed Explanations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Answer Explanations
              </h3>
            </div>

            {getAllOptions().map(({ option, rationale, isCorrect: optionIsCorrect, isSelected }) => (
              <div 
                key={option}
                className={`p-4 rounded-lg border-2 transition-all ${
                  optionIsCorrect 
                    ? 'bg-green-50 border-green-300 shadow-sm' 
                    : isSelected 
                      ? 'bg-red-50 border-red-300 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    optionIsCorrect 
                      ? 'bg-green-600' 
                      : isSelected 
                        ? 'bg-red-600'
                        : 'bg-gray-400'
                  }`}>
                    {option}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {optionIsCorrect && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-700">Correct Answer</span>
                        </>
                      )}
                      {!optionIsCorrect && isSelected && (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="font-semibold text-red-700">Your Choice</span>
                        </>
                      )}
                      {!optionIsCorrect && !isSelected && (
                        <span className="font-semibold text-gray-600">Why This is Wrong</span>
                      )}
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${
                      optionIsCorrect 
                        ? 'text-green-800' 
                        : isSelected 
                          ? 'text-red-800'
                          : 'text-gray-700'
                    }`}>
                      {rationale}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Learning Point */}
          {!isCorrect && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Key Learning Point
              </h4>
              <p className="text-blue-700 text-sm">
                The correct answer is <strong>{correctAnswer}</strong> because {correctRationale.toLowerCase()}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onNext} className="min-w-32 bg-orange-600 hover:bg-orange-700">
              Next Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
