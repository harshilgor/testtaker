import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Users, Award, Target, Clock } from 'lucide-react';

const LeaderboardRankingWidget: React.FC = () => {
  const rankingData = {
    currentRank: 15,
    totalUsers: 1247,
    percentile: 88.5,
    weeklyChange: 3,
    monthlyChange: 12,
    topCategory: 'Math',
    score: 1340,
    weeklyScore: 89,
    accuracy: 84.2
  };

  const getRankColor = (rank: number) => {
    if (rank <= 10) return 'text-yellow-600';
    if (rank <= 50) return 'text-blue-600';
    if (rank <= 100) return 'text-green-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return Trophy;
    if (rank <= 10) return Award;
    return TrendingUp;
  };

  const RankIcon = getRankIcon(rankingData.currentRank);

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Leaderboard Rank</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {/* Main Rank Display */}
        <div className="text-center py-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <RankIcon className={`h-6 w-6 ${getRankColor(rankingData.currentRank)}`} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            #{rankingData.currentRank}
          </div>
          <div className="text-xs text-gray-600">
            of {rankingData.totalUsers.toLocaleString()} users
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default LeaderboardRankingWidget;