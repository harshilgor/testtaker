// Quest caching service for instant loading
// This service provides caching functionality for user quests to eliminate loading states

interface CachedQuestData {
  quests: any[];
  questStats: { completed: number; total: number };
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached quest data for a user
 */
export const getCachedQuests = (userId: string): CachedQuestData | null => {
  try {
    const cacheKey = `quests-cache-${userId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const parsed: CachedQuestData = JSON.parse(cached);
      const cacheAge = Date.now() - parsed.timestamp;
      
      if (cacheAge < CACHE_DURATION) {
        console.log('🚀 Loading quests from cache (instant)');
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load cached quests:', error);
  }
  
  return null;
};

/**
 * Cache quest data for a user
 */
export const cacheQuests = (userId: string, quests: any[], questStats: { completed: number; total: number }): void => {
  try {
    const cacheKey = `quests-cache-${userId}`;
    const data: CachedQuestData = {
      quests,
      questStats,
      timestamp: Date.now()
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(data));
    console.log('💾 Cached quests data');
  } catch (error) {
    console.warn('Failed to cache quests:', error);
  }
};

/**
 * Invalidate quest cache for a user
 */
export const invalidateQuestCache = (userId: string): void => {
  try {
    const cacheKey = `quests-cache-${userId}`;
    localStorage.removeItem(cacheKey);
    console.log('🗑️ Invalidated quest cache');
  } catch (error) {
    console.warn('Failed to invalidate quest cache:', error);
  }
};

/**
 * Clear all quest caches (for cleanup)
 */
export const clearAllQuestCaches = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('quests-cache-')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 Cleared all quest caches');
  } catch (error) {
    console.warn('Failed to clear quest caches:', error);
  }
};

