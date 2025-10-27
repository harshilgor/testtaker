
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import LeaderboardHeader from './Leaderboard/LeaderboardHeader';
import UserRankCard from './Leaderboard/UserRankCard';
import LeaderboardList from './Leaderboard/LeaderboardList';
import LeaderboardStats from './Leaderboard/LeaderboardStats';
import { useSimpleToast } from '@/components/ui/simple-toast';

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
  const { showToast } = useSimpleToast();

  // Check for first-time leaderboard visit and award points
  useEffect(() => {
    const checkFirstTimeVisit = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        // Check if user has already visited the leaderboard
        const { data: existingVisit, error: checkError } = await supabase
          .from('quest_completions')
          .select('id')
          .eq('user_id', user.user.id)
          .eq('quest_id', 'leaderboard-quest')
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // No existing visit found - this is their first time!
          console.log('First-time leaderboard visit detected for user:', user.user.id);
          
          // Award points for visiting leaderboard
          const { error: pointsError } = await supabase.rpc('increment_user_points', {
            p_points: 25, // Same points as the quest
            p_user_id: user.user.id
          });

          if (pointsError) {
            console.error('Error awarding leaderboard visit points:', pointsError);
            return;
          }

          // Record the completion
          const { error: completionError } = await supabase
            .from('quest_completions')
            .insert({
              user_id: user.user.id,
              quest_id: 'leaderboard-quest',
              points_awarded: 25
            });

          if (completionError) {
            console.error('Error recording leaderboard visit:', completionError);
            return;
          }

          // Show congratulatory notification
          showToast({
            title: 'Welcome to the Leaderboard! 🎉',
            description: 'You earned 25 points for visiting the leaderboard for the first time!',
            type: 'success',
            duration: 6000
          });

          console.log('Successfully awarded leaderboard visit points and notification');
        } else if (checkError) {
          console.error('Error checking leaderboard visit:', checkError);
        } else {
          console.log('User has already visited leaderboard before');
        }
      } catch (error) {
        console.error('Error in checkFirstTimeVisit:', error);
      }
    };

    checkFirstTimeVisit();
  }, [showToast]);

  // Initialize periodic stats for current user when component mounts
  useEffect(() => {
    const initializeUserStats = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          console.log('Initializing periodic leaderboard stats for user:', user.user.id);
          
          // Ensure both all-time and periodic stats are up to date
          await Promise.all([
            supabase.rpc('update_leaderboard_stats_v2', {
              target_user_id: user.user.id
            }),
            supabase.rpc('update_periodic_leaderboard_stats', {
              target_user_id: user.user.id
            })
          ]);
          
          console.log('Successfully initialized all leaderboard stats');
        }
      } catch (error) {
        console.error('Error initializing user stats:', error);
      }
    };

    initializeUserStats();
  }, []);

  // Fetch leaderboard data with support for periodic stats
  const { data: leaderboard = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard', timeFrame],
    queryFn: async () => {
      try {
        console.log('Fetching leaderboard data for timeFrame:', timeFrame);
        
        if (timeFrame === 'all-time') {
          const { data, error } = await supabase
            .from('leaderboard_stats')
            .select('*')
            .eq('visibility', 'public')
            .order('total_points', { ascending: false })
            .limit(50);
          
          if (error) throw error;
          console.log('All-time leaderboard data:', data?.length || 0, 'entries');
          return data || [];
        } else if (timeFrame === 'weekly') {
          const now = new Date();
          // Define week window: Monday 00:00:00 to next Monday 00:00:00 (resets Sunday 11:59 PM)
          const weekStart = new Date(now);
          const day = weekStart.getDay(); // 0 Sun .. 6 Sat
          const diffToMonday = ((day + 6) % 7); // 0 if Monday, 1 if Tuesday, ... 6 if Sunday
          weekStart.setDate(weekStart.getDate() - diffToMonday);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          const weekStartStr = weekStart.toISOString().split('T')[0];
          
          console.log('Fetching weekly data for window:', weekStart.toISOString(), '→', weekEnd.toISOString());
          
          // Primary: precomputed table if available
          const { data: weeklyRows, error: weeklyErr } = await supabase
            .from('weekly_leaderboard_stats')
            .select('*')
            .eq('visibility', 'public')
            .eq('week_start_date', weekStartStr)
            .order('total_points', { ascending: false })
            .limit(200);
          
          if (weeklyErr) {
            console.warn('Weekly precomputed table fetch failed, will try fallback:', weeklyErr);
          }
          if (weeklyRows && weeklyRows.length > 0) {
            console.log('Weekly leaderboard (precomputed):', weeklyRows.length, 'entries');
            return weeklyRows;
          }
          
          // Fallback: compute from attempts so users always see names and points
          console.log('Weekly table empty — using fallback aggregation from attempts');
          const { data: profiles } = await supabase
            .from('leaderboard_stats')
            .select('user_id, display_name')
            .eq('visibility', 'public')
            .limit(1000);
          
          const { data: attempts } = await supabase
            .from('question_attempts_v2')
            .select('user_id, points_earned, created_at')
            .gte('created_at', weekStart.toISOString())
            .lt('created_at', weekEnd.toISOString());
          
          const userIdToPoints: Record<string, number> = {};
          (attempts || []).forEach(a => {
            const uid = (a as any).user_id as string;
            const pts = Number((a as any).points_earned) || 0;
            userIdToPoints[uid] = (userIdToPoints[uid] || 0) + pts;
          });
          const results: any[] = (profiles || []).map(p => ({
            user_id: (p as any).user_id,
            display_name: (p as any).display_name || 'User',
            total_points: userIdToPoints[(p as any).user_id] || 0,
            mock_test_count: 0,
            quiz_count: 0,
            marathon_questions_count: 0,
          }));
          results.sort((a, b) => b.total_points - a.total_points);
          console.log('Weekly leaderboard (fallback):', results.length, 'entries');
          return results;
        } else if (timeFrame === 'monthly') {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          monthStart.setHours(0, 0, 0, 0);
          const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          nextMonthStart.setHours(0, 0, 0, 0);
          const monthStartStr = monthStart.toISOString().split('T')[0];
          
          console.log('Fetching monthly data for window:', monthStart.toISOString(), '→', nextMonthStart.toISOString());
          
          // Primary: precomputed monthly table
          const { data: monthlyRows, error: monthlyErr } = await supabase
            .from('monthly_leaderboard_stats')
            .select('*')
            .eq('visibility', 'public')
            .eq('month_start_date', monthStartStr)
            .order('total_points', { ascending: false })
            .limit(200);
          if (monthlyErr) {
            console.warn('Monthly precomputed table fetch failed, will try fallback:', monthlyErr);
          }
          if (monthlyRows && monthlyRows.length > 0) {
            console.log('Monthly leaderboard (precomputed):', monthlyRows.length, 'entries');
            return monthlyRows;
          }
          
          // Fallback: aggregate directly from attempts for this month
          console.log('Monthly table empty — using fallback aggregation from attempts');
          const { data: profiles } = await supabase
            .from('leaderboard_stats')
            .select('user_id, display_name')
            .eq('visibility', 'public')
            .limit(1000);
          
          const { data: attempts } = await supabase
            .from('question_attempts_v2')
            .select('user_id, points_earned, created_at')
            .gte('created_at', monthStart.toISOString())
            .lt('created_at', nextMonthStart.toISOString());
          
          const userIdToPoints: Record<string, number> = {};
          (attempts || []).forEach(a => {
            const uid = (a as any).user_id as string;
            const pts = Number((a as any).points_earned) || 0;
            userIdToPoints[uid] = (userIdToPoints[uid] || 0) + pts;
          });
          const results: any[] = (profiles || []).map(p => ({
            user_id: (p as any).user_id,
            display_name: (p as any).display_name || 'User',
            total_points: userIdToPoints[(p as any).user_id] || 0,
            mock_test_count: 0,
            quiz_count: 0,
            marathon_questions_count: 0,
          }));
          results.sort((a, b) => b.total_points - a.total_points);
          console.log('Monthly leaderboard (fallback):', results.length, 'entries');
          return results;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    },
    staleTime: 1000 * 30, // 30 seconds - very short for real-time updates
    refetchInterval: 1000 * 30, // 30 seconds - refresh every 30 seconds
  });

  // Set up real-time subscription for leaderboard updates
  useEffect(() => {
    console.log('Setting up real-time leaderboard subscription...');
    
    const getTableName = () => {
      switch (timeFrame) {
        case 'weekly': return 'weekly_leaderboard_stats';
        case 'monthly': return 'monthly_leaderboard_stats';
        default: return 'leaderboard_stats';
      }
    };
    
    const channel = supabase
      .channel(`leaderboard-changes-${timeFrame}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: getTableName()
        },
        (payload) => {
          console.log(`${timeFrame} leaderboard updated via real-time:`, payload);
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
          // Small delay to allow database functions to complete
          setTimeout(() => refetch(), 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quest_completions'
        },
        (payload) => {
          console.log('Quest completion recorded, updating leaderboard:', payload);
          setTimeout(() => refetch(), 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_results'
        },
        (payload) => {
          console.log('Quiz result recorded, updating leaderboard:', payload);
          setTimeout(() => refetch(), 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marathon_sessions'
        },
        (payload) => {
          console.log('Marathon session recorded, updating leaderboard:', payload);
          setTimeout(() => refetch(), 1000);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up leaderboard subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch, timeFrame]);

  // Find current user rank
  useEffect(() => {
    if (Array.isArray(leaderboard) && leaderboard.length > 0) {
      const rank = leaderboard.findIndex(user => user.display_name === userName) + 1;
      setCurrentUserRank(rank > 0 ? rank : null);
      console.log('Current user rank:', rank > 0 ? rank : 'Not found', 'in', timeFrame, 'leaderboard');
    } else {
      setCurrentUserRank(null);
    }
  }, [leaderboard, userName, timeFrame]);

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
