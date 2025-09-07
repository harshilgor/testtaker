
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarathonSettings } from '../../types/marathon';
import { Clock, Calculator, Brain } from 'lucide-react';

interface SettingsTogglesProps {
  settings: MarathonSettings;
  onSettingsChange: (settings: MarathonSettings) => void;
}

const SettingsToggles: React.FC<SettingsTogglesProps> = ({
  settings,
  onSettingsChange
}) => {
  return (
    <div className="space-y-6">
      {/* Adaptive Learning */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <Label className="text-base font-semibold text-gray-900">Adaptive Learning</Label>
              <p className="text-sm text-gray-600">Identifies your weak areas and provides targeted practice to strengthen those skills</p>
            </div>
          </div>
          <Switch 
            checked={settings.adaptiveLearning} 
            onCheckedChange={checked => onSettingsChange({
              ...settings,
              adaptiveLearning: checked,
              // Reset difficulty to mixed when adaptive learning is enabled
              difficulty: checked ? 'mixed' : settings.difficulty
            })} 
          />
        </div>
        
        {settings.adaptiveLearning && (
          <div className="ml-12 p-4 bg-white rounded-lg border border-purple-200">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Weakness Detection</p>
                  <p className="text-xs text-gray-600">Analyzes your performance to identify specific skills that need improvement</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Targeted Practice</p>
                  <p className="text-xs text-gray-600">Provides more questions on challenging topics to reinforce learning</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Skill Reinforcement</p>
                  <p className="text-xs text-gray-600">Continuously adapts to help you master difficult concepts through repetition</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timed Mode */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <Label className="text-base font-semibold text-gray-900">Timed Mode</Label>
              <p className="text-sm text-gray-600">Set a time goal for your session</p>
            </div>
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
          <div className="ml-12 p-4 bg-white rounded-lg border border-orange-200">
            <Label htmlFor="timeGoal" className="text-sm font-medium text-gray-700 mb-2 block">
              Time Goal (minutes)
            </Label>
            <div className="flex items-center gap-3">
              <Input 
                id="timeGoal" 
                type="number" 
                min="5" 
                max="180" 
                value={settings.timeGoalMinutes} 
                onChange={e => onSettingsChange({
                  ...settings,
                  timeGoalMinutes: parseInt(e.target.value) || 30
                })} 
                className="w-24" 
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>
        )}
      </div>

      {/* Calculator */}
      {(settings.subjects.includes('math') || settings.subjects.includes('both')) && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label className="text-base font-semibold text-gray-900">Calculator</Label>
                <p className="text-sm text-gray-600">Enable or disable the in-app calculator</p>
              </div>
            </div>
            <Switch 
              checked={settings.calculatorEnabled} 
              onCheckedChange={checked => onSettingsChange({
                ...settings,
                calculatorEnabled: checked
              })} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsToggles;
