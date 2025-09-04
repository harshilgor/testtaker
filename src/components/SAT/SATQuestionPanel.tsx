
import React from 'react';
import UnifiedQuestionPanel from '@/components/shared/UnifiedQuestionPanel';
import { SATQuestion } from '@/types/question';

interface SATQuestionPanelProps {
  question: SATQuestion | null;
  isMobile?: boolean;
}

const SATQuestionPanel: React.FC<SATQuestionPanelProps> = ({ question, isMobile = false }) => {
  return (
    <UnifiedQuestionPanel
      question={question}
      isMobile={isMobile}
      showPrompt={false}
    />
  );
};

export default SATQuestionPanel;
