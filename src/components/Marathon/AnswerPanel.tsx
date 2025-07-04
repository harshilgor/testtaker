
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { DatabaseQuestion } from '@/services/questionService';

interface AnswerPanelProps {
  question: DatabaseQuestion;
  selectedAnswer: string;
  answered: boolean;
  showFeedback: boolean;
  showAnswer: boolean;
  markedForReview: boolean;
  onAnswerSelect: (answer: string) => void;
  onMarkedForReviewChange: (checked: boolean) => void;
}

const AnswerPanel: React.FC<AnswerPanelProps> = ({
  question,
  selectedAnswer,
  answered,
  showFeedback,
  showAnswer,
  markedForReview,
  onAnswerSelect,
  onMarkedForReviewChange
}) => {
  const isCorrect = selectedAnswer === question.correct_answer && !showAnswer;

  return (
    <div className="w-1/2 bg-white p-8 overflow-y-auto">
      <div className="max-w-2xl">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="mark-review"
            checked={markedForReview}
            onCheckedChange={(checked) => onMarkedForReviewChange(checked === true)}
          />
          <label htmlFor="mark-review" className="text-sm text-gray-600 cursor-pointer">
            Mark for Review
          </label>
        </div>

        <div className="text-sm text-gray-600 mb-6">
          Choose the best answer.
        </div>

        {/* Answer options */}
        <div className="space-y-3 mb-8">
          {[
            { letter: 'A', text: question.option_a },
            { letter: 'B', text: question.option_b },
            { letter: 'C', text: question.option_c },
            { letter: 'D', text: question.option_d }
          ].map((option) => (
            <div
              key={option.letter}
              onClick={() => onAnswerSelect(option.letter)}
              className={`border-2 rounded-lg transition-all cursor-pointer ${
                selectedAnswer === option.letter
                  ? showFeedback
                    ? option.letter === question.correct_answer
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-blue-500 bg-blue-50'
                  : showFeedback && option.letter === question.correct_answer
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              } ${answered ? 'cursor-default' : ''}`}
            >
              <div className="flex items-center p-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-semibold flex-shrink-0 ${
                  selectedAnswer === option.letter
                    ? showFeedback
                      ? option.letter === question.correct_answer
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-red-500 bg-red-500 text-white'
                      : 'border-blue-500 bg-blue-500 text-white'
                    : showFeedback && option.letter === question.correct_answer
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}>
                  {option.letter}
                </div>
                
                <div className="flex-1 text-gray-900 leading-relaxed">
                  {option.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show feedback if answered */}
        {showFeedback && (
          <div className={`p-4 rounded-lg mb-6 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-medium mb-2 ${
              isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {isCorrect ? 'Correct!' : showAnswer ? 'Answer Revealed' : 'Incorrect'}
            </div>
            <div className="text-gray-700 text-sm">
              <strong>Explanation:</strong> {question.correct_rationale}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerPanel;
