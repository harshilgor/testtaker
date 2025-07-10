
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
      console.log('Fetching streak data...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return null;
      }

      console.log('Fetching streak data for user:', user.user.id);

      // First, trigger streak update to ensure current data
      try {
        console.log('Calling update_user_streak function...');
        const { error: updateError } = await supabase.rpc('update_user_streak', {
          target_user_id: user.user.id
        });
        if (updateError) {
          console.warn('Error updating streak:', updateError);
        } else {
          console.log('Streak update function called successfully');
        }
      } catch (error) {
        console.warn('Error calling update_user_streak:', error);
      }

      // Fetch streak data
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.user.id)
        .single();

      if (error) {
        console.error('Error fetching streak:', error);
        
        // If no streak record exists, the function above should have created one
        // Let's try fetching again after a short delay
        if (error.code === 'PGRST116') {
          console.log('No streak record found, trying to fetch again...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: retryData, error: retryError } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak, last_activity_date')
            .eq('user_id', user.user.id)
            .single();
            
          if (!retryError && retryData) {
            console.log('Successfully fetched streak data on retry:', retryData);
            setIsLoading(false);
            return retryData as UserStreak;
          }
        }
        
        setIsLoading(false);
        return null;
      }

      console.log('Streak data fetched:', data);
      setIsLoading(false);
      return data as UserStreak | null;
    },
    enabled: !!userName,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute (replaces cacheTime)
  });

  // Function to manually trigger streak update
  const checkTodayActivity = async () => {
    console.log('Manually checking today activity...');
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    try {
      await supabase.rpc('update_user_streak', {
        target_user_id: user.user.id
      });
      console.log('Manual streak update completed');
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
