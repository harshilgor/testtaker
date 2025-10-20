import React from 'react';
import { Crown, Trophy, Medal } from 'lucide-react';

interface UserScore {
  id: string;
  user_id: string;
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

  const getPointsBadge = (points: number) => {
    if (points >= 1000) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (points >= 500) return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
    if (points >= 200) return "bg-gradient-to-r from-green-500 to-green-600 text-white";
    return "bg-slate-100 text-slate-800";
  };

  const isCurrentUser = user.display_name === currentUserName;

  return (
    <div
      className={`flex items-center justify-between p-3 md:p-4 rounded-lg border transition-all hover:shadow-sm ${
        isCurrentUser 
          ? 'border-blue-300 bg-blue-50' 
          : position < 3
          ? 'border-slate-300 bg-slate-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
        <div className="flex items-center justify-center w-10 md:w-12 flex-shrink-0">
          {getRankIcon(position)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 text-sm md:text-base break-words">
            {user.display_name}
            {isCurrentUser && (
              <span className="ml-2 text-xs md:text-sm text-blue-600">(You)</span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-xs md:text-sm text-slate-600 mt-1">
            <span className="whitespace-nowrap">{user.mock_test_count} tests</span>
            <span className="whitespace-nowrap">{user.quiz_count} quizzes</span>
            <span className="whitespace-nowrap">{user.marathon_questions_count} marathon questions</span>
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getPointsBadge(user.total_points)}`}>
          {user.total_points}
        </div>
        <p className="text-xs md:text-sm text-slate-600 mt-1">points</p>
      </div>
    </div>
  );
};

export default LeaderboardEntry;
