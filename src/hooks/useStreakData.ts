
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[];
}

export const useStreakData = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    weeklyActivity: [false, false, false, false, false, false, false]
  });
  const [loading, setLoading] = useState(true);

  const fetchStreakData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use RPC function with proper type casting
      const { data: activities, error } = await supabase
        .rpc('calculate_user_streak' as any, { target_user_id: user.id });

      if (error) {
        console.error('Error fetching streak data:', error);
        // Fallback to default values if function doesn't exist yet
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          weeklyActivity: [false, false, false, false, false, false, false]
        });
        return;
      }

      if (activities && Array.isArray(activities) && activities.length > 0) {
        const result = activities[0];
        setStreakData({
          currentStreak: result.current_streak || 0,
          longestStreak: result.longest_streak || 0,
          weeklyActivity: result.weekly_activity || [false, false, false, false, false, false, false]
        });
      }
    } catch (error) {
      console.error('Error in fetchStreakData:', error);
      // Set default values on error
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        weeklyActivity: [false, false, false, false, false, false, false]
      });
    } finally {
      setLoading(false);
    }
  };

  const recordActivity = async (activityType: string = 'login') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use the RPC function with proper type casting
      const { error } = await supabase.rpc('record_user_activity' as any, {
        activity_type: activityType
      });

      if (error) {
        console.error('Error recording activity:', error);
        return;
      }

      // Refresh streak data after recording activity
      await fetchStreakData();
    } catch (error) {
      console.error('Error in recordActivity:', error);
    }
  };

  useEffect(() => {
    fetchStreakData();
  }, []);

  return {
    streakData,
    loading,
    recordActivity,
    refreshStreakData: fetchStreakData
  };
};
