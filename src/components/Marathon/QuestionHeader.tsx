
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, Clock, Target } from 'lucide-react';

interface QuestionHeaderProps {
  questionNumber: number;
  section: string;
  difficulty: string;
  skill: string;
  questionsAttempted: number;
  totalQuestions: number;
  timeSpent: number;
  isFlagged: boolean;
  onFlag: () => void;
  answered: boolean;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  questionNumber,
  section,
  difficulty,
  skill,
  questionsAttempted,
  totalQuestions,
  timeSpent,
  isFlagged,
  onFlag,
  answered
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="text-sm">
          Question {questionNumber}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {section}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {difficulty}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {skill}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">
            {questionsAttempted} / {totalQuestions} solved
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatTime(timeSpent)}</span>
        </div>
        <Button
          variant={isFlagged ? "default" : "outline"}
          size="sm"
          onClick={onFlag}
          disabled={answered}
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionHeader;
