// @ts-nocheck
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useData } from '@/contexts/DataContext';

interface UseHasSolvedQuestionsReturn {
  hasSolvedQuestions: boolean;
  loading: boolean;
}

export const useHasSolvedQuestions = (user: User | null): UseHasSolvedQuestionsReturn => {
  const [hasSolvedQuestions, setHasSolvedQuestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const { quizResults, marathonSessions, mockTests } = useData();

  useEffect(() => {
    if (user) {
      // Check if user has any quiz results, marathon sessions, or mock tests
      const hasQuizResults = quizResults && quizResults.length > 0;
      const hasMarathonSessions = marathonSessions && marathonSessions.length > 0;
      const hasMockTests = mockTests && mockTests.length > 0;
      
      // Also check localStorage for any completed sessions
      const hasLocalStorageData = localStorage.getItem(`quiz_results_${user.id}`) || 
                                 localStorage.getItem(`marathon_sessions_${user.id}`) ||
                                 localStorage.getItem(`mock_tests_${user.id}`);
      
      const hasAnyActivity = hasQuizResults || hasMarathonSessions || hasMockTests || hasLocalStorageData;
      
      setHasSolvedQuestions(hasAnyActivity);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, quizResults, marathonSessions, mockTests]);

  return {
    hasSolvedQuestions,
    loading
  };
};
