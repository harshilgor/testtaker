
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Trophy, Medal } from 'lucide-react';

interface UserRankCardProps {
  rank: number;
  points: number;
}

const UserRankCard: React.FC<UserRankCardProps> = ({ rank, points }) => {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />;
      case 3:
        return <Medal className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />;
      default:
        return <span className="text-sm md:text-lg font-bold text-slate-600 min-w-[2rem] text-center">#{position}</span>;
    }
  };

  return (
    <Card className="mb-4 md:mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            {getRankIcon(rank)}
            <div>
              <p className="font-semibold text-blue-900 text-sm md:text-base">Your Rank: #{rank}</p>
              <p className="text-xs md:text-sm text-blue-700">
                {points} points
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRankCard;
