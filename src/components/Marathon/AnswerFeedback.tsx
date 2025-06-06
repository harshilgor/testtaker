
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  correctRationale?: string;
  incorrectRationale?: string;
  showAnswerUsed: boolean;
}

const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  selectedAnswer,
  correctAnswer,
  correctRationale,
  incorrectRationale,
  showAnswerUsed
}) => {
  return (
    <div className={`mt-6 p-4 rounded-lg border ${
      isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        {isCorrect ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
        <span className={`font-semibold ${
          isCorrect ? 'text-green-800' : 'text-red-800'
        }`}>
          {isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
        </span>
        {showAnswerUsed && (
          <span className="text-sm text-gray-600 ml-2">(Answer was shown)</span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Your Answer: <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {selectedAnswer}
            </span>
          </p>
          <p className="text-sm font-medium text-gray-700">
            Correct Answer: <span className="font-bold text-green-600">
              {correctAnswer}
            </span>
          </p>
        </div>

        {correctRationale && (
          <div>
            <h4 className="font-medium text-gray-800 mb-1">Explanation:</h4>
            <p className="text-sm text-gray-700">{correctRationale}</p>
          </div>
        )}

        {!isCorrect && incorrectRationale && (
          <div className="bg-red-100 border border-red-200 rounded p-3">
            <h4 className="font-medium text-red-800 mb-1">
              Why {selectedAnswer} is incorrect:
            </h4>
            <p className="text-sm text-red-700">{incorrectRationale}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerFeedback;
