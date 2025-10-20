
import React from 'react';
import UnifiedQuizCreation from './UnifiedQuizCreation';

interface QuizProps {
  userName: string;
  onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({ userName, onBack }) => {
  return (
    <UnifiedQuizCreation
      userName={userName}
      onBack={onBack}
      onBackToDashboard={onBack}
    />
  );
};

export default Quiz;
