
import React from 'react';
import UnifiedBottomNavigation from '@/components/shared/UnifiedBottomNavigation';

interface SATBottomNavigationProps {
  userDisplayName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  showFeedback: boolean;
  onShowNavigator: () => void;
  onNextQuestion: () => void;
  onModuleComplete: () => void;
  onPauseTest: () => void;
  onQuitTest: () => void;
  isMobile?: boolean;
}

const SATBottomNavigation: React.FC<SATBottomNavigationProps> = ({
  userDisplayName,
  currentQuestionIndex,
  totalQuestions,
  isLastQuestion,
  showFeedback,
  onShowNavigator,
  onNextQuestion,
  onModuleComplete,
  onPauseTest,
  onQuitTest,
  isMobile = false
}) => {
  return (
    <UnifiedBottomNavigation
      currentIndex={currentQuestionIndex}
      totalCount={totalQuestions}
      onNext={onNextQuestion}
      onComplete={onModuleComplete}
      onToggleNavigation={onShowNavigator}
      isLastItem={isLastQuestion}
      isSubmitted={showFeedback}
      showNavigation={false}
      isMobile={isMobile}
      variant="sat"
    />
  );
};

export default SATBottomNavigation;
