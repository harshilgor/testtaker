
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingScreen from '@/components/LandingScreen';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import Leaderboard from '@/components/Leaderboard';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import TrendsPage from '@/components/TrendsPage';
import LearnPage from '@/pages/Learn';
import Navigation from '@/components/Navigation';
import StreakPopup from '@/components/StreakPopup';
import LoadingSpinner from '@/components/LoadingSpinner';

export type Screen = 'landing' | 'auth' | 'dashboard' | 'learn' | 'leaderboard' | 'performance-dashboard' | 'trends';

const Index = () => {
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  
  console.log('Index component rendering - loading:', loading, 'user:', !!user, 'session:', !!session, 'currentScreen:', currentScreen);

  // Add error handling for auth loading
  useEffect(() => {
    if (loading) {
      console.log('Auth loading...');
    }
  }, [loading]);

  // Temporary bypass for debugging - remove this after testing
  if (window.location.search.includes('bypass=true')) {
    console.log('Bypassing auth for debugging');
    return <LandingScreen onGetStarted={() => setCurrentScreen('auth')} />;
  }

  if (loading) {
    console.log('App is in loading state, showing spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading your account..." />
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

  const handleNavigateToPerformance = () => {
    setCurrentScreen('performance-dashboard');
  };

  const handleNavigateToTrends = () => {
    setCurrentScreen('trends');
  };


  if (currentScreen === 'learn') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userName={userName}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <LearnPage
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
            onNavigateToTrends={handleNavigateToTrends}
          />
        </div>
      </div>
    );
  }

  if (currentScreen === 'trends') {
    return (
      <TrendsPage 
        userName={userName}
        onBack={() => setCurrentScreen('performance-dashboard')} 
      />
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
      
      {/* Streak Popup - only shows on dashboard */}
      {currentScreen === 'dashboard' && (
        <StreakPopup 
          userName={userName} 
          onNavigateToPerformance={handleNavigateToPerformance}
        />
      )}
    </div>
  );
};

export default Index;
