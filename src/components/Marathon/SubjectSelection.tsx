
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MarathonSettings } from '../../types/marathon';

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
    { value: 'math', label: 'Math Only' },
    { value: 'english', label: 'English Only' },
    { value: 'both', label: 'Both Subjects' }
  ];

  return (
    <div>
      <Label className="text-base font-medium mb-3 block">Subject Focus</Label>
      <div className="grid grid-cols-3 gap-3">
        {subjects.map(option => (
          <Button 
            key={option.value} 
            variant={settings.subjects.includes(option.value as any) ? 'default' : 'outline'} 
            onClick={() => onSettingsChange({
              ...settings,
              subjects: [option.value as any]
            })} 
            className="w-full" 
            disabled={option.value === 'english' && englishQuestionCount === 0}
          >
            {option.label}
            {option.value === 'english' && englishQuestionCount === 0 && 
              <Badge variant="destructive" className="ml-2">No Questions</Badge>
            }
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelection;
