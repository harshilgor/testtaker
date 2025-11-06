import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Medal } from 'lucide-react';
import PointChangeIndicator from '../PointChangeIndicator';

interface UserScore {
  id: string;
  display_name: string;
  total_points: number;
  mock_test_count: number;
  quiz_count: number;
  marathon_questions_count: number;
}

interface LeaderboardEntryProps {
  user: UserScore;
  position: number;
  currentUserName: string;
}

const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({ user, position, currentUserName }) => {
  const [previousPoints, setPreviousPoints] = useState<number | undefined>(undefined);

  // Track point changes
  useEffect(() => {
    if (previousPoints !== undefined && user.total_points !== previousPoints) {
      // Points changed, update previous points after a delay
      const timer = setTimeout(() => {
        setPreviousPoints(user.total_points);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (previousPoints === undefined) {
      // Initial load
      setPreviousPoints(user.total_points);
    }
  }, [user.total_points, previousPoints]);

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

  const getPointsBadge = (points: number) => {
    if (points >= 1000) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (points >= 500) return "bg-blue-100 text-blue-700 border-blue-200";
    if (points >= 200) return "bg-green-100 text-green-700 border-green-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const isCurrentUser = user.display_name === currentUserName;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-sm ${
        isCurrentUser 
          ? 'border-blue-300 bg-blue-50' 
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <div className="flex items-center justify-center w-10 flex-shrink-0">
          {getRankIcon(position)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-base break-words">
            {user.display_name}
            {isCurrentUser && (
              <span className="ml-2 text-sm text-blue-600 font-medium">(You)</span>
            )}
          </p>
          <div className="flex gap-4 text-xs text-gray-600 mt-1">
            <span className="whitespace-nowrap">{user.mock_test_count} tests</span>
            <span className="whitespace-nowrap">{user.quiz_count} quizzes</span>
            <span className="whitespace-nowrap">{user.marathon_questions_count} marathon questions</span>
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${getPointsBadge(user.total_points)}`}>
          <PointChangeIndicator 
            points={user.total_points} 
            previousPoints={previousPoints}
            className="text-inherit"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">points</p>
      </div>
    </div>
  );
};

export default LeaderboardEntry;
