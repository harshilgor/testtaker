
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

  // Fetch leaderboard data with support for periodic stats
  const { data: leaderboard = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard', timeFrame],
    queryFn: async () => {
      try {
        if (timeFrame === 'all-time') {
          // Fetch all-time leaderboard
          const { data, error } = await supabase
            .from('leaderboard_stats')
            .select('*')
            .eq('visibility', 'public')
            .order('total_points', { ascending: false })
            .limit(50);
          
          if (error) throw error;
          return data || [];
        } else if (timeFrame === 'weekly') {
          // Fetch current week's leaderboard
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
          weekStart.setHours(0, 0, 0, 0);
          
          const { data, error } = await supabase
            .from('weekly_leaderboard_stats')
            .select('*')
            .eq('visibility', 'public')
            .eq('week_start_date', weekStart.toISOString().split('T')[0])
            .order('total_points', { ascending: false })
            .limit(50);
          
          if (error) throw error;
          return data || [];
        } else if (timeFrame === 'monthly') {
          // Fetch current month's leaderboard
          const monthStart = new Date();
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          
          const { data, error } = await supabase
            .from('monthly_leaderboard_stats')
            .select('*')
            .eq('visibility', 'public')
            .eq('month_start_date', monthStart.toISOString().split('T')[0])
            .order('total_points', { ascending: false })
            .limit(50);
          
          if (error) throw error;
          return data || [];
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });

  // Initialize periodic stats for current user when component mounts
  useEffect(() => {
    const initializeUserStats = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          // Only call this if user has activity, to avoid errors if function doesn't exist
          try {
            await (supabase as any).rpc('update_periodic_leaderboard_stats', {
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
    if (Array.isArray(leaderboard) && leaderboard.length > 0) {
      const rank = leaderboard.findIndex(user => user.display_name === userName) + 1;
      setCurrentUserRank(rank > 0 ? rank : null);
      console.log('Current user rank:', rank > 0 ? rank : 'Not found');
    }
  }, [leaderboard, userName]);

  // Handle loading and error states
  if (isLoading || error) {
    return <LeaderboardStats onBack={onBack} isLoading={isLoading} error={error} />;
  }

  const currentUserData = Array.isArray(leaderboard) ? leaderboard.find(user => user.display_name === userName) : null;

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
          leaderboard={Array.isArray(leaderboard) ? leaderboard : []} 
          currentUserName={userName} 
        />
      </div>
    </div>
  );
};

export default Leaderboard;
