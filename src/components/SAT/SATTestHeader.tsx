
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface SATTestHeaderProps {
  section: 'reading-writing' | 'math';
  module: 1 | 2;
  timeRemaining: number;
  eliminateMode: boolean;
  onEliminateModeChange: (enabled: boolean) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

const SATTestHeader: React.FC<SATTestHeaderProps> = ({
  section,
  module,
  timeRemaining,
  eliminateMode,
  onEliminateModeChange,
  onBack,
  isMobile
}) => {
  const { isMobile: responsiveIsMobile } = useResponsiveLayout();
  const mobile = isMobile ?? responsiveIsMobile;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSectionDisplayName = () => {
    return section === 'reading-writing' ? 'Reading and Writing' : 'Math';
  };

  return (
    <div className="bg-slate-800 text-white px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="bg-green-600 rounded px-3 py-1 text-sm font-medium">
          SAT
        </div>
        <span className="text-sm font-medium">
          {mobile ? getSectionDisplayName() : `${getSectionDisplayName()} - Module ${module}`}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-base font-mono">
          {formatTime(timeRemaining)}
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="hidden sm:inline">Eliminate</span>
          <Switch
            checked={eliminateMode}
            onCheckedChange={onEliminateModeChange}
            className="data-[state=checked]:bg-blue-600 scale-75 md:scale-100"
          />
        </div>
        
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800 text-xs px-3 py-1 min-h-[44px]"
          >
            Exit
          </Button>
        )}
      </div>
    </div>
  );
};

export default SATTestHeader;
