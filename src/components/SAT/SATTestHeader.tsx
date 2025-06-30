
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface SATTestHeaderProps {
  section: 'reading-writing' | 'math';
  module: 1 | 2;
  timeRemaining: number;
  eliminateMode: boolean;
  onEliminateModeChange: (enabled: boolean) => void;
}

const SATTestHeader: React.FC<SATTestHeaderProps> = ({
  section,
  module,
  timeRemaining,
  eliminateMode,
  onEliminateModeChange
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-600 rounded px-3 py-1 text-sm font-medium">
          SAT
        </div>
        <span className="text-sm">
          Section {section === 'reading-writing' ? '1' : '2'}, Module {module}: {section === 'reading-writing' ? 'Reading and Writing' : 'Math'}
        </span>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-lg font-mono">
          <span>{formatTime(timeRemaining)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <span>Eliminate Answers</span>
          <Switch
            checked={eliminateMode}
            onCheckedChange={onEliminateModeChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default SATTestHeader;
