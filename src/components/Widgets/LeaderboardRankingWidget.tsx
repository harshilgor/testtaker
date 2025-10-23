import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';

const LeaderboardRankingWidget: React.FC = () => {
  const rankingData = {
    currentRank: 15,
    totalUsers: 1247,
    percentile: 88.5,
    weeklyChange: 3,
    monthlyChange: 12,
    topCategory: 'Math',
    achievements: [
      { name: 'Speed Demon', earned: true },
      { name: 'Accuracy Master', earned: true },
      { name: 'Streak King', earned: false }
    ]
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
    <Card className="h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center mb-3">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-gray-900">This Week</span>
            </div>
            <span className="text-xs font-bold text-green-600">+{rankingData.weeklyChange}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-blue-500" />
              <span className="text-xs font-medium text-gray-900">Percentile</span>
            </div>
            <span className="text-xs font-bold text-blue-600">{rankingData.percentile}%</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Award className="h-3 w-3 text-purple-500" />
              <span className="text-xs font-medium text-gray-900">Top Category</span>
            </div>
            <span className="text-xs font-bold text-purple-600">{rankingData.topCategory}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardRankingWidget;
