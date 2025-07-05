
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarathonSettings } from '../types/marathon';
import QuestionStatsCard from './Marathon/QuestionStatsCard';
import CurrentSelectionCard from './Marathon/CurrentSelectionCard';
import SubjectSelection from './Marathon/SubjectSelection';
import DifficultySelection from './Marathon/DifficultySelection';
import SettingsToggles from './Marathon/SettingsToggles';
import { useMarathonQuestionStats } from './Marathon/useMarathonQuestionStats';

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
    timedMode: false,
    timeGoalMinutes: 30,
    calculatorEnabled: true,
    darkMode: false,
    fontSize: 'medium'
  });

  const { questionStats, userProgress, loading } = useMarathonQuestionStats();

  const getAvailableQuestions = () => {
    if (settings.subjects.includes('both')) {
      if (settings.difficulty === 'mixed') {
        return questionStats.total;
      } else {
        return questionStats.math[settings.difficulty as keyof typeof questionStats.math] + 
               questionStats.english[settings.difficulty as keyof typeof questionStats.english];
      }
    } else if (settings.subjects.includes('math')) {
      if (settings.difficulty === 'mixed') {
        return questionStats.math.total;
      } else {
        return questionStats.math[settings.difficulty as keyof typeof questionStats.math];
      }
    } else if (settings.subjects.includes('english')) {
      if (settings.difficulty === 'mixed') {
        return questionStats.english.total;
      } else {
        return questionStats.english[settings.difficulty as keyof typeof questionStats.english];
      }
    }
    return 0;
  };

  const handleStart = () => {
    onStart(settings);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-xl p-6 md:p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
              Marathon Mode Settings
            </h1>
            <p className="text-gray-600 text-center text-sm md:text-base">
              Customize your practice session
            </p>
          </div>

          <div className="space-y-6">
            <QuestionStatsCard 
              questionStats={questionStats} 
              userProgress={userProgress} 
            />

            <CurrentSelectionCard 
              availableQuestions={getAvailableQuestions()} 
            />

            <div className="space-y-6">
              <SubjectSelection 
                settings={settings}
                onSettingsChange={setSettings}
                englishQuestionCount={questionStats.english.total}
              />

              <DifficultySelection 
                settings={settings}
                onSettingsChange={setSettings}
              />

              <SettingsToggles 
                settings={settings}
                onSettingsChange={setSettings}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 rounded-xl min-h-[44px]"
            >
              Back to Dashboard
            </Button>
            <Button 
              onClick={handleStart} 
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl min-h-[44px]" 
              disabled={getAvailableQuestions() === 0}
            >
              Start Marathon ({getAvailableQuestions()} questions)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarathonSettingsComponent;
