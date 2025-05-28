
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import LandingScreen from '@/components/LandingScreen';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import Marathon from '@/components/Marathon';
import Quiz from '@/components/Quiz';
import MockTest from '@/components/MockTest';

export type Subject = 'math' | 'english' | 'both';

const Index = () => {
  const { user, session, loading, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'auth' | 'dashboard' | 'marathon' | 'quiz' | 'mocktest'>('landing');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

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

  if (currentScreen === 'marathon') {
    return (
      <Marathon
        userName={userName}
        selectedSubject={selectedSubject}
        onSubjectSelect={setSelectedSubject}
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  if (currentScreen === 'quiz') {
    return (
      <Quiz
        userName={userName}
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  if (currentScreen === 'mocktest') {
    return (
      <MockTest
        userName={userName}
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // Show dashboard with user menu
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome back, {userName}!
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <Dashboard
        userName={userName}
        onMarathonSelect={() => setCurrentScreen('marathon')}
        onMockTestSelect={() => setCurrentScreen('mocktest')}
        onQuizSelect={() => setCurrentScreen('quiz')}
      />
    </div>
  );
};

export default Index;
