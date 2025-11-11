
import React from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import UnifiedQuestionPanel from '@/components/shared/UnifiedQuestionPanel';
import { QuizQuestion } from '@/types/question';

interface QuizQuestionPanelProps {
  question: QuizQuestion;
  isFlagged?: boolean;
  onToggleFlag?: () => void;
  elapsedTime?: number;
  onToggleTimerVisibility?: () => void;
  isTimerVisible?: boolean;
  onToggleEliminate?: () => void;
  isEliminateMode?: boolean;
}

const QuizQuestionPanel: React.FC<QuizQuestionPanelProps> = ({ 
  question, 
  isFlagged = false, 
  onToggleFlag,
  elapsedTime,
  onToggleTimerVisibility,
  isTimerVisible,
  onToggleEliminate,
  isEliminateMode
}) => {
  const { isMobile } = useResponsiveLayout();
  
  return (
    <UnifiedQuestionPanel
      question={question}
      isMobile={isMobile}
      isFlagged={isFlagged}
      onToggleFlag={onToggleFlag}
      showPrompt={true}
      elapsedTime={elapsedTime}
      onToggleTimerVisibility={onToggleTimerVisibility}
      isTimerVisible={isTimerVisible}
      onToggleEliminate={onToggleEliminate}
      isEliminateMode={isEliminateMode}
    />
  );
};

export default QuizQuestionPanel;
