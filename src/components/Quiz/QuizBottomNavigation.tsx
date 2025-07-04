
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import QuizBottomNavigationGrid from './QuizBottomNavigationGrid';

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
  isNavigationOpen: boolean;
  onToggleNavigation: () => void;
}

const QuizBottomNavigation: React.FC<QuizBottomNavigationProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onGoToQuestion,
  answeredCount,
  selectedTopics,
  isNavigationOpen,
  onToggleNavigation
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onToggleNavigation}
          className="flex items-center space-x-3 border-gray-300 hover:bg-gray-50 px-6 py-2"
        >
          <span className="text-sm font-medium bg-gray-800 text-white px-3 py-1 rounded">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <ChevronUp className={`h-4 w-4 transition-transform ${isNavigationOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Navigation Grid */}
      {isNavigationOpen && (
        <QuizBottomNavigationGrid
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onGoToQuestion={onGoToQuestion}
          answeredCount={answeredCount}
          selectedTopics={selectedTopics}
        />
      )}
    </div>
  );
};

export default QuizBottomNavigation;
