import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  questionsToday: number;
  dailyActivity: Array<{
    date: string;
    questionCount: number;
    hasActivity: boolean;
  }>;
}

interface DebugInfo {
  userId: string | null;
  todayDate: string;
  activitySources: {
    quizzes: number;
    marathons: number;
    mockTests: number;
  };
  calculatedStreak: number;
  dbStreak: number;
}

export const useOptimizedStreak = (userName: string) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isUpdatingStreak, setIsUpdatingStreak] = useState(false);
  const queryClient = useQueryClient();

  const getStreakData = useCallback(async (): Promise<StreakData | null> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const userId = user.user.id;
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    // Build last 30 days list
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    try {
      // Fetch DB streak and all attempts across all modes
      const [userStreakData, attemptsData] = await Promise.all([
        supabase
          .from('user_streaks')
          .select('current_streak, longest_streak, last_activity_date')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('question_attempts_v2')
          .select('created_at, session_type')
          .eq('user_id', userId)
          .gte('created_at', `${dates[dates.length - 1]}T00:00:00Z`)
          .lte('created_at', `${dates[0]}T23:59:59Z`),
      ]);

      const attempts = attemptsData.data || [];

      // Compute daily activity using attempts only (immediate updates as questions are solved)
      const dailyActivity = dates.map((date) => {
        const dayAttempts = attempts.filter((a) => a.created_at.startsWith(date));
        const questionCount = dayAttempts.length;
        return {
          date,
          questionCount,
          hasActivity: questionCount >= 5,
        };
      });

      const todayActivity = dailyActivity[0];
      const todayQuestionCount = todayActivity.questionCount;

      // Calculate current streak from today backwards
      let currentStreak = 0;
      let startIndex = todayActivity.hasActivity ? 0 : 1;
      for (let i = startIndex; i < dailyActivity.length; i++) {
        if (dailyActivity[i].hasActivity) currentStreak++;
        else break;
      }
      if (todayActivity.hasActivity && startIndex === 1) currentStreak++;

      // Calculate longest streak in window and combine with DB value
      let longestStreak = 0;
      let tmp = 0;
      for (const day of dailyActivity) {
        if (day.hasActivity) {
          tmp++;
          longestStreak = Math.max(longestStreak, tmp);
        } else {
          tmp = 0;
        }
      }
      const dbLongest = userStreakData.data?.longest_streak || 0;
      const finalLongestStreak = Math.max(longestStreak, dbLongest);

      setDebugInfo({
        userId,
        todayDate,
        activitySources: { quizzes: 0, marathons: 0, mockTests: 0 },
        calculatedStreak: currentStreak,
        dbStreak: userStreakData.data?.current_streak || 0,
      });

      // Optionally sync DB if today qualifies (safe no-op if server-side rules reject)
      if (todayQuestionCount >= 5) {
        setIsUpdatingStreak(true);
        try {
          await supabase.rpc('update_user_streak', { target_user_id: userId });
        } catch (e) {
          // ignore
        } finally {
          setIsUpdatingStreak(false);
        }
      }

      return {
        current_streak: currentStreak,
        longest_streak: finalLongestStreak,
        last_activity_date: todayActivity.hasActivity ? todayDate : null,
        questionsToday: todayQuestionCount,
        dailyActivity: dailyActivity.slice(0, 7),
      };
    } catch (err) {
      console.error('Error fetching streak data', err);
      return null;
    }
  }, []);

  const { data: streakData, isLoading, refetch } = useQuery({
    queryKey: ['optimized-streak', userName],
    queryFn: getStreakData,
    enabled: !!userName,
    staleTime: 30000,
    gcTime: 60000,
    refetchInterval: 30000,
  });

  const triggerStreakUpdate = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['user-streak'] });
    queryClient.invalidateQueries({ queryKey: ['optimized-streak'] });
  }, [refetch, queryClient]);

  const onQuestionAnswered = useCallback(async () => {
    setTimeout(() => {
      triggerStreakUpdate();
    }, 500);
  }, [triggerStreakUpdate]);

  // Realtime refresh when attempts are inserted
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let mounted = true;

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid || !mounted) return;

      channel = supabase
        .channel('streak-attempts')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'question_attempts_v2' },
          (payload) => {
            const newRow: any = payload.new;
            if (newRow?.user_id === uid) {
              const todayStr = new Date().toISOString().split('T')[0];
              if (newRow.created_at?.startsWith(todayStr)) {
                triggerStreakUpdate();
              }
            }
          }
        )
        .subscribe();
    })();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [triggerStreakUpdate]);

  return {
    streakData,
    isLoading: isLoading || isUpdatingStreak,
    refetch: triggerStreakUpdate,
    onQuestionAnswered,
    debugInfo,
    questionsToday: streakData?.questionsToday || 0,
    hasJustReached5Questions: (streakData?.questionsToday || 0) === 5,
  };
};
