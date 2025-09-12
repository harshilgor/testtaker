import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  prefetchRecentSessions, 
  transformSessions, 
  getCachedSessions, 
  cacheSessions, 
  invalidateSessionCache,
  cleanupDuplicateQuizResults,
  Session 
} from '@/services/recentSessionsService';

interface UseRecentSessionsOptions {
  userName: string;
  enabled?: boolean;
  staleTime?: number; // How long data is considered fresh (default: 5 minutes)
  cacheTime?: number; // How long data stays in cache (default: 10 minutes)
}

export const useRecentSessions = ({ 
  userName, 
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000 // 10 minutes
}: UseRecentSessionsOptions) => {
  const queryClient = useQueryClient();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get cached data for instant loading
  const cachedSessions = getCachedSessions(userName);

  // Main query for recent sessions
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['recent-sessions', userName],
    queryFn: async () => {
      console.log('🔄 Fetching recent sessions for:', userName);
      
      // Clean up any duplicate quiz results first
      cleanupDuplicateQuizResults(userName);
      
      const sessionData = await prefetchRecentSessions(userName);
      const transformedSessions = transformSessions(sessionData);
      
      // Cache the transformed sessions for instant loading next time
      cacheSessions(userName, transformedSessions);
      
      console.log('✅ Recent sessions loaded:', transformedSessions.length);
      return transformedSessions;
    },
    enabled: enabled && !!userName,
    staleTime,
    gcTime: cacheTime,
    // Use cached data as initial data for instant loading
    initialData: cachedSessions.length > 0 ? cachedSessions : undefined,
    // Keep previous data while refetching to avoid loading states
    placeholderData: (previousData) => previousData,
    // Retry failed requests
    retry: 2,
    retryDelay: 1000
  });

  // Set up real-time listeners for automatic updates
  useEffect(() => {
    if (!userName || !enabled) return;

    console.log('🔔 Setting up real-time listeners for recent sessions');

    const channel = supabase
      .channel('recent-sessions-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marathon_sessions'
        },
        () => {
          console.log('📡 Marathon session added, invalidating cache');
          invalidateSessionCache(userName);
          queryClient.invalidateQueries({ queryKey: ['recent-sessions', userName] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_results'
        },
        () => {
          console.log('📡 Quiz session added, invalidating cache');
          invalidateSessionCache(userName);
          queryClient.invalidateQueries({ queryKey: ['recent-sessions', userName] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mock_test_results'
        },
        () => {
          console.log('📡 Mock test session added, invalidating cache');
          invalidateSessionCache(userName);
          queryClient.invalidateQueries({ queryKey: ['recent-sessions', userName] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Cleaning up real-time listeners');
      supabase.removeChannel(channel);
    };
  }, [userName, enabled, queryClient]);

  // Mark initial load as complete after first successful fetch
  useEffect(() => {
    if (sessions.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [sessions.length, isInitialLoad]);

  // Pre-fetch data when user changes (for navigation)
  useEffect(() => {
    if (userName && enabled) {
      // Pre-fetch in the background if we don't have cached data
      if (cachedSessions.length === 0) {
        console.log('🚀 Pre-fetching recent sessions for new user:', userName);
        queryClient.prefetchQuery({
          queryKey: ['recent-sessions', userName],
          queryFn: async () => {
            const sessionData = await prefetchRecentSessions(userName);
            return transformSessions(sessionData);
          },
          staleTime,
          gcTime: cacheTime
        });
      }
    }
  }, [userName, enabled, queryClient, cachedSessions.length, staleTime, cacheTime]);

  return {
    sessions,
    isLoading: isLoading && !cachedSessions.length, // Only show loading if no cached data
    isError,
    error,
    isFetching,
    isInitialLoad,
    hasCachedData: cachedSessions.length > 0,
    refetch,
    // Helper to manually refresh data
    refresh: () => {
      cleanupDuplicateQuizResults(userName);
      invalidateSessionCache(userName);
      refetch();
    }
  };
};

/**
 * Hook to pre-fetch recent sessions data for a user
 * This can be called from other components to warm up the cache
 */
export const usePrefetchRecentSessions = (userName: string) => {
  const queryClient = useQueryClient();

  const prefetch = async () => {
    if (!userName) return;

    console.log('🚀 Pre-fetching recent sessions for:', userName);
    
    try {
      await queryClient.prefetchQuery({
        queryKey: ['recent-sessions', userName],
        queryFn: async () => {
          const sessionData = await prefetchRecentSessions(userName);
          const transformedSessions = transformSessions(sessionData);
          cacheSessions(userName, transformedSessions);
          return transformedSessions;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000 // 10 minutes
      });
      
      console.log('✅ Recent sessions pre-fetched successfully');
    } catch (error) {
      console.error('❌ Failed to pre-fetch recent sessions:', error);
    }
  };

  return { prefetch };
};
