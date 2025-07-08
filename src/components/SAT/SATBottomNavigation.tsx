
import React from 'react';
import { Button } from '@/components/ui/button';

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
  const paddingClass = isMobile ? 'px-4 py-3' : 'px-6 py-4';

  return (
    <div className={`bg-white border-t border-gray-200 ${paddingClass} flex items-center justify-between sticky bottom-0 z-40`}>
      <div className="flex items-center space-x-4">
        <Button
          onClick={onShowNavigator}
          variant="outline"
          className="text-sm font-medium bg-gray-800 text-white border-gray-800 hover:bg-gray-700 hover:border-gray-700 px-3 py-2 min-h-[44px]"
        >
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Button>
      </div>
      
      {showFeedback && (
        <div className="flex space-x-3">
          <Button
            onClick={isLastQuestion ? onModuleComplete : onNextQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded min-h-[44px]"
          >
            {isLastQuestion ? 'Complete' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SATBottomNavigation;
