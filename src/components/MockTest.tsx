
import React from 'react';
import QuestionView from './QuestionView';

interface MockTestProps {
  userName: string;
  onBack: () => void;
}

const MockTest: React.FC<MockTestProps> = ({ userName, onBack }) => {
  return (
    <QuestionView
      subject="mixed"
      mode="mock"
      userName={userName}
      onBack={onBack}
    />
  );
};

export default MockTest;
