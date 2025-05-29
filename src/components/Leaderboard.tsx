
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  userName: string;
  onBack: () => void;
}

interface UserScore {
  userName: string;
  totalPoints: number;
  mockTests: number;
  quizzes: number;
  marathonQuestions: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userName, onBack }) => {
  const [leaderboard, setLeaderboard] = useState<UserScore[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    calculateLeaderboard();
  }, []);

  const calculatePoints = (quizResults: any[], mockResults: any[], marathonSessions: any[]) => {
    let totalPoints = 0;
    
    // Points from quizzes (assuming medium difficulty for now)
    quizResults.forEach(quiz => {
      totalPoints += quiz.correct_answers * 6;
    });
    
    // Points from mock tests (assuming medium difficulty for now)
    mockResults.forEach(mock => {
      const totalCorrect = (mock.math_score || 0) + (mock.english_score || 0);
      totalPoints += totalCorrect * 6;
    });
    
    // Points from marathon mode (assuming medium difficulty for now)
    marathonSessions.forEach(session => {
      totalPoints += (session.correct_answers || 0) * 6;
    });
    
    return totalPoints;
  };

  const calculateLeaderboard = () => {
    const allUsers = new Set<string>();
    const userStats: { [key: string]: UserScore } = {};

    // Get all stored results from localStorage
    const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const mockResults = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
    const satResults = JSON.parse(localStorage.getItem('satTestResults') || '[]');
    const marathonSessions = JSON.parse(localStorage.getItem('marathonSessions') || '[]');

    // Collect all unique usernames
    [...quizResults, ...mockResults, ...satResults, ...marathonSessions].forEach(result => {
      if (result.userName) {
        allUsers.add(result.userName);
      }
    });

    // Calculate stats for each user
    allUsers.forEach(user => {
      const userQuizzes = quizResults.filter((r: any) => r.userName === user);
      const userMockTests = mockResults.filter((r: any) => r.userName === user);
      const userSatTests = satResults.filter((r: any) => r.userName === user);
      const userMarathonSessions = marathonSessions.filter((r: any) => r.userName === user);

      const totalPoints = calculatePoints(userQuizzes, [...userMockTests, ...userSatTests], userMarathonSessions);
      
      const marathonQuestions = userMarathonSessions.reduce((sum: number, session: any) => 
        sum + (session.totalQuestions || 0), 0
      );

      userStats[user] = {
        userName: user,
        totalPoints,
        mockTests: userMockTests.length + userSatTests.length,
        quizzes: userQuizzes.length,
        marathonQuestions
      };
    });

    // Sort by points and create leaderboard
    const sortedUsers = Object.values(userStats).sort((a, b) => b.totalPoints - a.totalPoints);
    setLeaderboard(sortedUsers);

    // Find current user rank
    const rank = sortedUsers.findIndex(user => user.userName === userName) + 1;
    setCurrentUserRank(rank > 0 ? rank : null);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />;
      default:
        return <span className="text-sm md:text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6 md:mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Leaderboard</h1>
        </div>

        {currentUserRank && (
          <Card className="mb-4 md:mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3">
                  {getRankIcon(currentUserRank)}
                  <div>
                    <p className="font-semibold text-blue-900 text-sm md:text-base">Your Rank: #{currentUserRank}</p>
                    <p className="text-xs md:text-sm text-blue-700">
                      {leaderboard[currentUserRank - 1]?.totalPoints || 0} points
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            {leaderboard.length === 0 ? (
              <p className="text-gray-600 text-center py-8 text-sm md:text-base">No data available yet. Complete some activities to see the leaderboard!</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.userName}
                    className={`flex items-center justify-between p-3 md:p-4 rounded-lg border ${
                      user.userName === userName 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-8 md:w-12 flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                          {user.userName}
                          {user.userName === userName && (
                            <span className="ml-2 text-xs md:text-sm text-blue-600">(You)</span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mt-1">
                          <span>{user.mockTests} tests</span>
                          <span>{user.quizzes} quizzes</span>
                          <span className="hidden sm:inline">{user.marathonQuestions} marathon</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg md:text-xl font-bold text-gray-900">{user.totalPoints}</p>
                      <p className="text-xs md:text-sm text-gray-600">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
