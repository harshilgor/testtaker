
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, BarChart3 } from 'lucide-react';

type Screen = 'dashboard' | 'stats';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">TestTaker</h1>
          </div>
          
          <div className="flex space-x-4">
            <Button 
              variant={currentScreen === 'dashboard' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('dashboard')} 
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            
            <Button 
              variant={currentScreen === 'stats' ? 'default' : 'ghost'} 
              onClick={() => onNavigate('stats')} 
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
