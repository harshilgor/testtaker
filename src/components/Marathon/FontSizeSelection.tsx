
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MarathonSettings } from '../../types/marathon';

interface FontSizeSelectionProps {
  settings: MarathonSettings;
  onSettingsChange: (settings: MarathonSettings) => void;
}

const FontSizeSelection: React.FC<FontSizeSelectionProps> = ({
  settings,
  onSettingsChange
}) => {
  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  return (
    <div>
      <Label className="text-base font-medium mb-3 block">Font Size</Label>
      <div className="grid grid-cols-3 gap-3">
        {fontSizes.map(option => (
          <Button 
            key={option.value} 
            variant={settings.fontSize === option.value ? 'default' : 'outline'} 
            onClick={() => onSettingsChange({
              ...settings,
              fontSize: option.value as any
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

export default FontSizeSelection;
