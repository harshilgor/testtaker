
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
        // For weekly/monthly, get ALL users who have accounts and calculate their points
        const dateFilter = getDateFilter(timeFrame);
        
        console.log('Fetching attempts for timeframe with date filter:', dateFilter);

        // First get all user profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        if (!profiles || profiles.length === 0) {
          console.log('No profiles found');
          return [];
        }

        // Get question attempts for the timeframe
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

        console.log('Found attempts for timeframe:', attempts?.length || 0);

        // Create a map of user stats starting with all users at 0
        const userStats = new Map();
        
        // Initialize all users with 0 stats
        profiles.forEach(profile => {
          userStats.set(profile.id, {
            user_id: profile.id,
            display_name: profile.display_name || 'Anonymous',
            total_points: 0,
            quiz_count: new Set(),
            mock_test_count: new Set(),
            marathon_questions_count: 0
          });
        });

        // Add points and counts for users who have attempts
        if (attempts && attempts.length > 0) {
          attempts.forEach(attempt => {
            const userId = attempt.user_id;
            if (userStats.has(userId)) {
              const stats = userStats.get(userId);
              stats.total_points += attempt.points_earned || 0;
              
              if (attempt.session_type === 'quiz' && attempt.session_id) {
                stats.quiz_count.add(attempt.session_id);
              } else if (attempt.session_type === 'mocktest' && attempt.session_id) {
                stats.mock_test_count.add(attempt.session_id);
              } else if (attempt.session_type === 'marathon') {
                stats.marathon_questions_count++;
              }
            }
          });
        }

        // Convert sets to counts and create final array
        const leaderboardData = Array.from(userStats.values()).map(stats => ({
          ...stats,
          quiz_count: stats.quiz_count.size,
          mock_test_count: stats.mock_test_count.size,
          id: stats.user_id
        }));

        // Sort by total points (users with 0 points will be included)
        const sortedData = leaderboardData
          .sort((a, b) => b.total_points - a.total_points);

        console.log(`Successfully loaded ${sortedData.length} users for ${timeFrame}`);
        return sortedData;
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
