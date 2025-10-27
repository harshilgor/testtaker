
import React from 'react';
import UnifiedQuizCreation from './UnifiedQuizCreation';

interface QuizProps {
  userName: string;
  onBack: () => void;
  onTakeSimilarQuiz?: () => void;
}

const Quiz: React.FC<QuizProps> = ({ userName, onBack, onTakeSimilarQuiz }) => {
  return (
    <UnifiedQuizCreation
      userName={userName}
      onBack={onBack}
      onBackToDashboard={onBack}
      onTakeSimilarQuiz={onTakeSimilarQuiz}
    />
  );
};

export default Quiz;
