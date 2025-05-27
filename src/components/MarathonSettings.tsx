import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarathonSettings } from '../types/marathon';
interface MarathonSettingsProps {
  onStart: (settings: MarathonSettings) => void;
  onBack: () => void;
}
const MarathonSettingsComponent: React.FC<MarathonSettingsProps> = ({
  onStart,
  onBack
}) => {
  const [settings, setSettings] = useState<MarathonSettings>({
    subjects: ['both'],
    difficulty: 'mixed',
    adaptiveLearning: true,
    timedMode: false,
    timeGoalMinutes: 30,
    calculatorEnabled: true,
    darkMode: false,
    fontSize: 'medium'
  });
  const handleStart = () => {
    onStart(settings);
  };
  return <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="max-w-2xl w-full p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marathon Mode Settings</h1>
          <p className="text-gray-600">Customize your practice session</p>
        </div>

        <div className="space-y-6">
          {/* Subject Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Subject Focus</Label>
            <div className="grid grid-cols-3 gap-3">
              {[{
              value: 'math',
              label: 'Math Only'
            }, {
              value: 'english',
              label: 'English Only'
            }, {
              value: 'both',
              label: 'Both Subjects'
            }].map(option => <Button key={option.value} variant={settings.subjects.includes(option.value as any) ? 'default' : 'outline'} onClick={() => setSettings(prev => ({
              ...prev,
              subjects: [option.value as any]
            }))} className="w-full">
                  {option.label}
                </Button>)}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <Label className="text-base font-medium mb-3 block">Difficulty Level</Label>
            <div className="grid grid-cols-4 gap-3">
              {[{
              value: 'easy',
              label: 'Easy'
            }, {
              value: 'medium',
              label: 'Medium'
            }, {
              value: 'hard',
              label: 'Hard'
            }, {
              value: 'mixed',
              label: 'Mixed'
            }].map(option => <Button key={option.value} variant={settings.difficulty === option.value ? 'default' : 'outline'} onClick={() => setSettings(prev => ({
              ...prev,
              difficulty: option.value as any
            }))} className="w-full">
                  {option.label}
                </Button>)}
            </div>
          </div>

          {/* Adaptive Learning */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <Label className="font-medium">Adaptive Learning</Label>
              <p className="text-sm text-gray-600">Focus on your weak topics automatically</p>
            </div>
            <Switch checked={settings.adaptiveLearning} onCheckedChange={checked => setSettings(prev => ({
            ...prev,
            adaptiveLearning: checked
          }))} />
          </div>

          {/* Timed Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Timed Mode</Label>
                <p className="text-sm text-gray-600">Set a time goal for your session</p>
              </div>
              <Switch checked={settings.timedMode} onCheckedChange={checked => setSettings(prev => ({
              ...prev,
              timedMode: checked
            }))} />
            </div>
            
            {settings.timedMode && <div className="ml-4">
                <Label htmlFor="timeGoal" className="text-sm">Time Goal (minutes)</Label>
                <Input id="timeGoal" type="number" min="5" max="180" value={settings.timeGoalMinutes} onChange={e => setSettings(prev => ({
              ...prev,
              timeGoalMinutes: parseInt(e.target.value)
            }))} className="w-24 mt-1" />
              </div>}
          </div>

          {/* Calculator */}
          {(settings.subjects.includes('math') || settings.subjects.includes('both')) && <div className="flex items-center justify-between">
              
              
            </div>}

          {/* Font Size */}
          
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
          <Button onClick={handleStart} className="bg-orange-600 hover:bg-orange-700">
            Start Marathon
          </Button>
        </div>
      </Card>
    </div>;
};
export default MarathonSettingsComponent;