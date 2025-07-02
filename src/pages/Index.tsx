import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingScreen from '@/components/LandingScreen';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import Leaderboard from '@/components/Leaderboard';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import Navigation from '@/components/Navigation';

export type Subject = 'math' | 'english' | 'both';
export type Screen = 'landing' | 'auth' | 'dashboard' | 'leaderboard' | 'performance-dashboard';

const Index = () => {
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');

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

  const handleMarathonSelect = () => {
    console.log('Index: Navigating to marathon');
    navigate('/marathon');
  };

  const handleQuizSelect = () => {
    console.log('Index: Navigating to quiz');
    navigate('/quiz');
  };

  // Show different screens based on current state
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
          onMarathonSelect={handleMarathonSelect}
          onMockTestSelect={() => {}} // Keep existing mock test functionality
          onQuizSelect={handleQuizSelect}
        />
      </div>
    </div>
  );
};

export default Index;
