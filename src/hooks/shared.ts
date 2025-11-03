// @ts-nocheck
// Shared custom hooks for common functionality
// This file contains reusable hooks to reduce code duplication

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  QuestionAttempt, 
  MarathonSession, 
  User, 
  SubjectType, 
  ViewMode 
} from '@/types';
import { 
  calculateAccuracy, 
  filterBySubject, 
  debounce, 
  getFromStorage, 
  setToStorage 
} from '@/utils/shared';

// ============================================================================
// DATA FETCHING HOOKS
// ============================================================================

/**
 * Hook to fetch and manage question attempts data
 */
export const useQuestionAttempts = (userName: string) => {
  return useQuery({
    queryKey: ['questionAttempts', userName],
    queryFn: async (): Promise<QuestionAttempt[]> => {
      const { data, error } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_name', userName)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userName
  });
};

/**
 * Hook to fetch and manage marathon sessions data
 */
export const useMarathonSessions = (userName: string) => {
  return useQuery({
    queryKey: ['marathonSessions', userName],
    queryFn: async (): Promise<MarathonSession[]> => {
      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_name', userName)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userName
  });
};

// ============================================================================
// PERFORMANCE CALCULATION HOOKS
// ============================================================================

/**
 * Hook to calculate performance statistics
 */
export const usePerformanceStats = (attempts: QuestionAttempt[]) => {
  return useMemo(() => {
    if (!attempts.length) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageAccuracy: 0,
        totalSessions: 0
      };
    }

    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const totalQuestions = attempts.length;
    const averageAccuracy = calculateAccuracy(correctAnswers, totalQuestions);

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      averageAccuracy,
      totalSessions: new Set(attempts.map(a => a.test)).size
    };
  }, [attempts]);
};

/**
 * Hook to calculate topic performance data
 */
export const useTopicPerformance = (
  attempts: QuestionAttempt[], 
  selectedSubject: SubjectType
) => {
  return useMemo(() => {
    const filteredAttempts = filterBySubject(attempts, selectedSubject);
    
    if (!filteredAttempts.length) return [];

    const topicStats = filteredAttempts.reduce((acc, attempt) => {
      const topic = attempt.topic || attempt.skill || 'Unknown';
      
      if (!acc[topic]) {
        acc[topic] = {
          topic,
          attempts: 0,
          correct: 0,
          totalTime: 0
        };
      }
      
      acc[topic].attempts++;
      if (attempt.isCorrect) acc[topic].correct++;
      acc[topic].totalTime += attempt.timeSpent;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(topicStats).map((stat: any) => ({
      topic: stat.topic,
      attempts: stat.attempts,
      correct: stat.correct,
      accuracy: calculateAccuracy(stat.correct, stat.attempts),
      avgTime: Math.round(stat.totalTime / stat.attempts)
    }));
  }, [attempts, selectedSubject]);
};

// ============================================================================
// UI STATE HOOKS
// ============================================================================

/**
 * Hook to manage view mode state with persistence
 */
export const useViewMode = (storageKey: string = 'viewMode', defaultValue: ViewMode = 'accuracy') => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => 
    getFromStorage(storageKey, defaultValue)
  );

  const updateViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setToStorage(storageKey, mode);
  }, [storageKey]);

  return [viewMode, updateViewMode] as const;
};

/**
 * Hook to manage subject filter state
 */
export const useSubjectFilter = (storageKey: string = 'subjectFilter') => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>(() => 
    getFromStorage(storageKey, 'all')
  );

  const updateSubject = useCallback((subject: SubjectType) => {
    setSelectedSubject(subject);
    setToStorage(storageKey, subject);
  }, [storageKey]);

  return [selectedSubject, updateSubject] as const;
};

/**
 * Hook to manage tooltip states
 */
export const useTooltipStates = () => {
  const [tooltipStates, setTooltipStates] = useState<Record<string, boolean>>({});

  const toggleTooltip = useCallback((key: string) => {
    setTooltipStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const closeAllTooltips = useCallback(() => {
    setTooltipStates({});
  }, []);

  return {
    tooltipStates,
    toggleTooltip,
    closeAllTooltips
  };
};

// ============================================================================
// DEBOUNCED HOOKS
// ============================================================================

/**
 * Hook for debounced search functionality
 */
export const useDebouncedSearch = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const debounced = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    debounced();
  }, [searchTerm, delay]);

  return [searchTerm, setSearchTerm, debouncedSearchTerm] as const;
};

// ============================================================================
// LOCAL STORAGE HOOKS
// ============================================================================

/**
 * Hook for managing localStorage with type safety
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => 
    getFromStorage(key, initialValue)
  );

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      setToStorage(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

// ============================================================================
// WINDOW SIZE HOOK
// ============================================================================

/**
 * Hook to track window size for responsive behavior
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// ============================================================================
// PERFORMANCE MONITORING HOOK
// ============================================================================

/**
 * Hook to monitor component performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

// ============================================================================
// ERROR BOUNDARY HOOK
// ============================================================================

/**
 * Hook to handle errors gracefully
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    console.error('Error caught by hook:', error);
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  };
};
