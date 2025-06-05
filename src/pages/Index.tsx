
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
export type Screen = 'landing' | 'auth' | 'dashboard' | 'marathon-settings' | 'marathon' | 'quiz' | 'mocktest' | 'leaderboard' | 'performance-dashboard';

const Index = () => {
  const { user, session, loading, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [marathonSettings, setMarathonSettings] = useState<MarathonSettingsType | null>(null);

  console.log('Index: Auth state', { 
    user: !!user, 
    session: !!session, 
    loading, 
    currentScreen,
    userEmail: user?.email 
  });

  // Show loading spinner while checking auth state
  if (loading) {
    console.log('Index: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, show landing or auth page
  if (!user || !session) {
    console.log('Index: User not authenticated, showing landing/auth');
    if (currentScreen === 'auth') {
      return <AuthPage />;
    }
    return <LandingScreen onGetStarted={() => setCurrentScreen('auth')} />;
  }

  // User is authenticated - show app content
  console.log('Index: User authenticated, showing app content');
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';

  const handleSignOut = async () => {
    console.log('Index: Signing out user');
    await signOut();
    setCurrentScreen('landing');
  };

  const handleNavigate = (screen: Screen) => {
    console.log('Index: Navigating to screen:', screen);
    setCurrentScreen(screen);
  };

  const handleMarathonSettingsComplete = (settings: MarathonSettingsType) => {
    console.log('Index: Marathon settings completed:', settings);
    setMarathonSettings(settings);
    setCurrentScreen('marathon');
  };

  // Show marathon settings page
  if (currentScreen === 'marathon-settings') {
    console.log('Index: Showing marathon settings');
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
    console.log('Index: Showing marathon');
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
    console.log('Index: Showing quiz');
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
    console.log('Index: Showing mock test');
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
    console.log('Index: Showing leaderboard');
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
    console.log('Index: Showing performance dashboard');
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
  console.log('Index: Showing main dashboard');
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
