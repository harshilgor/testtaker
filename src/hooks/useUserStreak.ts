
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
      if (!user.user) {
        setIsLoading(false);
        return null;
      }

      // Always trigger streak update first
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

      // Then fetch the current streak data
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching streak:', error);
        setIsLoading(false);
        return null;
      }

      setIsLoading(false);
      return data as UserStreak | null;
    },
    enabled: !!userName,
    refetchInterval: 60000, // Refetch every minute to keep data fresh
  });

  // Force refresh when component mounts or userName changes
  useEffect(() => {
    if (userName) {
      refetch();
    }
  }, [userName, refetch]);

  return {
    streakData,
    isLoading,
    refetch
  };
};
