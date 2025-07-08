
import React from 'react';
import { Button } from '@/components/ui/button';
import QuizBottomNavigationGrid from './QuizBottomNavigationGrid';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

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
  onSubmit: () => void;
  submittedQuestions: boolean[];
  onNext: () => void;
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
  onToggleNavigation,
  onSubmit,
  submittedQuestions,
  onNext
}) => {
  const { isMobile } = useResponsiveLayout();
  const hasAnswered = answers[currentQuestionIndex] !== null;
  const isSubmitted = submittedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex justify-between items-center">
        {/* Left side - Progress indicator - make it directly clickable */}
        <button
          onClick={onToggleNavigation}
          className={`text-sm font-medium bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors ${
            isMobile ? 'h-11' : ''
          }`}
        >
          Question {currentQuestionIndex + 1} of {questions.length}
        </button>
        
        {/* Right side - Submit/Next button */}
        <Button
          onClick={isSubmitted ? onNext : onSubmit}
          disabled={!hasAnswered || (isSubmitted && isLastQuestion)}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 ${
            isMobile ? 'h-11' : ''
          }`}
        >
          {isSubmitted ? (isLastQuestion ? 'Complete Quiz' : 'Next') : 'Submit'}
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
