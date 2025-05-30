
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingScreen from '@/components/LandingScreen';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import Marathon from '@/components/Marathon';
import MarathonSettings from '@/components/MarathonSettings';
import Quiz from '@/components/Quiz';
import MockTest from '@/components/MockTest';
import Leaderboard from '@/components/Leaderboard';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import Navigation from '@/components/Navigation';
import { MarathonSettings as MarathonSettingsType } from '@/types/marathon';

export type Subject = 'math' | 'english' | 'both';
type Screen = 'landing' | 'auth' | 'dashboard' | 'marathon-settings' | 'marathon' | 'quiz' | 'mocktest' | 'leaderboard' | 'performance-dashboard';

const Index = () => {
  const { user, session, loading, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [marathonSettings, setMarathonSettings] = useState<MarathonSettingsType | null>(null);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, show landing or auth page
  if (!user || !session) {
    if (currentScreen === 'auth') {
      return <AuthPage />;
    }
    return <LandingScreen onGetStarted={() => setCurrentScreen('auth')} />;
  }

  // User is authenticated - show app content
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';

  const handleSignOut = async () => {
    await signOut();
    setCurrentScreen('landing');
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleMarathonSettingsComplete = (settings: MarathonSettingsType) => {
    setMarathonSettings(settings);
    setCurrentScreen('marathon');
  };

  // Show marathon settings page
  if (currentScreen === 'marathon-settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userName={userName}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <MarathonSettings
            onStart={handleMarathonSettingsComplete}
            onBack={() => setCurrentScreen('dashboard')}
          />
        </div>
      </div>
    );
  }

  // Show marathon with settings
  if (currentScreen === 'marathon') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userName={userName}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <Marathon 
            settings={marathonSettings}
            onBack={() => setCurrentScreen('dashboard')}
            onEndMarathon={() => setCurrentScreen('dashboard')}
          />
        </div>
      </div>
    );
  }

  // Show different screens based on current state
  if (currentScreen === 'quiz') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userName={userName}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <Quiz
            userName={userName}
            onBack={() => setCurrentScreen('dashboard')}
          />
        </div>
      </div>
    );
  }

  if (currentScreen === 'mocktest') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userName={userName}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <MockTest
            userName={userName}
            onBack={() => setCurrentScreen('dashboard')}
          />
        </div>
      </div>
    );
  }

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

  // Show main dashboard
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
          onMarathonSelect={() => setCurrentScreen('marathon-settings')}
          onMockTestSelect={() => setCurrentScreen('mocktest')}
          onQuizSelect={() => setCurrentScreen('quiz')}
        />
      </div>
    </div>
  );
};

export default Index;
