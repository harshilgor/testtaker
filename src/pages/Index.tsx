
import React, { useState } from 'react';
import LandingScreen from '../components/LandingScreen';
import NameEntry from '../components/NameEntry';
import Dashboard from '../components/Dashboard';
import Marathon from '../components/Marathon';
import MockTest from '../components/MockTest';

export type Screen = 'landing' | 'name-entry' | 'dashboard' | 'marathon' | 'mock-test';
export type Subject = 'math' | 'english';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userName, setUserName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleGetStarted = () => {
    setCurrentScreen('name-entry');
  };

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setCurrentScreen('dashboard');
  };

  const handleMarathonSelect = () => {
    setCurrentScreen('marathon');
  };

  const handleMockTestSelect = () => {
    setCurrentScreen('mock-test');
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
    setSelectedSubject(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingScreen onGetStarted={handleGetStarted} />;
      case 'name-entry':
        return <NameEntry onNameSubmit={handleNameSubmit} />;
      case 'dashboard':
        return (
          <Dashboard
            userName={userName}
            onMarathonSelect={handleMarathonSelect}
            onMockTestSelect={handleMockTestSelect}
          />
        );
      case 'marathon':
        return (
          <Marathon
            userName={userName}
            selectedSubject={selectedSubject}
            onSubjectSelect={handleSubjectSelect}
            onBack={handleBackToDashboard}
          />
        );
      case 'mock-test':
        return <MockTest userName={userName} onBack={handleBackToDashboard} />;
      default:
        return <LandingScreen onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {renderScreen()}
    </div>
  );
};

export default Index;
