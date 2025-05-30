
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, BarChart3, Trophy, Activity } from 'lucide-react';
import { Screen } from '@/pages/Index';

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
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-900">TestTaker</h1>
            <div className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              Blue Book Style
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant={currentScreen === 'dashboard' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('dashboard')} 
              className={`flex items-center space-x-2 ${
                currentScreen === 'dashboard' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            
            <Button 
              variant={currentScreen === 'performance-dashboard' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('performance-dashboard')} 
              className={`flex items-center space-x-2 ${
                currentScreen === 'performance-dashboard' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Performance</span>
            </Button>
            
            <Button 
              variant={currentScreen === 'leaderboard' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('leaderboard')} 
              className={`flex items-center space-x-2 ${
                currentScreen === 'leaderboard' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Button>

            {userName && (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                <span className="text-sm text-slate-600">Hello, {userName}</span>
                {onSignOut && (
                  <Button 
                    onClick={onSignOut} 
                    variant="outline" 
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
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
