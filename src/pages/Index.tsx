
import React, { useState } from 'react';
import LandingScreen from '../components/LandingScreen';
import NameEntry from '../components/NameEntry';
import Dashboard from '../components/Dashboard';
import Marathon from '../components/Marathon';
import MockTest from '../components/MockTest';
import AllContent from '../components/AllContent';
import Navigation from '../components/Navigation';

export type Screen = 'landing' | 'name-entry' | 'dashboard' | 'marathon' | 'mock-test' | 'all-content' | 'stats';
export type Subject = 'math' | 'english';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userName, setUserName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

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

  const handleAllContentSelect = () => {
    setCurrentScreen('all-content');
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
    setSelectedSubject(null);
    setSelectedTopic(null);
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const showNavigation = currentScreen !== 'landing' && currentScreen !== 'name-entry';

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
            onAllContentSelect={handleAllContentSelect}
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
      case 'all-content':
        return (
          <AllContent
            userName={userName}
            selectedSubject={selectedSubject}
            selectedTopic={selectedTopic}
            onSubjectSelect={handleSubjectSelect}
            onTopicSelect={handleTopicSelect}
            onBack={handleBackToDashboard}
          />
        );
      case 'stats':
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Performance Dashboard</h1>
              <p className="text-gray-600">Coming soon - Track your progress and performance stats</p>
            </div>
          </div>
        );
      default:
        return <LandingScreen onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && (
        <Navigation 
          currentScreen={currentScreen} 
          onNavigate={handleNavigate}
        />
      )}
      <div className={showNavigation ? 'pt-16' : ''}>
        {renderScreen()}
      </div>
    </div>
  );
};

export default Index;
