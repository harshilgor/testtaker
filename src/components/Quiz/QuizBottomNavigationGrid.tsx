
import React from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  imageUrl?: string;
  hasImage?: boolean;
}

interface QuizBottomNavigationGridProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  flaggedQuestions: boolean[];
  onGoToQuestion: (index: number) => void;
  answeredCount: number;
  selectedTopics: string[];
}

const QuizBottomNavigationGrid: React.FC<QuizBottomNavigationGridProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onGoToQuestion,
  answeredCount,
  selectedTopics
}) => {
  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Header with better spacing */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Question Navigator</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Topics: {selectedTopics.join(', ')}</div>
          <div>Progress: {answeredCount} of {questions.length} answered</div>
        </div>
      </div>

      {/* Question Grid with better spacing */}
      <div className="mb-6">
        <div className="grid grid-cols-5 gap-3 mb-4">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => onGoToQuestion(index)}
              className={`h-12 w-12 rounded-lg text-sm font-medium border-2 transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white border-blue-600'
                  : answers[index] !== null
                  ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              } ${flaggedQuestions[index] ? 'ring-2 ring-yellow-400' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Legend with better spacing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Legend:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-700">Current Question</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span className="text-gray-700">Answered</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
            <span className="text-gray-700">Unanswered</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-gray-700">Flagged for Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBottomNavigationGrid;
