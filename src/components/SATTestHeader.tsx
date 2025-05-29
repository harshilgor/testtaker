
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Calculator, Eye } from 'lucide-react';

interface SATTestHeaderProps {
  onBack: () => void;
  section: 'reading-writing' | 'math';
  module: 1 | 2;
  timeRemaining: number;
  questionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  showNavigator: boolean;
  onToggleNavigator: () => void;
}

const SATTestHeader: React.FC<SATTestHeaderProps> = ({
  onBack,
  section,
  module,
  timeRemaining,
  questionIndex,
  totalQuestions,
  answeredCount,
  flaggedCount,
  showNavigator,
  onToggleNavigator
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Test
          </Button>
          <div className="text-sm text-gray-600">
            {section === 'reading-writing' ? 'Reading and Writing' : 'Math'} - Module {module}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          {section === 'math' && (
            <Calculator className="h-5 w-5 text-gray-500" />
          )}
          
          <Button
            onClick={onToggleNavigator}
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Navigator
          </Button>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Question {questionIndex + 1} of {totalQuestions}</span>
          <span>{answeredCount} answered, {flaggedCount} flagged</span>
        </div>
      </div>
    </div>
  );
};

export default SATTestHeader;
