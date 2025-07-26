
import React, { useState } from 'react';
import SATMockTestInterface from './SATMockTestInterface';
import SATTestIntroduction from './SATTestIntroduction';
import MockTestSelection from './MockTestSelection';

interface SATMockTestProps {
  userName: string;
  onBack: () => void;
}

const SATMockTest: React.FC<SATMockTestProps> = ({ userName, onBack }) => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);

  const handleSelectTest = (testType: string) => {
    setSelectedTest(testType);
  };

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleBackToSelection = () => {
    setSelectedTest(null);
    setTestStarted(false);
  };

  const handleQuitTest = () => {
    setTestStarted(false);
    setSelectedTest(null);
    onBack();
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

  if (!testStarted) {
    return (
      <SATTestIntroduction 
        onStartTest={handleStartTest}
        onBack={handleBackToSelection}
      />
    );
  }

  return (
    <SATMockTestInterface 
      onBack={handleBackToSelection}
      onPauseTest={handleBackToSelection}
      onQuitTest={handleQuitTest}
    />
  );
};

export default SATMockTest;
