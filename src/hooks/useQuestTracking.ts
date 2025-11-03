import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { questTrackingService, QuestEventType } from '@/services/questTrackingService';
import { useSimpleToast } from '@/components/ui/simple-toast';

/**
 * Hook to automatically track user actions and complete quests
 */
export const useQuestTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useSimpleToast();

  // Preload quest cache when user is available
  useEffect(() => {
    if (user?.id) {
      questTrackingService.preloadQuestCache(user.id).catch(err => {
        console.error('Error preloading quest cache:', err);
      });
    }
  }, [user?.id]);

  /**
   * Track navigation events and check for quest completions
   * NOW INSTANT - uses cached quests for 0ms latency
   */
  const trackNavigation = useCallback(async (pathname: string) => {
    if (!user?.id) return;

    try {
      const result = await questTrackingService.trackNavigation(pathname, user.id);
      
      // INSTANT notification (0ms latency)
      if (result.completedQuests.length > 0) {
        const totalPoints = result.pointsAwarded;
        const questNames = result.completedQuests.map(q => q.title || q.quest_title || 'Quest').join(', ');
        
        showToast({
          title: 'Quest Completed! 🎉',
          description: `Completed: ${questNames}. Earned ${totalPoints} points!`,
          type: 'success',
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Error tracking navigation:', error);
    }
  }, [user, showToast]);

  /**
   * Track a specific event and check for quest completions
   */
  const trackEvent = useCallback(async (eventType: QuestEventType, metadata?: Record<string, any>) => {
    if (!user?.id) return;

    try {
      const event = {
        type: eventType,
        userId: user.id,
        timestamp: new Date(),
        metadata
      };

      console.log('📡 Tracking event:', eventType, 'for user:', user.id);
      const result = await questTrackingService.checkAndCompleteQuests(event);
      console.log('📊 Quest completion result:', result);
      
      if (result.completedQuests.length > 0) {
        const totalPoints = result.pointsAwarded;
        const questNames = result.completedQuests.map(q => q.title || q.quest_title || 'Quest').join(', ');
        
        console.log(`🎉 Quest completed! ${questNames} - ${totalPoints} points`);
        
        showToast({
          title: 'Quest Completed! 🎉',
          description: `Completed: ${questNames}. Earned ${totalPoints} points!`,
          type: 'success',
          duration: 6000
        });
        
        // Trigger quest refresh by dispatching event
        window.dispatchEvent(new CustomEvent('quest-completed', { detail: { questIds: result.completedQuests.map(q => q.id || q.quest_id) } }));
      } else {
        console.log('ℹ️ No quests completed for this event');
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user, showToast]);

  // Track navigation on route change
  useEffect(() => {
    if (location.pathname && user?.id) {
      trackNavigation(location.pathname);
    }
  }, [location.pathname, user?.id, trackNavigation]);

  return {
    trackEvent,
    trackNavigation
  };
};
