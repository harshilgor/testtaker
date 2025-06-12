
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarathonSettings } from '../../types/marathon';

interface SettingsTogglesProps {
  settings: MarathonSettings;
  onSettingsChange: (settings: MarathonSettings) => void;
}

const SettingsToggles: React.FC<SettingsTogglesProps> = ({
  settings,
  onSettingsChange
}) => {
  return (
    <>
      {/* Timed Mode */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Timed Mode</Label>
            <p className="text-sm text-gray-600">Set a time goal for your session</p>
          </div>
          <Switch 
            checked={settings.timedMode} 
            onCheckedChange={checked => onSettingsChange({
              ...settings,
              timedMode: checked
            })} 
          />
        </div>
        
        {settings.timedMode && (
          <div className="ml-4">
            <Label htmlFor="timeGoal" className="text-sm">Time Goal (minutes)</Label>
            <Input 
              id="timeGoal" 
              type="number" 
              min="5" 
              max="180" 
              value={settings.timeGoalMinutes} 
              onChange={e => onSettingsChange({
                ...settings,
                timeGoalMinutes: parseInt(e.target.value)
              })} 
              className="w-24 mt-1" 
            />
          </div>
        )}
      </div>

      {/* Calculator */}
      {(settings.subjects.includes('math') || settings.subjects.includes('both')) && (
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Calculator</Label>
            <p className="text-sm text-gray-600">Enable or disable the in-app calculator</p>
          </div>
          <Switch 
            checked={settings.calculatorEnabled} 
            onCheckedChange={checked => onSettingsChange({
              ...settings,
              calculatorEnabled: checked
            })} 
          />
        </div>
      )}
    </>
  );
};

export default SettingsToggles;
