import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Users, Award, Target, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LeaderboardRankingWidget: React.FC = () => {
  const { questionAttempts, marathonSessions, quizResults, loading } = useData();
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState({
    currentRank: 0,
    totalUsers: 0,
    userScore: 0,
    loading: true
  });

  // Fetch real leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!user?.id) return;

      try {
        // Calculate user's current score based on performance
        const totalQuestions = questionAttempts?.length || 0;
        const correctAnswers = questionAttempts?.filter(a => a.is_correct).length || 0;
        const userAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const userScore = Math.round(userAccuracy * 10); // Convert to 0-1000 scale

        // Get all users' performance data to calculate real ranking
        const { data: allUsers, error } = await supabase
          .from('question_attempts_v2')
          .select('user_id, is_correct')
          .not('user_id', 'is', null);

        if (error) {
          console.error('Error fetching leaderboard data:', error);
          return;
        }

        // Calculate scores for all users
        const userScores = new Map();
        allUsers?.forEach(attempt => {
          const userId = attempt.user_id;
          if (!userScores.has(userId)) {
            userScores.set(userId, { total: 0, correct: 0 });
          }
          const userData = userScores.get(userId);
          userData.total++;
          if (attempt.is_correct) {
            userData.correct++;
          }
          userScores.set(userId, userData);
        });

        // Convert to array and calculate rankings
        const scoresArray = Array.from(userScores.entries()).map(([userId, data]) => ({
          userId,
          score: data.total > 0 ? Math.round((data.correct / data.total) * 1000) : 0,
          accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
        }));

        // Sort by score (descending)
        scoresArray.sort((a, b) => b.score - a.score);

        // Find user's rank
        const userRankIndex = scoresArray.findIndex(entry => entry.userId === user.id);
        const currentRank = userRankIndex >= 0 ? userRankIndex + 1 : scoresArray.length + 1;
        const totalUsers = scoresArray.length;

        setLeaderboardData({
          currentRank,
          totalUsers,
          userScore,
          loading: false
        });

      } catch (error) {
        console.error('Error calculating leaderboard:', error);
        setLeaderboardData(prev => ({ ...prev, loading: false }));
      }
    };

    if (user?.id && questionAttempts) {
      fetchLeaderboardData();
    }
  }, [user?.id, questionAttempts]);

  const rankingData = useMemo(() => {
    return {
      currentRank: leaderboardData.currentRank,
      totalUsers: leaderboardData.totalUsers,
      percentile: leaderboardData.totalUsers > 0 
        ? Math.round(((leaderboardData.totalUsers - leaderboardData.currentRank + 1) / leaderboardData.totalUsers) * 100)
        : 0,
      userScore: leaderboardData.userScore,
      accuracy: questionAttempts?.length > 0 
        ? Math.round((questionAttempts.filter(a => a.is_correct).length / questionAttempts.length) * 100)
        : 0
    };
  }, [leaderboardData, questionAttempts]);

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

  if (loading || leaderboardData.loading) {
    return (
      <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
        </CardContent>
      </Card>
    );
  }

  // Show fallback if no data available
  if (rankingData.totalUsers === 0) {
    return (
      <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Leaderboard Rank</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
          <div className="text-center py-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
              --
            </div>
            <div className="text-xs lg:text-sm text-gray-600">
              Start practicing to get ranked!
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Leaderboard Rank</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {/* Main Rank Display */}
        <div className="text-center py-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <RankIcon className={`h-5 w-5 lg:h-6 lg:w-6 ${getRankColor(rankingData.currentRank)}`} />
          </div>
          <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
            #{rankingData.currentRank}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">
            of {rankingData.totalUsers.toLocaleString()} users
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default LeaderboardRankingWidget;