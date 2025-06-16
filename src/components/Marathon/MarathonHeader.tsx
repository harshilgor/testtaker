
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Trophy } from 'lucide-react';

interface MarathonHeaderProps {
  sessionStats: { used: number; total: number };
  totalPoints: number;
  sessionPoints: number;
  currentQuestionPoints: number;
  onEndMarathon: () => void;
}

const MarathonHeader: React.FC<MarathonHeaderProps> = ({
  sessionStats,
  totalPoints,
  sessionPoints,
  currentQuestionPoints,
  onEndMarathon
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Marathon Mode</h1>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-slate-600">
            Questions attempted: {sessionStats.used}
          </p>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
            <Trophy className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {totalPoints} pts (+{currentQuestionPoints} this question)
            </span>
          </div>
        </div>
      </div>
      <Button
        onClick={onEndMarathon}
        variant="destructive"
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        End Marathon
      </Button>
    </div>
  );
};

export default MarathonHeader;
