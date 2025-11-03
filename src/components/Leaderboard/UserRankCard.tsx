
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
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-700 min-w-[2rem] text-center">#{position}</span>;
    }
  };

  return (
    <Card className="mb-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getRankIcon(rank)}
            <div>
              <p className="font-semibold text-gray-900 text-base">Your Rank: #{rank}</p>
              <p className="text-sm text-gray-600 mt-0.5">
                {points.toLocaleString()} points
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRankCard;