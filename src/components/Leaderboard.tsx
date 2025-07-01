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

  // Calculate date filters based on timeframe
  const getDateFilter = (timeFrame: TimeFrame) => {
    const now = new Date();
    switch (timeFrame) {
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.toISOString();
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return monthStart.toISOString();
      default:
        return null;
    }
  };

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
        // For weekly/monthly, calculate from question_attempts_v2
        const dateFilter = getDateFilter(timeFrame);
        
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];

        // First get the question attempts
        const { data: attempts, error: attemptsError } = await supabase
          .from('question_attempts_v2')
          .select(`
            user_id,
            points_earned,
            session_type,
            session_id,
            created_at
          `)
          .gte('created_at', dateFilter)
          .order('created_at', { ascending: false });

        if (attemptsError) {
          console.error('Error fetching attempts:', attemptsError);
          throw attemptsError;
        }

        // Get unique user IDs from attempts
        const userIds = [...new Set(attempts?.map(attempt => attempt.user_id) || [])];
        
        // Fetch user profiles separately
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        // Create a map of user_id to display_name
        const profileMap = new Map();
        profiles?.forEach(profile => {
          profileMap.set(profile.id, profile.display_name || 'Anonymous');
        });

        // Aggregate the data by user
        const userStats = new Map();
        
        attempts?.forEach(attempt => {
          const userId = attempt.user_id;
          if (!userStats.has(userId)) {
            userStats.set(userId, {
              user_id: userId,
              display_name: profileMap.get(userId) || 'Anonymous',
              total_points: 0,
              quiz_count: new Set(),
              mock_test_count: new Set(),
              marathon_questions_count: 0
            });
          }
          
          const stats = userStats.get(userId);
          stats.total_points += attempt.points_earned || 0;
          
          if (attempt.session_type === 'quiz' && attempt.session_id) {
            stats.quiz_count.add(attempt.session_id);
          } else if (attempt.session_type === 'mocktest' && attempt.session_id) {
            stats.mock_test_count.add(attempt.session_id);
          } else if (attempt.session_type === 'marathon') {
            stats.marathon_questions_count++;
          }
        });

        // Convert sets to counts and create final array
        const leaderboardData = Array.from(userStats.values()).map(stats => ({
          ...stats,
          quiz_count: stats.quiz_count.size,
          mock_test_count: stats.mock_test_count.size,
          id: stats.user_id
        }));

        // Sort by total points
        leaderboardData.sort((a, b) => b.total_points - a.total_points);

        console.log('Leaderboard data loaded:', leaderboardData.length, 'users for', timeFrame);
        return leaderboardData;
      }
    },
    staleTime: 1000, // Refetch every second for real-time updates
    refetchInterval: 1000,
  });

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
              className={`flex-1 ${timeFrame === 'all-time' ? 'bg-white shadow-sm' : ''}`}
            >
              All Time
            </Button>
            <Button
              onClick={() => setTimeFrame('weekly')}
              variant={timeFrame === 'weekly' ? 'default' : 'ghost'}
              className={`flex-1 ${timeFrame === 'weekly' ? 'bg-white shadow-sm' : ''}`}
            >
              This Week
            </Button>
            <Button
              onClick={() => setTimeFrame('monthly')}
              variant={timeFrame === 'monthly' ? 'default' : 'ghost'}
              className={`flex-1 ${timeFrame === 'monthly' ? 'bg-white shadow-sm' : ''}`}
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
