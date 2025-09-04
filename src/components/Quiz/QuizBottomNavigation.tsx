
import React from 'react';
import QuizBottomNavigationGrid from './QuizBottomNavigationGrid';
import UnifiedBottomNavigation from '@/components/shared/UnifiedBottomNavigation';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { QuizQuestion } from '@/types/question';

interface QuizBottomNavigationProps {
  questions: QuizQuestion[];
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
  onCompleteQuiz: () => void;
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
  onNext,
  onCompleteQuiz
}) => {
  const { isMobile } = useResponsiveLayout();
  const hasAnswered = answers[currentQuestionIndex] !== null;
  const isSubmitted = submittedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <UnifiedBottomNavigation
      currentIndex={currentQuestionIndex}
      totalCount={questions.length}
      onNext={onNext}
      onSubmit={onSubmit}
      onComplete={onCompleteQuiz}
      onToggleNavigation={onToggleNavigation}
      hasAnswered={hasAnswered}
      isSubmitted={isSubmitted}
      isLastItem={isLastQuestion}
      showNavigation={isNavigationOpen}
      isMobile={isMobile}
      variant="quiz"
    >
      <QuizBottomNavigationGrid
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        onGoToQuestion={onGoToQuestion}
        answeredCount={answeredCount}
        selectedTopics={selectedTopics}
      />
    </UnifiedBottomNavigation>
  );
};

export default QuizBottomNavigation;
