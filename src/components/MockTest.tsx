
import React from 'react';
import SATMockTest from './SATMockTest';

interface MockTestProps {
  userName: string;
  onBack: () => void;
}

const MockTest: React.FC<MockTestProps> = ({ userName, onBack }) => {
  return (
    <SATMockTest
      userName={userName}
      onBack={onBack}
    />
  );
};

export default MockTest;
