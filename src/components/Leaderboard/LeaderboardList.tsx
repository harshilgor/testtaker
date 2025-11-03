import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import LeaderboardEntry from './LeaderboardEntry';

interface UserScore {
  id: string;
  user_id: string;
  display_name: string;
  total_points: number;
  mock_test_count: number;
  quiz_count: number;
  marathon_questions_count: number;
}

interface LeaderboardListProps {
  leaderboard: UserScore[];
  currentUserName: string;
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({ leaderboard, currentUserName }) => {
  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-600" />
          <span>Top Performers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {leaderboard.length === 0 ? (
          <p className="text-gray-600 text-center py-8 text-sm">
            No leaderboard data available yet. Complete some activities to see rankings!
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <LeaderboardEntry
                key={user.id}
                user={user}
                position={index + 1}
                currentUserName={currentUserName}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardList;
