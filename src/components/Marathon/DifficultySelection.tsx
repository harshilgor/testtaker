
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MarathonSettings } from '../../types/marathon';

interface DifficultySelectionProps {
  settings: MarathonSettings;
  onSettingsChange: (settings: MarathonSettings) => void;
}

const DifficultySelection: React.FC<DifficultySelectionProps> = ({
  settings,
  onSettingsChange
}) => {
  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'mixed', label: 'Mixed' }
  ];

  return (
    <div>
      <Label className="text-base font-medium mb-3 block">Difficulty Level</Label>
      <div className="grid grid-cols-4 gap-3">
        {difficulties.map(option => (
          <Button 
            key={option.value} 
            variant={settings.difficulty === option.value ? 'default' : 'outline'} 
            onClick={() => onSettingsChange({
              ...settings,
              difficulty: option.value as any
            })} 
            className="w-full"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelection;
