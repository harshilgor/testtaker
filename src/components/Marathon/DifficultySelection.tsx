
import React from 'react';
import { Button } from '@/components/ui/button';
import { MarathonSettings } from '../../types/marathon';
import { TrendingUp, Target, Zap, Shuffle } from 'lucide-react';

interface DifficultySelectionProps {
  settings: MarathonSettings;
  onSettingsChange: (settings: MarathonSettings) => void;
}

const DifficultySelection: React.FC<DifficultySelectionProps> = ({
  settings,
  onSettingsChange
}) => {
  const difficulties = [
    { 
      value: 'easy', 
      label: 'Easy', 
      icon: TrendingUp,
      color: 'green'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      icon: Target,
      color: 'yellow'
    },
    { 
      value: 'hard', 
      label: 'Hard', 
      icon: Zap,
      color: 'red'
    },
    { 
      value: 'mixed', 
      label: 'Mixed', 
      icon: Shuffle,
      color: 'blue'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = "w-full p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md h-full";
    const colorMap = {
      green: isSelected 
        ? "border-green-500 bg-green-50 text-green-700" 
        : "border-gray-200 bg-white hover:border-green-300 text-gray-700",
      yellow: isSelected 
        ? "border-yellow-500 bg-yellow-50 text-yellow-700" 
        : "border-gray-200 bg-white hover:border-yellow-300 text-gray-700",
      red: isSelected 
        ? "border-red-500 bg-red-50 text-red-700" 
        : "border-gray-200 bg-white hover:border-red-300 text-gray-700",
      blue: isSelected 
        ? "border-blue-500 bg-blue-50 text-blue-700" 
        : "border-gray-200 bg-white hover:border-blue-300 text-gray-700"
    };
    return `${baseClasses} ${colorMap[color as keyof typeof colorMap]}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {difficulties.map(option => {
          const Icon = option.icon;
          const isSelected = settings.difficulty === option.value;
          
          return (
            <Button 
              key={option.value} 
              variant="ghost" 
              onClick={() => onSettingsChange({
                ...settings,
                difficulty: option.value as any
              })} 
              className={getColorClasses(option.color, isSelected)}
            >
              <div className="flex flex-col items-center gap-2 w-full min-h-[60px] justify-center">
                <div className={`p-2 rounded-md ${isSelected ? 'bg-white/80' : 'bg-gray-50'}`}>
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-current' : 'text-gray-500'}`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">{option.label}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default DifficultySelection;
