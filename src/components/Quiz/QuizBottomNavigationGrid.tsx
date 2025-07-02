
import React from 'react';
import { Flag } from 'lucide-react';

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
  const generateSectionTitle = () => {
    const topicsText = selectedTopics.join(', ');
    return `${topicsText} – ${questions.length} Questions`;
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{generateSectionTitle()}</h3>
        <div className="text-sm text-gray-600">
          Attempted: {answeredCount}/{questions.length}
        </div>
      </div>
      
      {/* Bluebook-style legend */}
      <div className="flex items-center justify-center space-x-8 mb-6 text-sm">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-600 border-2 border-blue-600 rounded mr-2"></div>
          <span className="text-gray-700">Current</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded mr-2"></div>
          <span className="text-gray-700">Answered</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-white border-2 border-dashed border-gray-400 rounded mr-2"></div>
          <span className="text-gray-700">Unanswered</span>
        </div>
        <div className="flex items-center">
          <Flag className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-gray-700">For Review</span>
        </div>
      </div>
      
      {/* Enhanced Bluebook-style question grid */}
      <div className="grid grid-cols-10 gap-3 mb-6 justify-items-center">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => onGoToQuestion(index)}
            className={`w-8 h-8 rounded border-2 text-sm font-medium transition-all duration-200 hover:scale-105 relative ${
              index === currentQuestionIndex
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : answers[index] !== null
                ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                : 'bg-white text-gray-600 border-dashed border-gray-400 hover:border-gray-500'
            }`}
          >
            {index + 1}
            {flaggedQuestions[index] && (
              <Flag className="w-3 h-3 text-red-500 absolute -top-1 -right-1 drop-shadow-sm" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizBottomNavigationGrid;
