
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, BarChart3, Trophy, Activity, Menu, X } from 'lucide-react';
import { Screen } from '@/pages/Index';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  userName?: string;
  onSignOut?: () => void;
  hidden?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  userName,
  onSignOut,
  hidden = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  if (hidden) {
    return null;
  }

  const navigationItems = [
    { screen: 'dashboard' as Screen, icon: Home, label: 'Home' },
    { screen: 'performance-dashboard' as Screen, icon: Activity, label: 'Performance' },
    { screen: 'leaderboard' as Screen, icon: Trophy, label: 'Leaderboard' }
  ];

  const NavButton = ({ screen, icon: Icon, label }: { screen: Screen; icon: any; label: string }) => (
    <Button 
      variant={currentScreen === screen ? 'default' : 'ghost'} 
      onClick={() => {
        onNavigate(screen);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-3 py-2 min-h-[44px] ${
        currentScreen === screen 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
      }`}
      size="sm"
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </Button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">get1600</h1>
          </div>
          
          {isMobile ? (
            // Mobile menu
            <div className="flex items-center space-x-3">
              {userName && (
                <span className="text-sm text-slate-600 truncate max-w-24">
                  {userName.split(' ')[0]}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 min-h-[44px] min-w-[44px]"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          ) : (
            // Desktop menu
            <div className="flex items-center space-x-2">
              {navigationItems.map(({ screen, icon, label }) => (
                <NavButton key={screen} screen={screen} icon={icon} label={label} />
              ))}

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
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && mobileMenuOpen && (
          <div className="pb-4 border-t border-slate-200 bg-white">
            <div className="flex flex-col space-y-2 mt-4">
              {navigationItems.map(({ screen, icon, label }) => (
                <NavButton key={screen} screen={screen} icon={icon} label={label} />
              ))}
              
              {userName && onSignOut && (
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <Button 
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline" 
                    size="sm" 
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 min-h-[44px]"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
