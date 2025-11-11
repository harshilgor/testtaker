
import React, { useState } from 'react';
import MockTestSelection from './MockTestSelection';
import SATTestIntroduction from './SATTestIntroduction';
import SATMockTestInterface from './SATMockTestInterface';
import { MOCK_TEST_CONFIGS, MockTestConfig, MockTestType } from './SAT/mockTestConfig';

interface SATMockTestProps {
  userName: string;
  onBack: () => void;
}

type ViewState = 'selection' | 'introduction' | 'in-progress';

const SATMockTest: React.FC<SATMockTestProps> = ({ userName, onBack }) => {
  const [view, setView] = useState<ViewState>('selection');
  const [activeConfig, setActiveConfig] = useState<MockTestConfig | null>(null);

  const handleSelectTest = (testType: string) => {
    const config = MOCK_TEST_CONFIGS[testType as MockTestType];
    if (!config) {
      return;
    }
    setActiveConfig(config);
    setView('introduction');
  };

  const handleStart = () => {
    setView('in-progress');
  };

  const handleExitToSelection = () => {
    setView('selection');
    setActiveConfig(null);
  };

  if (view === 'introduction' && activeConfig) {
    return (
      <SATTestIntroduction
        config={activeConfig}
        onStartTest={handleStart}
        onBack={() => setView('selection')}
      />
    );
  }

  if (view === 'in-progress' && activeConfig) {
    return (
      <SATMockTestInterface
        userName={userName}
        config={activeConfig}
        onExit={handleExitToSelection}
        onCancel={() => setView('selection')}
      />
    );
  }

  return (
    <MockTestSelection
      userName={userName}
      onBack={onBack}
      onSelectTest={handleSelectTest}
    />
  );
};

export default SATMockTest;
