
import React, { useState } from 'react';
import MockTestSelection from './MockTestSelection';
import SATMockTest from './SATMockTest';

interface MockTestProps {
  userName: string;
  onBack: () => void;
}

const MockTest: React.FC<MockTestProps> = ({ userName, onBack }) => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const handleSelectTest = (testType: string) => {
    setSelectedTest(testType);
  };

  const handleBackToSelection = () => {
    setSelectedTest(null);
  };

  if (!selectedTest) {
    return (
      <MockTestSelection
        userName={userName}
        onBack={onBack}
        onSelectTest={handleSelectTest}
      />
    );
  }

  return (
    <SATMockTest
      userName={userName}
      onBack={handleBackToSelection}
    />
  );
};

export default MockTest;
