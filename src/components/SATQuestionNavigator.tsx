
import React from 'react';
import { SATQuestion } from '../data/satQuestions';

interface TestAnswer {
  questionId: string;
  answer: number | string | null;
  flagged: boolean;
  timeSpent: number;
}

interface SATQuestionNavigatorProps {
  questions: SATQuestion[];
  answers: Map<string, TestAnswer>;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
}

const SATQuestionNavigator: React.FC<SATQuestionNavigatorProps> = ({
  questions,
  answers,
  currentQuestionIndex,
  onQuestionSelect
}) => {
  return (
    <div className="w-80 bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold mb-4">Question Navigator</h3>
      <div className="grid grid-cols-6 gap-2">
        {questions.map((question, index) => {
          const answer = answers.get(question.id);
          const isAnswered = answer?.answer !== null && answer?.answer !== undefined;
          const isFlagged = answer?.flagged || false;
          const isCurrent = index === currentQuestionIndex;
          
          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`w-8 h-8 text-xs font-medium rounded ${
                isCurrent
                  ? 'bg-blue-600 text-white'
                  : isAnswered
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              } ${isFlagged ? 'ring-2 ring-yellow-400' : ''}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Unanswered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
          <span>Flagged</span>
        </div>
      </div>
    </div>
  );
};

export default SATQuestionNavigator;
