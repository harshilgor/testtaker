import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CompetitiveLandscapeProps {
  userName: string;
}

const CompetitiveLandscape: React.FC<CompetitiveLandscapeProps> = ({ userName }) => {
  // Fetch current user's total points
  const { data: userPoints = 0 } = useQuery({
    queryKey: ['user-total-points', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;

      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('total_points')
        .eq('user_id', user.user.id)
        .single();

      if (error) {
        console.error('Error fetching user points:', error);
        return 0;
      }

      return data?.total_points || 0;
    },
    enabled: !!userName,
  });

  // Fetch all users' points to calculate percentile
  const { data: allUsersStats = [] } = useQuery({
    queryKey: ['all-users-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('total_points')
        .order('total_points', { ascending: false });

      if (error) {
        console.error('Error fetching all users stats:', error);
        return [];
      }

      return data || [];
    },
  });

  // Fetch user's weekly activity to calculate weekly comparison
  const { data: weeklyComparison = 0 } = useQuery({
    queryKey: ['weekly-comparison', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // User weekly questions
      const { data: userAttempts, error: userAttemptsError } = await supabase
        .from('question_attempts_v2')
        .select('id')
        .eq('user_id', user.user.id)
        .gte('created_at', oneWeekAgo.toISOString());

      if (userAttemptsError) {
        console.error('Error fetching user weekly attempts:', userAttemptsError);
        return 0;
      }

      const userWeeklyQuestions = userAttempts?.length || 0;

      // User weekly study time (from marathon sessions)
      const { data: userMarathons, error: userMarathonsError } = await supabase
        .from('marathon_sessions')
        .select('start_time,end_time')
        .eq('user_id', user.user.id)
        .gte('start_time', oneWeekAgo.toISOString());

      if (userMarathonsError) {
        console.error('Error fetching user weekly marathon time:', userMarathonsError);
      }

      const now = new Date();
      const userWeeklySeconds = (userMarathons || []).reduce((sum, s: any) => {
        const start = s.start_time ? new Date(s.start_time) : null;
        const end = s.end_time ? new Date(s.end_time) : now;
        if (!start) return sum;
        const diff = Math.max(0, (end.getTime() - start.getTime()) / 1000);
        return sum + diff;
      }, 0);

      // Effort score = questions + (seconds / 75)
      const userEffort = userWeeklyQuestions + userWeeklySeconds / 75;

      // All users weekly activity
      const [
        { data: allAttempts, error: allAttemptsError },
        { data: allMarathons, error: allMarathonsError }
      ] = await Promise.all([
        supabase
          .from('question_attempts_v2')
          .select('user_id')
          .gte('created_at', oneWeekAgo.toISOString()),
        supabase
          .from('marathon_sessions')
          .select('user_id,start_time,end_time')
          .gte('start_time', oneWeekAgo.toISOString())
      ]);

      if (allAttemptsError) console.error('Error fetching all weekly attempts:', allAttemptsError);
      if (allMarathonsError) console.error('Error fetching all weekly marathon time:', allMarathonsError);

      const userMap: Record<string, { q: number; secs: number }> = {};

      (allAttempts || []).forEach((a: any) => {
        if (!a.user_id) return;
        userMap[a.user_id] = userMap[a.user_id] || { q: 0, secs: 0 };
        userMap[a.user_id].q += 1;
      });

      (allMarathons || []).forEach((s: any) => {
        const uid = s.user_id;
        if (!uid) return;
        const start = s.start_time ? new Date(s.start_time) : null;
        const end = s.end_time ? new Date(s.end_time) : now;
        if (!start) return;
        const diff = Math.max(0, (end.getTime() - start.getTime()) / 1000);
        userMap[uid] = userMap[uid] || { q: 0, secs: 0 };
        userMap[uid].secs += diff;
      });

      const efforts = Object.values(userMap)
        .map(({ q, secs }) => q + secs / 75)
        .filter((e) => e > 0);

      if (efforts.length === 0) return 0;

      const usersWithLessEffort = efforts.filter((e) => e < userEffort).length;
      const percentile = Math.round((usersWithLessEffort / efforts.length) * 100);

      return Math.max(0, Math.min(100, percentile));
    },
    enabled: !!userName,
  });

  // Calculate percentile
  const calculatePercentile = () => {
    if (allUsersStats.length === 0) return 50; // Default if no data
    
    const usersWithLowerPoints = allUsersStats.filter(stat => stat.total_points < userPoints).length;
    const percentile = Math.round((usersWithLowerPoints / allUsersStats.length) * 100);
    
    return Math.max(1, Math.min(99, percentile)); // Ensure it's between 1-99%
  };

  const percentile = calculatePercentile();

  return (
    <Card 
      className="h-full bg-white"
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Competitive Landscape</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {weeklyComparison}%
          </div>
          <div className="text-sm text-gray-600">
            You're outworking {weeklyComparison}% of students this week
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitiveLandscape;