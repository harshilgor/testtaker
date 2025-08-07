
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

      // Calculate streak manually based on daily activity
      const calculatedStreak = await calculateStreakFromActivity(user.user.id);
      
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

      // Return calculated streak instead of database value for accuracy
      console.log('Calculated streak:', calculatedStreak, 'Questions today:', todayQuestionCount);
      setIsLoading(false);
      return { 
        current_streak: calculatedStreak.current_streak, 
        longest_streak: calculatedStreak.longest_streak, 
        last_activity_date: null, 
        questionsToday: todayQuestionCount 
      };
    },
    enabled: !!userName,
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000, // 1 second
    refetchInterval: 5000, // Refetch every 5 seconds to catch new question attempts
  });

  // Function to calculate streak from actual daily activity
  const calculateStreakFromActivity = async (userId: string) => {
    const days = [];
    const today = new Date();
    
    // Check last 30 days for activity
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      // Count questions for this date from all sources
      const [quizResults, marathonAttempts, mockTests] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('total_questions')
          .eq('user_id', userId)
          .gte('created_at', `${dateString}T00:00:00Z`)
          .lt('created_at', `${dateString}T23:59:59Z`),
        
        supabase
          .from('question_attempts_v2')
          .select('id')
          .eq('user_id', userId)
          .eq('session_type', 'marathon')
          .gte('created_at', `${dateString}T00:00:00Z`)
          .lt('created_at', `${dateString}T23:59:59Z`),
        
        supabase
          .from('mock_test_results')
          .select('id')
          .eq('user_id', userId)
          .gte('completed_at', `${dateString}T00:00:00Z`)
          .lt('completed_at', `${dateString}T23:59:59Z`)
      ]);

      let questionCount = 0;
      
      if (quizResults.data) {
        questionCount += quizResults.data.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0);
      }
      
      if (marathonAttempts.data) {
        questionCount += marathonAttempts.data.length;
      }
      
      if (mockTests.data) {
        questionCount += mockTests.data.length * 154;
      }

      days.push({
        date: dateString,
        hasActivity: questionCount >= 5,
        questionCount
      });
    }

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak from today backwards
    for (let i = 0; i < days.length; i++) {
      if (days[i].hasActivity) {
        if (i === 0 || (i > 0 && days[i-1].hasActivity)) {
          currentStreak = i + 1;
        } else {
          break; // Streak broken
        }
      } else {
        break; // No activity today, streak is 0
      }
    }

    // Calculate longest streak in the period
    for (let i = 0; i < days.length; i++) {
      if (days[i].hasActivity) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { current_streak: currentStreak, longest_streak: longestStreak };
  };

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
