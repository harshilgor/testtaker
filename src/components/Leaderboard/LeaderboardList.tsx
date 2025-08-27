
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
    <Card className="border-slate-200">
      <CardHeader className="pb-3 md:pb-4 bg-slate-50 border-b border-slate-200">
        <CardTitle className="flex items-center space-x-2 text-lg md:text-xl text-slate-900">
          <Trophy className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          <span>Top Performers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        {leaderboard.length === 0 ? (
          <p className="text-slate-600 text-center py-8 text-sm md:text-base">
            No leaderboard data available yet. Complete some activities to see rankings!
          </p>
        ) : (
          <div className="space-y-3 md:space-y-4">
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
