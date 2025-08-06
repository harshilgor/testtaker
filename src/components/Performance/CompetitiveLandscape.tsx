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

      // Get user's activity this week
      const { data: userActivity, error: userError } = await supabase
        .from('question_attempts_v2')
        .select('id')
        .eq('user_id', user.user.id)
        .gte('created_at', oneWeekAgo.toISOString());

      if (userError) {
        console.error('Error fetching user weekly activity:', userError);
        return 0;
      }

      const userWeeklyQuestions = userActivity?.length || 0;

      // Get all users' weekly activity
      const { data: allUsersActivity, error: allError } = await supabase
        .from('question_attempts_v2')
        .select('user_id')
        .gte('created_at', oneWeekAgo.toISOString());

      if (allError) {
        console.error('Error fetching all users weekly activity:', allError);
        return 0;
      }

      // Count questions per user this week
      const userQuestionCounts = allUsersActivity?.reduce((acc, attempt) => {
        acc[attempt.user_id] = (acc[attempt.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const allWeeklyCounts = Object.values(userQuestionCounts);
      const usersWithLessActivity = allWeeklyCounts.filter(count => count < userWeeklyQuestions).length;
      const totalUsers = allWeeklyCounts.length;

      return totalUsers > 0 ? Math.round((usersWithLessActivity / totalUsers) * 100) : 0;
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

  const handleViewDetails = () => {
    console.log('View detailed breakdown clicked');
    // Navigate to detailed competitive analysis page
  };

  return (
    <Card 
      className="h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-white"
      onClick={handleViewDetails}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Competitive Landscape</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col justify-between h-full">
        <div className="space-y-6">
          {/* Percentile Section */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {percentile}th
            </div>
            <div className="text-lg text-gray-600 mb-4">
              Percentile
            </div>
            <div className="text-sm text-gray-500">
              You're performing better than {percentile}% of students
            </div>
          </div>

          {/* Weekly Performance Section */}
          <div className="text-center border-t pt-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {weeklyComparison}%
            </div>
            <div className="text-sm text-gray-600">
              You're outworking {weeklyComparison}% of students this week
            </div>
          </div>

          {/* Visual indicator */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 relative">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentile}%` }}
                ></div>
                <div 
                  className="absolute top-0 w-2 h-2 bg-white border-2 border-blue-600 rounded-full transform -translate-y-0"
                  style={{ left: `calc(${percentile}% - 4px)` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-4">
          <div className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
            <span>See Detailed Breakdown</span>
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitiveLandscape;