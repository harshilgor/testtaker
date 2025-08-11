
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
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

type TimeFrame = 'all-time' | 'weekly' | 'monthly';

const Leaderboard: React.FC<LeaderboardProps> = ({ userName, onBack }) => {
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all-time');

  // Fetch leaderboard data from Supabase with real-time updates
  const { data: leaderboard = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard', timeFrame],
    queryFn: async () => {
      console.log('Fetching leaderboard data for timeframe:', timeFrame);
      
      if (timeFrame === 'all-time') {
        // Use existing leaderboard_stats table for all-time data
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
      } else {
        // For weekly/monthly, query the periodic_leaderboard_stats table directly
        // Since TypeScript doesn't recognize it yet, we'll use a raw query
        const periodType = timeFrame === 'weekly' ? 'weekly' : 'monthly';
        
        const { data, error } = await supabase
          .rpc('get_periodic_leaderboard_data', {
            period_type: periodType
          });

        if (error) {
          console.error('Error fetching periodic leaderboard:', error);
          // Fallback to empty array if function doesn't exist yet
          return [];
        }

        console.log(`Successfully loaded ${data?.length || 0} users for ${timeFrame}`);
        return data || [];
      }
    },
    staleTime: 5000, // Cache for 5 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Initialize periodic stats for current user when component mounts
  useEffect(() => {
    const initializeUserStats = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          // Only call this if user has activity, to avoid errors if function doesn't exist
          try {
            await supabase.rpc('update_periodic_leaderboard_stats', {
              target_user_id: user.user.id
            });
          } catch (error) {
            console.log('Periodic leaderboard function not available yet:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing user stats:', error);
      }
    };

    initializeUserStats();
  }, []);

  // Set up real-time subscription for leaderboard updates
  useEffect(() => {
    console.log('Setting up real-time leaderboard subscription...');
    
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_stats'
        },
        (payload) => {
          console.log('Leaderboard updated via real-time:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_attempts_v2'
        },
        (payload) => {
          console.log('Question attempt recorded, updating leaderboard:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up leaderboard subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Find current user rank
  useEffect(() => {
    if (leaderboard.length > 0) {
      const rank = leaderboard.findIndex(user => user.display_name === userName) + 1;
      setCurrentUserRank(rank > 0 ? rank : null);
      console.log('Current user rank:', rank > 0 ? rank : 'Not found');
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

        {/* Time Frame Selection */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <Button
              onClick={() => setTimeFrame('all-time')}
              variant={timeFrame === 'all-time' ? 'default' : 'ghost'}
              className={`flex-1 ${
                timeFrame === 'all-time' 
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Time
            </Button>
            <Button
              onClick={() => setTimeFrame('weekly')}
              variant={timeFrame === 'weekly' ? 'default' : 'ghost'}
              className={`flex-1 ${
                timeFrame === 'weekly' 
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              This Week
            </Button>
            <Button
              onClick={() => setTimeFrame('monthly')}
              variant={timeFrame === 'monthly' ? 'default' : 'ghost'}
              className={`flex-1 ${
                timeFrame === 'monthly' 
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              This Month
            </Button>
          </div>
        </div>

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
