
import React, { useState } from 'react';
import SATMockTestInterface from './SATMockTestInterface';
import SATTestIntroduction from './SATTestIntroduction';

interface SATMockTestProps {
  userName: string;
  onBack: () => void;
}

const SATMockTest: React.FC<SATMockTestProps> = ({ userName, onBack }) => {
  const [testStarted, setTestStarted] = useState(false);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  if (!testStarted) {
    return <SATTestIntroduction onStartTest={handleStartTest} />;
  }

  return <SATMockTestInterface onBack={onBack} />;
};

export default SATMockTest;
