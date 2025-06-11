
import React from 'react';
import { Button } from '@/components/ui/button';
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

interface QuizBottomNavigationProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  flaggedQuestions: boolean[];
  onGoToQuestion: (index: number) => void;
  answeredCount: number;
  selectedTopics: string[];
}

const QuizBottomNavigation: React.FC<QuizBottomNavigationProps> = ({
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
    <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{generateSectionTitle()}</h3>
        </div>
        
        <div className="flex items-center space-x-6 mb-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded mr-2"></div>
            <span>Unanswered</span>
          </div>
          <div className="flex items-center">
            <Flag className="w-4 h-4 text-red-500 mr-2" />
            <span>For Review</span>
          </div>
        </div>
        
        <div className="grid grid-cols-10 gap-2 mb-6">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => onGoToQuestion(index)}
              className={`w-8 h-8 rounded text-sm font-medium border transition-colors relative ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 text-white border-blue-600'
                  : answers[index] !== null
                  ? 'bg-blue-100 text-blue-600 border-blue-300'
                  : 'border-2 border-dashed border-gray-400 text-gray-600'
              }`}
            >
              {index + 1}
              {flaggedQuestions[index] && (
                <Flag className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizBottomNavigation;
