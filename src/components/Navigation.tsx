
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, BarChart3, Trophy, Activity } from 'lucide-react';

type Screen = 'landing' | 'auth' | 'dashboard' | 'marathon' | 'quiz' | 'mocktest' | 'leaderboard' | 'performance-dashboard';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  userName?: string;
  onSignOut?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  userName,
  onSignOut
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">TestTaker</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant={currentScreen === 'dashboard' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('dashboard')} 
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            
            <Button 
              variant={currentScreen === 'performance-dashboard' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('performance-dashboard')} 
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            
            <Button 
              variant={currentScreen === 'leaderboard' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('leaderboard')} 
              className="flex items-center space-x-2"
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Button>

            {userName && (
              <div className="flex items-center space-x-3 border-l pl-4">
                <span className="text-sm text-gray-600">Hello, {userName}</span>
                {onSignOut && (
                  <Button onClick={onSignOut} variant="outline" size="sm">
                    Sign Out
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
