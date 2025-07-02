
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

      // Fetch user daily activity
      const { data: activities, error } = await supabase
        .from('user_daily_activity')
        .select('activity_date')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });

      if (error) {
        console.error('Error fetching streak data:', error);
        return;
      }

      const activityDates = activities?.map(a => new Date(a.activity_date)) || [];
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if user was active today or yesterday
      const hasRecentActivity = activityDates.some(date => {
        const activityDate = new Date(date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === today.getTime() || activityDate.getTime() === yesterday.getTime();
      });

      if (hasRecentActivity) {
        let checkDate = new Date(today);
        
        // If no activity today, start from yesterday
        if (!activityDates.some(date => {
          const activityDate = new Date(date);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === today.getTime();
        })) {
          checkDate = yesterday;
        }

        while (activityDates.some(date => {
          const activityDate = new Date(date);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === checkDate.getTime();
        })) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      let prevDate: Date | null = null;

      for (const activity of activityDates.sort((a, b) => a.getTime() - b.getTime())) {
        const currentDate = new Date(activity);
        currentDate.setHours(0, 0, 0, 0);

        if (prevDate === null) {
          tempStreak = 1;
        } else {
          const expectedDate = new Date(prevDate);
          expectedDate.setDate(expectedDate.getDate() + 1);
          
          if (currentDate.getTime() === expectedDate.getTime()) {
            tempStreak++;
          } else if (currentDate.getTime() !== prevDate.getTime()) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        
        prevDate = currentDate;
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Calculate this week's activity (Monday = 0, Sunday = 6)
      const weekStart = new Date(today);
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0
      weekStart.setDate(today.getDate() - mondayOffset);

      const weeklyActivity = Array(7).fill(false);
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(weekStart.getDate() + i);
        
        weeklyActivity[i] = activityDates.some(date => {
          const activityDate = new Date(date);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === checkDate.getTime();
        });
      }

      setStreakData({
        currentStreak,
        longestStreak,
        weeklyActivity
      });
    } catch (error) {
      console.error('Error in fetchStreakData:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordActivity = async (activityType: string = 'login') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_daily_activity')
        .upsert({
          user_id: user.id,
          activity_date: new Date().toISOString().split('T')[0],
          activity_type: activityType
        }, {
          onConflict: 'user_id,activity_date'
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
