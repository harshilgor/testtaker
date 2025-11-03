import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Quest = Tables<'user_quests'>;

export type QuestEventType = 
  | 'visit_leaderboard'
  | 'visit_performance'
  | 'visit_learn'
  | 'visit_mastery'
  | 'visit_mock_test'
  | 'complete_quiz'
  | 'complete_mock_test'
  | 'complete_marathon'
  | 'complete_questions'
  | 'solve_mistakes'
  | 'target_weakness'
  | 'first_quiz'
  | 'first_mock_test';

export interface QuestEvent {
  type: QuestEventType;
  metadata?: Record<string, any>;
  userId: string;
  timestamp: Date;
}

class QuestTrackingService {
  // In-memory cache for instant quest matching (0 latency)
  private questCache: Map<string, {
    activeQuests: any[];
    completedQuestIds: Set<string>;
    founderQuests: any[];
    lastUpdated: number;
  }> = new Map();

  // Cache duration: 2 minutes
  private readonly CACHE_DURATION = 2 * 60 * 1000;

  /**
   * Pre-load quest cache for a user (called on app start/login)
   */
  async preloadQuestCache(userId: string): Promise<void> {
    try {
      // Fetch active quests and completed quest IDs in parallel
      const [activeQuestsResult, completedQuestsResult] = await Promise.all([
        supabase
          .from('user_quests')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', false)
          .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString()),
        supabase
          .from('quest_completions')
          .select('quest_id')
          .eq('user_id', userId)
      ]);

      const activeQuests = activeQuestsResult.data || [];
      const completedQuestIds = new Set(completedQuestsResult.data?.map(q => q.quest_id) || []);

      // Founder quests (always available)
      const founderQuests = [
        {
          id: 'leaderboard-quest',
          title: "Visit the Leaderboard 📈",
          topic: "leaderboard",
          points: 25,
          feature: 'leaderboard'
        },
        {
          id: 'performance-quest',
          title: "Analyze Your Performance 📊",
          topic: "performance",
          points: 30,
          feature: 'performance'
        },
        {
          id: 'learn-quest',
          title: "Review Your Errors on the Learn Page 📜",
          topic: "learn",
          points: 35,
          feature: 'learn'
        },
        {
          id: 'welcome-quest',
          title: "Welcome to the platform! I'm Harshil, the founder 🚀",
          topic: "welcome",
          points: 50,
          feature: 'welcome'
        },
        {
          id: 'practice-quest',
          title: "Explore the Practice Tab 📕",
          topic: "practice",
          points: 30,
          feature: 'practice'
        },
        {
          id: 'custom-quiz-quest',
          title: "Create Your First Custom Quiz 💬",
          topic: "custom_quiz",
          points: 40,
          feature: 'custom_quiz'
        },
        {
          id: 'mock-test-explore-quest',
          title: "Explore the Mock Test Section 📚",
          topic: "mock_test_explore",
          points: 25,
          feature: 'mock_test'
        },
        {
          id: 'mock-test-complete-quest',
          title: "Complete a Full Mock Test 📖",
          topic: "mock_test_complete",
          points: 60,
          feature: 'mock_test'
        },
        {
          id: 'ai-analysis-quest',
          title: "Activate AI Weakness Analysis 😎",
          topic: "ai_analysis",
          points: 45,
          feature: 'ai_analysis'
        }
      ];

      this.questCache.set(userId, {
        activeQuests,
        completedQuestIds,
        founderQuests,
        lastUpdated: Date.now()
      });

      console.log('✅ Quest cache preloaded for user:', userId);
    } catch (error) {
      console.error('Error preloading quest cache:', error);
    }
  }

  /**
   * Get cached quests for instant matching (0 latency)
   */
  private getCachedQuests(userId: string): {
    activeQuests: any[];
    completedQuestIds: Set<string>;
    founderQuests: any[];
  } | null {
    const cached = this.questCache.get(userId);
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.lastUpdated > this.CACHE_DURATION) {
      this.questCache.delete(userId);
      return null;
    }
    
    return cached;
  }

  /**
   * Check if an event matches any active quest and auto-complete if conditions are met
   * NOW OPTIMIZED FOR INSTANT (0ms) DETECTION using in-memory cache
   */
  async checkAndCompleteQuests(event: QuestEvent): Promise<{
    completedQuests: Quest[];
    pointsAwarded: number;
  }> {
    try {
      // STEP 1: INSTANT CHECK (0ms latency) - Use cached quests
      const cached = this.getCachedQuests(event.userId);
      
      if (!cached) {
        // Cache miss - preload and retry
        await this.preloadQuestCache(event.userId);
        const retryCached = this.getCachedQuests(event.userId);
        if (!retryCached) {
          console.warn('⚠️ Quest cache unavailable, falling back to database');
          return { completedQuests: [], pointsAwarded: 0 };
        }
        return this.checkQuestsInstantly(event, retryCached);
      }

      // INSTANT CHECK - No database calls, 0ms latency
      const result = await this.checkQuestsInstantly(event, cached);

      // STEP 2: Update database in background (non-blocking)
      if (result.completedQuests.length > 0) {
        // Fire and forget - don't wait for database updates
        this.updateDatabaseInBackground(event.userId, result.completedQuests).catch(err => {
          console.error('Background database update failed (non-critical):', err);
        });
      }

      return result;
    } catch (error) {
      console.error('Error checking and completing quests:', error);
      return { completedQuests: [], pointsAwarded: 0 };
    }
  }

  /**
   * INSTANT quest checking using cached data (0ms latency)
   */
  private async checkQuestsInstantly(event: QuestEvent, cached: {
    activeQuests: any[];
    completedQuestIds: Set<string>;
    founderQuests: any[];
  }): Promise<{
    completedQuests: Quest[];
    pointsAwarded: number;
  }> {
    const completedQuests: Quest[] = [];
    let totalPoints = 0;

    // Check founder quests instantly (no database call)
    for (const founderQuest of cached.founderQuests) {
      if (cached.completedQuestIds.has(founderQuest.id)) continue;
      
      if (this.matchesQuest(founderQuest as any, event)) {
        completedQuests.push({
          id: founderQuest.id,
          title: founderQuest.title,
          completed: true,
          points: founderQuest.points,
        } as any);
        totalPoints += founderQuest.points;
        
        // Update cache immediately to mark as completed (optimistic update)
        cached.completedQuestIds.add(founderQuest.id);
      }
    }

    // Check database quests instantly (no database call)
    for (const quest of cached.activeQuests) {
      if (this.matchesQuest(quest, event)) {
        const points = quest.points_reward || quest.points || 0;
        completedQuests.push({ ...quest, completed: true } as any);
        totalPoints += points;
        
        // Update cache immediately - remove from active quests (optimistic update)
        const index = cached.activeQuests.findIndex(q => q.id === quest.id);
        if (index !== -1) {
          cached.activeQuests.splice(index, 1);
        }
        cached.completedQuestIds.add(quest.id.toString());
      }
    }

    // INSTANT UI UPDATE - Dispatch event immediately (0ms) with full details
    if (completedQuests.length > 0) {
      console.log(`⚡ INSTANT quest completion detected: ${completedQuests.length} quests`);
      window.dispatchEvent(new CustomEvent('quest-completed', { 
        detail: { 
          questIds: completedQuests.map(q => q.id || q.quest_id),
          completedQuests: completedQuests,
          pointsAwarded: totalPoints
        } 
      }));
    }

    return {
      completedQuests,
      pointsAwarded: totalPoints
    };
  }

  /**
   * Update database in background (non-blocking, doesn't delay notification)
   */
  private async updateDatabaseInBackground(userId: string, completedQuests: Quest[]): Promise<void> {
    for (const quest of completedQuests) {
      // Check if it's a founder quest or database quest
      const isFounderQuest = typeof quest.id === 'string' && quest.id.includes('-quest');
      
      if (isFounderQuest) {
        // Update founder quest completion
        await supabase
          .from('quest_completions')
          .insert({
            user_id: userId,
            quest_id: quest.id,
            points_awarded: quest.points || 0,
            completed_at: new Date().toISOString()
          })
          .catch(err => {
            if (err.code !== '23505') {
              console.error('Error recording founder quest:', err);
            }
          });

        // Award points
        await supabase.rpc('increment_user_points', {
          p_points: quest.points || 0,
          p_user_id: userId
        }).catch(err => console.error('Error awarding points:', err));
      } else {
        // Update database quest
        await supabase
          .from('user_quests')
          .update({ 
            completed: true,
            current_progress: (quest as any).target_count || (quest as any).target || 1,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', quest.id)
          .catch(err => console.error('Error updating quest:', err));

        const points = (quest as any).points_reward || quest.points || 0;
        
        // Award points
        await supabase.rpc('increment_user_points', {
          p_points: points,
          p_user_id: userId
        }).catch(err => console.error('Error awarding points:', err));

        // Record completion
        await supabase
          .from('quest_completions')
          .insert({
            user_id: userId,
            quest_id: quest.id.toString(),
            points_awarded: points,
            completed_at: new Date().toISOString()
          })
          .catch(err => {
            if (err.code !== '23505') {
              console.error('Error recording completion:', err);
            }
          });
      }
    }

    // Refresh cache after database updates
    await this.preloadQuestCache(userId);
  }


  /**
   * Check if an event matches a quest's requirements
   */
  private matchesQuest(quest: Quest | any, event: QuestEvent): boolean {
    const questTopic = quest.topic?.toLowerCase() || '';
    const questFeature = quest.feature?.toLowerCase() || '';
    const questTitle = quest.title?.toLowerCase() || quest.quest_title?.toLowerCase() || '';
    
    // Map quest topics/features to event types
    switch (event.type) {
      case 'visit_leaderboard':
        return questTopic.includes('leaderboard') || 
               questFeature === 'leaderboard' ||
               questTitle.includes('leaderboard');
      
      case 'visit_performance':
        return questTopic.includes('performance') || 
               questFeature === 'performance' ||
               questTitle.includes('performance');
      
      case 'visit_learn':
        return questTopic.includes('learn') || 
               questFeature === 'learn' ||
               questTitle.includes('learn');
      
      case 'visit_mastery':
        return questTopic.includes('mastery') || 
               questFeature === 'mastery' ||
               questTitle.includes('mastery');
      
      case 'complete_quiz':
        return questTopic.includes('quiz') || 
               questFeature === 'quiz' ||
               questTitle.includes('quiz');
      
      case 'complete_mock_test':
        return questTopic.includes('mock') || 
               questTopic.includes('test') ||
               questFeature === 'mock_test' ||
               questTitle.includes('mock') ||
               questTitle.includes('mock test');
      
      case 'visit_mock_test':
        return questTopic.includes('mock') || 
               questTopic.includes('test') ||
               questFeature === 'mock_test' ||
               questTitle.includes('mock') ||
               questTitle.includes('Mock Test');
      
      case 'target_weakness':
        return questTopic.includes('weakness') || 
               questFeature === 'target_weakness' ||
               questTitle.includes('weakness');
      
      default:
        return false;
    }
  }

  /**
   * Track a navigation event (page visit)
   */
  async trackNavigation(page: string, userId: string): Promise<{ completedQuests: Quest[]; pointsAwarded: number }> {
    const eventTypeMap: Record<string, QuestEventType> = {
      '/leaderboard': 'visit_leaderboard',
      '/performance': 'visit_performance',
      '/learn': 'visit_learn',
      '/mastery': 'visit_mastery',
      '/sat-mock-test': 'visit_mock_test',
    };

    const eventType = eventTypeMap[page];
    if (!eventType) {
      return { completedQuests: [], pointsAwarded: 0 };
    }

    const event: QuestEvent = {
      type: eventType,
      userId,
      timestamp: new Date(),
    };

    return await this.checkAndCompleteQuests(event);
  }

  /**
   * Track quiz completion
   */
  async trackQuizCompletion(userId: string, metadata?: Record<string, any>): Promise<void> {
    const event: QuestEvent = {
      type: 'complete_quiz',
      userId,
      timestamp: new Date(),
      metadata,
    };

    await this.checkAndCompleteQuests(event);
  }
}

export const questTrackingService = new QuestTrackingService();
