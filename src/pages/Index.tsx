import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingScreen from '@/components/LandingScreen';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import Leaderboard from '@/components/Leaderboard';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import Navigation from '@/components/Navigation';

export type Screen = 'landing' | 'auth' | 'dashboard' | 'leaderboard' | 'performance-dashboard';

const Index = () => {
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !session) {
    if (currentScreen === 'auth') {
      return <AuthPage />;
    }
    return <LandingScreen onGetStarted={() => setCurrentScreen('auth')} />;
  }

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';

  const handleSignOut = async () => {
    await signOut();
    setCurrentScreen('landing');
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  if (currentScreen === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userName={userName}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <Leaderboard
            userName={userName}
            onBack={() => setCurrentScreen('dashboard')}
          />
        </div>
      </div>
    );
  }

  if (currentScreen === 'performance-dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userName={userName}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <PerformanceDashboard 
            userName={userName}
            onBack={() => setCurrentScreen('dashboard')} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        userName={userName}
        onSignOut={handleSignOut}
      />
      <div className="pt-16">
        <Dashboard
          userName={userName}
          onMarathonSelect={() => navigate('/marathon')}
          onMockTestSelect={() => {}}
          onQuizSelect={() => navigate('/quiz')}
        />
      </div>
    </div>
  );
};

export default Index;
