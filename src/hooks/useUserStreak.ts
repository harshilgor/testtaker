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
  const [questionsToday, setQuestionsToday] = useState(0);

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

      // Get today's question count from all sources
      const today = new Date().toISOString().split('T')[0];
      
      // Count questions from different sources today
      const [quizResults, marathonAttempts, mockTests] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('total_questions')
          .eq('user_id', user.user.id)
          .gte('created_at', `${today}T00:00:00Z`)
          .lt('created_at', `${today}T23:59:59Z`),
        
        supabase
          .from('question_attempts_v2')
          .select('id')
          .eq('user_id', user.user.id)
          .eq('session_type', 'marathon')
          .gte('created_at', `${today}T00:00:00Z`)
          .lt('created_at', `${today}T23:59:59Z`),
        
        supabase
          .from('mock_test_results')
          .select('id')
          .eq('user_id', user.user.id)
          .gte('completed_at', `${today}T00:00:00Z`)
          .lt('completed_at', `${today}T23:59:59Z`)
      ]);

      let todayQuestionCount = 0;
      
      // Add quiz questions
      if (quizResults.data) {
        todayQuestionCount += quizResults.data.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0);
      }
      
      // Add marathon questions
      if (marathonAttempts.data) {
        todayQuestionCount += marathonAttempts.data.length;
      }
      
      // Add mock test questions (assuming 154 questions per SAT test)
      if (mockTests.data) {
        todayQuestionCount += mockTests.data.length * 154;
      }

      setQuestionsToday(todayQuestionCount);

      // Check if user has qualifying activity today (5+ questions)
      const hasQualifyingActivity = todayQuestionCount >= 5;

      // Track user activity for weekly display
      trackUserActivity();

      // Only trigger streak update if user has qualifying activity
      if (hasQualifyingActivity) {
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
      }

      // Fetch streak data
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.user.id)
        .single();

      if (error) {
        console.error('Error fetching streak:', error);
        
        // If no streak record exists, return default values
        if (error.code === 'PGRST116') {
          console.log('No streak record found, returning default values');
          setIsLoading(false);
          return { current_streak: 0, longest_streak: 0, last_activity_date: null, questionsToday: todayQuestionCount };
        }
        
        setIsLoading(false);
        return { current_streak: 0, longest_streak: 0, last_activity_date: null, questionsToday: todayQuestionCount };
      }

      console.log('Streak data fetched:', data);
      setIsLoading(false);
      return { ...data, questionsToday: todayQuestionCount } as UserStreak & { questionsToday: number } | null;
    },
    enabled: !!userName,
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000, // 1 second
    refetchInterval: 5000, // Refetch every 5 seconds to catch new question attempts
  });

  // Function to track user activity for weekly display
  const trackUserActivity = () => {
    const today = new Date();
    const dateString = today.toDateString();
    
    // Get existing login history
    const loginHistory = JSON.parse(localStorage.getItem('userLoginHistory') || '[]');
    
    // Check if today is already recorded
    const todayExists = loginHistory.some((login: any) => 
      new Date(login.date).toDateString() === dateString
    );
    
    if (!todayExists) {
      // Add today's login
      loginHistory.push({
        date: today.toISOString(),
        timestamp: Date.now()
      });
      
      // Keep only last 30 days of history
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredHistory = loginHistory.filter((login: any) => 
        new Date(login.date) >= thirtyDaysAgo
      );
      
      localStorage.setItem('userLoginHistory', JSON.stringify(filteredHistory));
      console.log('User activity tracked for:', dateString);
    }
  };

  // Function to manually trigger streak update
  const checkTodayActivity = async () => {
    console.log('Manually checking today activity...');
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    trackUserActivity();

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
    checkTodayActivity,
    questionsToday
  };
};
