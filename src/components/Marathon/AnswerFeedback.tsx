
import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  correctRationale: string;
  showAnswerUsed: boolean;
}

const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  selectedAnswer,
  correctAnswer,
  correctRationale,
  showAnswerUsed
}) => {
  return (
    <Card className={`p-6 mb-6 border-2 ${
      showAnswerUsed 
        ? 'bg-blue-50 border-blue-200' 
        : isCorrect 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
    }`}>
      <div className="space-y-4">
        {/* Result Header */}
        <div className="flex items-center gap-3">
          {showAnswerUsed ? (
            <>
              <Eye className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-blue-800">
                Answer Revealed
              </span>
            </>
          ) : isCorrect ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-lg font-semibold text-green-800">
                Correct Answer!
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-6 w-6 text-red-600" />
              <span className="text-lg font-semibold text-red-800">
                Incorrect Answer
              </span>
            </>
          )}
        </div>

        {/* Answer Summary */}
        <div className="space-y-2">
          {!showAnswerUsed && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Your Answer:</span>
              <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {selectedAnswer}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Correct Answer:</span>
            <span className="font-bold text-green-700">{correctAnswer}</span>
          </div>
        </div>

        {/* Rationale */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Explanation:</h4>
          <p className="text-gray-800 leading-relaxed">{correctRationale}</p>
        </div>
      </div>
    </Card>
  );
};

export default AnswerFeedback;
