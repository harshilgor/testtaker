
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';

interface LeaderboardHeaderProps {
  onBack: () => void;
}

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center mb-6 md:mb-8">
      <Button
        onClick={onBack}
        variant="outline"
        className="flex items-center mr-4 border-slate-300"
        size="sm"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Leaderboard</h1>
    </div>
  );
};

export default LeaderboardHeader;
