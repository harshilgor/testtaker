
import React from 'react';
import { Trophy } from 'lucide-react';

interface LeaderboardHeaderProps {
  onBack: () => void;
}

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Leaderboard</h1>
    </div>
  );
};

export default LeaderboardHeader;
