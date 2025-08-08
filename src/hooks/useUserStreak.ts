
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export const useUserStreak = (userName: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [questionsToday, setQuestionsToday] = useState(0);
  const [previousQuestionsToday, setPreviousQuestionsToday] = useState(0);

  // LEGACY HOOK - Use useOptimizedStreak for new components
  console.warn('⚠️ Using legacy useUserStreak hook. Consider migrating to useOptimizedStreak for better performance.');

  // Optimized query to get all daily activity in one call
  const getOptimizedDailyActivity = useCallback(async (userId: string, days: number = 7) => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      dates.push(checkDate.toISOString().split('T')[0]);
    }

    // Single query to get all question activity
    const [quizData, marathonData, mockTestData] = await Promise.all([
      supabase
        .from('quiz_results')
        .select('total_questions, created_at')
        .eq('user_id', userId)
        .gte('created_at', `${dates[dates.length - 1]}T00:00:00Z`)
        .lte('created_at', `${dates[0]}T23:59:59Z`),
      
      supabase
        .from('question_attempts_v2')
        .select('created_at, session_type')
        .eq('user_id', userId)
        .gte('created_at', `${dates[dates.length - 1]}T00:00:00Z`)
        .lte('created_at', `${dates[0]}T23:59:59Z`),
      
      supabase
        .from('mock_test_results')
        .select('completed_at')
        .eq('user_id', userId)
        .gte('completed_at', `${dates[dates.length - 1]}T00:00:00Z`)
        .lte('completed_at', `${dates[0]}T23:59:59Z`)
    ]);

    // Process data by date
    const dailyActivity = dates.map(date => {
      let questionCount = 0;

      // Count quiz questions for this date
      if (quizData.data) {
        const dayQuizzes = quizData.data.filter(quiz => 
          quiz.created_at.startsWith(date)
        );
        questionCount += dayQuizzes.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0);
      }

      // Count marathon questions for this date
      if (marathonData.data) {
        const dayMarathons = marathonData.data.filter(attempt => 
          attempt.created_at.startsWith(date)
        );
        questionCount += dayMarathons.length;
      }

      // Count mock test questions for this date
      if (mockTestData.data) {
        const dayMockTests = mockTestData.data.filter(test => 
          test.completed_at.startsWith(date)
        );
        questionCount += dayMockTests.length * 154;
      }

      return {
        date,
        questionCount,
        hasActivity: questionCount >= 5
      };
    });

    return dailyActivity;
  }, []);

  const { data: streakData, refetch } = useQuery({
    queryKey: ['user-streak', userName],
    queryFn: async () => {
      console.log('Fetching optimized streak data...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return null;
      }

      // Get activity for last 7 days (enough for streak calculation and display)
      const dailyActivity = await getOptimizedDailyActivity(user.user.id, 7);
      
      const todayActivity = dailyActivity[0];
      const todayQuestionCount = todayActivity.questionCount;
      
      setQuestionsToday(todayQuestionCount);

      // Calculate current streak
      let currentStreak = 0;
      for (let i = 0; i < dailyActivity.length; i++) {
        if (dailyActivity[i].hasActivity) {
          currentStreak = i + 1;
        } else {
          break;
        }
      }

      // For longest streak, we still need to check more days
      const extendedActivity = await getOptimizedDailyActivity(user.user.id, 30);
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (const day of extendedActivity) {
        if (day.hasActivity) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Check if user has qualifying activity today (5+ questions)
      const hasQualifyingActivity = todayQuestionCount >= 5;

      // Only trigger streak update if user has qualifying activity
      if (hasQualifyingActivity) {
        try {
          console.log('Calling update_user_streak function...');
          await supabase.rpc('update_user_streak', {
            target_user_id: user.user.id
          });
          console.log('Streak update function called successfully');
        } catch (error) {
          console.warn('Error calling update_user_streak:', error);
        }
      }

      console.log('Calculated streak:', currentStreak, 'Questions today:', todayQuestionCount);
      setIsLoading(false);
      
      return { 
        current_streak: currentStreak, 
        longest_streak: longestStreak, 
        last_activity_date: null, 
        questionsToday: todayQuestionCount,
        dailyActivity: dailyActivity
      };
    },
    enabled: !!userName,
    staleTime: 30000, // Cache for 30 seconds - improved performance
    gcTime: 60000, // Keep in cache for 1 minute
    refetchInterval: 60000, // Refetch every minute - much better performance
  });

  // Check if notification should be triggered
  useEffect(() => {
    if (questionsToday >= 5 && previousQuestionsToday < 5 && previousQuestionsToday > 0) {
      // User just reached 5 questions - trigger notification
      console.log('Triggering streak notification - reached 5 questions');
      // This will be handled by the parent component
    }
    setPreviousQuestionsToday(questionsToday);
  }, [questionsToday, previousQuestionsToday]);

  // Function to manually trigger streak update
  const checkTodayActivity = async () => {
    console.log('Manually checking today activity...');
    refetch();
  };

  return {
    streakData,
    isLoading,
    refetch,
    checkTodayActivity,
    questionsToday,
    hasJustReached5Questions: questionsToday >= 5 && previousQuestionsToday < 5 && previousQuestionsToday > 0
  };
};
