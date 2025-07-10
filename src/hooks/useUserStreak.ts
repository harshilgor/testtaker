
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export const useUserStreak = (userName: string) => {
  const [isLoading, setIsLoading] = useState(true);

  const { data: streakData, refetch } = useQuery({
    queryKey: ['user-streak', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      console.log('Fetching streak data for user:', user.user.id);

      // First, trigger streak update to ensure current data
      try {
        const { error: updateError } = await supabase.rpc('update_user_streak', {
          target_user_id: user.user.id
        });
        if (updateError) {
          console.warn('Error updating streak:', updateError);
        }
      } catch (error) {
        console.warn('Error calling update_user_streak:', error);
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching streak:', error);
        return null;
      }

      console.log('Streak data:', data);
      setIsLoading(false);
      return data as UserStreak | null;
    },
    enabled: !!userName,
  });

  // Function to check if user has activity today and update streak
  const checkTodayActivity = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    try {
      await supabase.rpc('update_user_streak', {
        target_user_id: user.user.id
      });
      refetch();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  return {
    streakData,
    isLoading,
    refetch,
    checkTodayActivity
  };
};
