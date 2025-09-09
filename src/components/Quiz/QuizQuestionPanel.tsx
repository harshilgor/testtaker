
import React from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import UnifiedQuestionPanel from '@/components/shared/UnifiedQuestionPanel';
import { QuizQuestion } from '@/types/question';

interface QuizQuestionPanelProps {
  question: QuizQuestion;
  isFlagged?: boolean;
  onToggleFlag?: () => void;
}

const QuizQuestionPanel: React.FC<QuizQuestionPanelProps> = ({ 
  question, 
  isFlagged = false, 
  onToggleFlag 
}) => {
  const { isMobile } = useResponsiveLayout();
  
  return (
    <UnifiedQuestionPanel
      question={question}
      isMobile={isMobile}
      isFlagged={isFlagged}
      onToggleFlag={onToggleFlag}
      showPrompt={true}
    />
  );
};

export default QuizQuestionPanel;
