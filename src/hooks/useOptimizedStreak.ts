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

  // Single optimized query to get all streak-related data
  const getStreakData = useCallback(async (): Promise<StreakData | null> => {
    console.log('🔄 Starting optimized streak calculation...');
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log('❌ No authenticated user found');
      return null;
    }

    const userId = user.user.id;
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    
    console.log('👤 User ID:', userId);
    console.log('📅 Today:', todayDate);

    // Get the last 30 days for comprehensive streak calculation
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      dates.push(checkDate.toISOString().split('T')[0]);
    }

    try {
      // Single batch query to get all activity data
      const [userStreakData, quizData, marathonData, mockTestData] = await Promise.all([
        // Get existing streak data from database
        supabase
          .from('user_streaks')
          .select('current_streak, longest_streak, last_activity_date')
          .eq('user_id', userId)
          .single(),
        
        // Get quiz activity
        supabase
          .from('quiz_results')
          .select('total_questions, created_at')
          .eq('user_id', userId)
          .gte('created_at', `${dates[dates.length - 1]}T00:00:00Z`)
          .lte('created_at', `${dates[0]}T23:59:59Z`),
        
        // Get marathon activity
        supabase
          .from('question_attempts_v2')
          .select('created_at, session_type')
          .eq('user_id', userId)
          .gte('created_at', `${dates[dates.length - 1]}T00:00:00Z`)
          .lte('created_at', `${dates[0]}T23:59:59Z`),
        
        // Get mock test activity
        supabase
          .from('mock_test_results')
          .select('completed_at')
          .eq('user_id', userId)
          .gte('completed_at', `${dates[dates.length - 1]}T00:00:00Z`)
          .lte('completed_at', `${dates[0]}T23:59:59Z`)
      ]);

      console.log('📊 Raw data fetched:', {
        userStreak: userStreakData.data,
        quizCount: quizData.data?.length || 0,
        marathonCount: marathonData.data?.length || 0,
        mockTestCount: mockTestData.data?.length || 0
      });

      // Process daily activity counts
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

        // Count mock test questions for this date (154 questions per test)
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

      console.log('📈 Daily activity calculated:', dailyActivity.slice(0, 7)); // Show first 7 days

      const todayActivity = dailyActivity[0];
      const todayQuestionCount = todayActivity.questionCount;

      // Calculate current streak (consecutive days from today backwards)
      // If today has no activity, start checking from yesterday
      let currentStreak = 0;
      let startIndex = todayActivity.hasActivity ? 0 : 1;
      
      for (let i = startIndex; i < dailyActivity.length; i++) {
        if (dailyActivity[i].hasActivity) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // If today has activity, add it to the streak
      if (todayActivity.hasActivity && startIndex === 0) {
        // currentStreak already includes today from the loop
      } else if (todayActivity.hasActivity && startIndex === 1) {
        // Add today's activity to the streak
        currentStreak++;
      }

      // Calculate longest streak in the 30-day period
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (const day of dailyActivity) {
        if (day.hasActivity) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Use database longest streak if it's higher than our 30-day calculation
      const dbLongestStreak = userStreakData.data?.longest_streak || 0;
      const finalLongestStreak = Math.max(longestStreak, dbLongestStreak);

      // Set debug information
      setDebugInfo({
        userId,
        todayDate,
        activitySources: {
          quizzes: quizData.data?.filter(q => q.created_at.startsWith(todayDate)).reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0) || 0,
          marathons: marathonData.data?.filter(m => m.created_at.startsWith(todayDate)).length || 0,
          mockTests: mockTestData.data?.filter(m => m.completed_at.startsWith(todayDate)).length || 0
        },
        calculatedStreak: currentStreak,
        dbStreak: userStreakData.data?.current_streak || 0
      });

      console.log('🎯 Streak calculation complete:', {
        currentStreak,
        longestStreak: finalLongestStreak,
        todayQuestions: todayQuestionCount,
        hasQualifyingActivity: todayQuestionCount >= 5
      });

      // Update database if user has qualifying activity today
      if (todayQuestionCount >= 5) {
        setIsUpdatingStreak(true);
        try {
          console.log('💾 Updating database streak...');
          await supabase.rpc('update_user_streak', {
            target_user_id: userId
          });
          console.log('✅ Database streak updated successfully');
        } catch (error) {
          console.warn('⚠️ Error updating database streak:', error);
        } finally {
          setIsUpdatingStreak(false);
        }
      }

      return {
        current_streak: currentStreak,
        longest_streak: finalLongestStreak,
        last_activity_date: todayActivity.hasActivity ? todayDate : null,
        questionsToday: todayQuestionCount,
        dailyActivity: dailyActivity.slice(0, 7) // Return last 7 days for UI
      };

    } catch (error) {
      console.error('❌ Error fetching streak data:', error);
      return null;
    }
  }, []);

  // React Query for caching and efficient data fetching
  const { data: streakData, isLoading, refetch } = useQuery({
    queryKey: ['optimized-streak', userName],
    queryFn: getStreakData,
    enabled: !!userName,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
    refetchInterval: 60000, // Refetch every minute instead of 5 seconds
  });

  // Manual trigger for immediate updates
  const triggerStreakUpdate = useCallback(async () => {
    console.log('🔄 Manual streak update triggered');
    await refetch();
    
    // Also invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['user-streak'] });
    queryClient.invalidateQueries({ queryKey: ['optimized-streak'] });
  }, [refetch, queryClient]);

  // Function to call when a question is answered
  const onQuestionAnswered = useCallback(async () => {
    console.log('📝 Question answered, updating streak...');
    
    // Wait a moment for the database to be updated, then refetch
    setTimeout(() => {
      triggerStreakUpdate();
    }, 1000);
  }, [triggerStreakUpdate]);

  return {
    streakData,
    isLoading: isLoading || isUpdatingStreak,
    refetch: triggerStreakUpdate,
    onQuestionAnswered,
    debugInfo,
    questionsToday: streakData?.questionsToday || 0,
    hasJustReached5Questions: false // This would need event tracking
  };
};