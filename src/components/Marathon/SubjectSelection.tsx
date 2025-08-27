
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarathonSettings } from '../../types/marathon';
import { Calculator, BookOpen, Layers } from 'lucide-react';

interface SubjectSelectionProps {
  settings: MarathonSettings;
  onSettingsChange: (settings: MarathonSettings) => void;
  englishQuestionCount: number;
}

const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  settings,
  onSettingsChange,
  englishQuestionCount
}) => {
  const subjects = [
    { 
      value: 'math', 
      label: 'Math Only', 
      icon: Calculator,
      color: 'blue'
    },
    { 
      value: 'english', 
      label: 'English Only', 
      icon: BookOpen,
      color: 'purple'
    },
    { 
      value: 'both', 
      label: 'Both Subjects', 
      icon: Layers,
      color: 'green'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = "w-full p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md h-full";
    const colorMap = {
      blue: isSelected 
        ? "border-blue-500 bg-blue-50 text-blue-700" 
        : "border-gray-200 bg-white hover:border-blue-300 text-gray-700",
      purple: isSelected 
        ? "border-purple-500 bg-purple-50 text-purple-700" 
        : "border-gray-200 bg-white hover:border-purple-300 text-gray-700",
      green: isSelected 
        ? "border-green-500 bg-green-50 text-green-700" 
        : "border-gray-200 bg-white hover:border-green-300 text-gray-700"
    };
    return `${baseClasses} ${colorMap[color as keyof typeof colorMap]}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {subjects.map(option => {
          const Icon = option.icon;
          const isSelected = settings.subjects.includes(option.value as any);
          const isDisabled = option.value === 'english' && englishQuestionCount === 0;
          
          return (
            <Button 
              key={option.value} 
              variant="ghost" 
              onClick={() => onSettingsChange({
                ...settings,
                subjects: [option.value as any]
              })} 
              disabled={isDisabled}
              className={`${getColorClasses(option.color, isSelected)} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2 w-full min-h-[60px] justify-center">
                <div className={`p-2 rounded-md ${isSelected ? 'bg-white/80' : 'bg-gray-50'}`}>
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-current' : 'text-gray-500'}`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">{option.label}</div>
                </div>
                {isDisabled && (
                  <Badge variant="destructive" className="text-xs mt-1">
                    No Questions
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectSelection;
