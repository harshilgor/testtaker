import { useEffect } from 'react';
import { usePrefetchRecentSessions } from '@/hooks/useRecentSessions';

interface RecentSessionsPrefetcherProps {
  userName: string;
  enabled?: boolean;
}

/**
 * Component that pre-fetches recent sessions data in the background
 * This should be used in the Dashboard to warm up the cache before users
 * navigate to the Performance page for instant loading
 */
const RecentSessionsPrefetcher: React.FC<RecentSessionsPrefetcherProps> = ({ 
  userName, 
  enabled = true 
}) => {
  const { prefetch } = usePrefetchRecentSessions(userName);

  useEffect(() => {
    if (enabled && userName) {
      console.log('🚀 Recent Sessions Prefetcher: Starting background pre-fetch for', userName);
      
      // Pre-fetch with a small delay to not block the main thread
      const timer = setTimeout(() => {
        prefetch();
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [userName, enabled, prefetch]);

  // This component doesn't render anything
  return null;
};

export default RecentSessionsPrefetcher;
