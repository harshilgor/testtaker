
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import LeaderboardHeader from './Leaderboard/LeaderboardHeader';
import UserRankCard from './Leaderboard/UserRankCard';
import LeaderboardList from './Leaderboard/LeaderboardList';
import LeaderboardStats from './Leaderboard/LeaderboardStats';

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

  // Handle loading and error states
  if (isLoading || error) {
    return <LeaderboardStats onBack={onBack} isLoading={isLoading} error={error} />;
  }

  const currentUserData = leaderboard.find(user => user.display_name === userName);

  return (
    <div className="min-h-screen bg-white py-4 md:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <LeaderboardHeader onBack={onBack} />

        {currentUserRank && currentUserData && (
          <UserRankCard 
            rank={currentUserRank} 
            points={currentUserData.total_points} 
          />
        )}

        <LeaderboardList 
          leaderboard={leaderboard} 
          currentUserName={userName} 
        />
      </div>
    </div>
  );
};

export default Leaderboard;
