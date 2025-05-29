
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface LeaderboardProps {
  userName: string;
  onBack: () => void;
}

interface UserScore {
  id: string;
  user_id: string;
  display_name: string;
  total_points: number;
  mock_test_count: number;
  quiz_count: number;
  marathon_questions_count: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userName, onBack }) => {
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  // Fetch leaderboard data from Supabase with real-time updates
  const { data: leaderboard = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .eq('visibility', 'public')
        .order('total_points', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5000, // Refetch every 5 seconds for real-time updates
    refetchInterval: 5000,
  });

  // Set up real-time subscription for leaderboard updates
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_stats'
        },
        () => {
          console.log('Leaderboard updated, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Find current user rank
  useEffect(() => {
    if (leaderboard.length > 0) {
      const rank = leaderboard.findIndex(user => user.display_name === userName) + 1;
      setCurrentUserRank(rank > 0 ? rank : null);
    }
  }, [leaderboard, userName]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />;
      default:
        return <span className="text-sm md:text-lg font-bold text-gray-600 min-w-[2rem] text-center">#{position}</span>;
    }
  };

  if (isLoading) {
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
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading leaderboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600 text-center">Failed to load leaderboard. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                      {leaderboard[currentUserRank - 1]?.total_points || 0} points
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
              <p className="text-gray-600 text-center py-8 text-sm md:text-base">
                No leaderboard data available yet. Complete some activities to see rankings!
              </p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 md:p-4 rounded-lg border ${
                      user.display_name === userName 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-10 md:w-12 flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm md:text-base break-words">
                          {user.display_name}
                          {user.display_name === userName && (
                            <span className="ml-2 text-xs md:text-sm text-blue-600">(You)</span>
                          )}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-xs md:text-sm text-gray-600 mt-1">
                          <span className="whitespace-nowrap">{user.mock_test_count} tests</span>
                          <span className="whitespace-nowrap">{user.quiz_count} quizzes</span>
                          <span className="whitespace-nowrap">{user.marathon_questions_count} marathon</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-lg md:text-xl font-bold text-gray-900">{user.total_points}</p>
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
