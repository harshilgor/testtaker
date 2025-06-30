
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

  const handlePauseTest = () => {
    // Reset to test selection
    setTestStarted(false);
    setSelectedTest(null);
  };

  const handleQuitTest = () => {
    // Reset everything and go back
    setTestStarted(false);
    setSelectedTest(null);
    onBack();
  };

  // Show test selection if no test is selected
  if (!selectedTest) {
    return (
      <MockTestSelection
        userName={userName}
        onBack={onBack}
        onSelectTest={handleSelectTest}
      />
    );
  }

  // Show test introduction if test is selected but not started
  if (!testStarted) {
    return (
      <SATTestIntroduction 
        onStartTest={handleStartTest}
        onBack={handleBackToSelection}
      />
    );
  }

  // Show the actual test interface
  return (
    <SATMockTestInterface 
      onBack={handleBackToSelection}
      onPauseTest={handlePauseTest}
      onQuitTest={handleQuitTest}
    />
  );
};

export default SATMockTest;
