import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCachedQuests, cacheQuests, invalidateQuestCache } from '@/services/questCacheService';

interface QuestStats {
  completed: number;
  total: number;
}

interface UseQuestsOptions {
  userId: string;
  enabled?: boolean;
}

export const useQuests = ({ userId, enabled = true }: UseQuestsOptions) => {
  const [quests, setQuests] = useState<any[]>([]);
  const [questStats, setQuestStats] = useState<QuestStats>({ completed: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(false);

  // Generate dynamic quests (founder-designed quests)
  const generateDynamicQuests = useCallback(() => {
    return [
      {
        id: 'visit-leaderboard',
        title: 'Visit the Leaderboard',
        description: 'Check out the leaderboard to see how you rank',
        points: 25,
        progress: 0,
        progressText: '0/1 visits',
        topic: 'Leaderboard',
        subject: 'general',
        completed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        questionCount: 1
      },
      {
        id: 'complete-5-questions',
        title: 'Complete 5 Questions',
        description: 'Answer 5 questions correctly',
        points: 15,
        progress: 0,
        progressText: '0/5 questions',
        topic: 'General Practice',
        subject: 'both',
        completed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        questionCount: 5
      },
      {
        id: 'math-practice-10',
        title: 'Math Practice - 10 Questions',
        description: 'Complete 10 math questions',
        points: 30,
        progress: 0,
        progressText: '0/10 questions',
        topic: 'Math',
        subject: 'math',
        completed: false,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        questionCount: 10
      }
    ];
  }, []);

  // Fetch fresh quest data - matches the logic from QuestsModal
  const fetchFreshQuests = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Check for completed quests in the database - get full completion data
      const { data: completedQuestsData, error: completedError } = await supabase
        .from('quest_completions')
        .select('quest_id, points_awarded, completed_at')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false });

      if (completedError) {
        console.error('Error fetching completed quests:', completedError);
      }

      const completedQuestIds = new Set(completedQuestsData?.map(q => q.quest_id) || []);

      // Always show founder-designed quests for ALL users (matching QuestsModal)
      const founderQuests = [
        {
          id: 'welcome-quest',
          title: "Welcome to the platform! I'm Harshil, the founder 🚀",
          description: "I encourage you to contact me directly at harshilgor06@gmail.com with any feedback. I hope you love it LETS GET THAT 1600 !!!! 😎🙏",
          topic: "welcome",
          difficulty: 'Easy',
          type: 'daily',
          target: 1,
          progress: 0,
          points: 50,
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          subject: 'general',
          accuracy: 0
        },
        {
          id: 'leaderboard-quest',
          title: "Visit the Leaderboard 📈",
          description: "See how you compare with other SAT students and track your progress against the community.",
          topic: "leaderboard",
          difficulty: 'Easy',
          type: 'daily',
          target: 1,
          progress: 0,
          points: 25,
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          subject: 'general',
          accuracy: 0,
          feature: 'leaderboard'
        },
        {
          id: 'practice-quest',
          title: "Explore the Practice Tab 📕",
          description: "Navigate to the Practice section on the Home page to customize and engage with various question styles.",
          topic: "practice",
          difficulty: 'Easy',
          type: 'daily',
          target: 1,
          progress: 0,
          points: 30,
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          subject: 'general',
          accuracy: 0
        },
        {
          id: 'custom-quiz-quest',
          title: "Create Your First Custom Quiz 💬",
          description: "Use the Practice tool to generate a short, 10-question quiz on any topic of your choice.",
          topic: "custom_quiz",
          difficulty: 'Medium',
          type: 'daily',
          target: 10,
          progress: 0,
          points: 40,
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          subject: 'both',
          accuracy: 0
        },
        {
          id: 'learn-quest',
          title: "Review Your Errors on the Learn Page 📜",
          description: "Visit the Learn section to review every question you have answered incorrectly across the platform.",
          topic: "learn",
          difficulty: 'Easy',
          type: 'daily',
          target: 1,
          progress: 0,
          points: 35,
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          subject: 'general',
          accuracy: 0
        },
        {
          id: 'performance-quest',
          title: "Analyze Your Performance 📊",
          description: "Access the dedicated Performance page to view detailed analytics and metrics on your progress.",
          topic: "performance",
          difficulty: 'Easy',
          type: 'daily',
          target: 1,
          progress: 0,
          points: 30,
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          subject: 'general',
          accuracy: 0
        },
        {
          id: 'mock-test-explore-quest',
          title: "Explore the Mock Test Section 📚",
          description: "View the available full-length practice tests and understand the testing interface.",
          topic: "mock_test_explore",
          difficulty: 'Easy',
          type: 'daily',
          target: 1,
          progress: 0,
          points: 25,
          completed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          subject: 'general',
          accuracy: 0
        },
        {
          id: 'mock-test-complete-quest',
          title: "Complete a Full Mock Test 📖",
          description: "Schedule and take one of the available mock exams to get a baseline score.",
          topic: "mock_test_complete",
          difficulty: 'Hard',
          type: 'weekly',
          target: 1,
          progress: 0,
          points: 60,
          completed: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subject: 'both',
          accuracy: 0
        },
        {
          id: 'ai-analysis-quest',
          title: "Activate AI Weakness Analysis 😎",
          description: "Go to the Practice page, check your personalized AI Weakness Analysis, and complete the recommended quiz that targets your weakest area.",
          topic: "ai_analysis",
          difficulty: 'Medium',
          type: 'weekly',
          target: 1,
          progress: 0,
          points: 45,
          completed: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subject: 'both',
          accuracy: 0
        }
      ];

      // Load database quests (daily/monthly) - also check completion status from user_quests
      const { data: dbQuests, error: dbError } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user.user.id)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Error loading database quests:', dbError);
      }

      // Get completed quest IDs from user_quests table (for database quests)
      const completedDbQuestIds = new Set(
        (dbQuests || []).filter(q => q.completed).map(q => q.id.toString())
      );

      // Combine all completed quest IDs
      const allCompletedQuestIds = new Set([
        ...Array.from(completedQuestIds),
        ...Array.from(completedDbQuestIds)
      ]);

      // Convert database quests to Quest format - only include non-completed quests
      const databaseQuests = (dbQuests || [])
        .filter(dbQuest => !dbQuest.completed) // Filter out completed database quests
        .map(dbQuest => ({
          id: dbQuest.id.toString(),
          title: dbQuest.quest_title || 'Untitled Quest',
          description: dbQuest.quest_description || 'No description available',
          topic: dbQuest.target_topic || 'general',
          difficulty: (dbQuest.difficulty === 'Easy' || dbQuest.difficulty === 'Medium' || dbQuest.difficulty === 'Hard') 
            ? dbQuest.difficulty as 'Easy' | 'Medium' | 'Hard'
            : 'Medium',
          type: (dbQuest.quest_type === 'daily' || dbQuest.quest_type === 'weekly') 
            ? dbQuest.quest_type as 'daily' | 'weekly'
            : 'daily' as 'daily' | 'weekly',
          target: dbQuest.target_count || 1,
          progress: dbQuest.current_progress || 0,
          points: dbQuest.points_reward || 10,
          completed: false, // Already filtered above
          expiresAt: new Date(dbQuest.expires_at),
          subject: 'general',
          accuracy: 0
        }));

      // Update founder quest completion status
      const founderQuestsWithCompletion = founderQuests.map(quest => ({
        ...quest,
        completed: allCompletedQuestIds.has(quest.id),
        progress: allCompletedQuestIds.has(quest.id) ? quest.target : 0
      }));

      // Combine all quests (founder + database) and filter to only active (non-completed, non-expired)
      const allQuests = [...founderQuestsWithCompletion, ...databaseQuests];
      const activeQuests = allQuests.filter(q => {
        // Only include non-completed quests
        if (q.completed) return false;
        // Also filter out expired quests
        if (q.expiresAt && new Date(q.expiresAt) < new Date()) return false;
        return true;
      });

      // Calculate stats
      const completedCount = allQuests.filter(q => q.completed).length;
      const totalCount = allQuests.length;
      
      const newQuestStats = { completed: completedCount, total: totalCount };

      // Update state with only active quests for Live Quests display
      setQuests(activeQuests);
      setQuestStats(newQuestStats);
      setHasCachedData(false);

      // Cache the data
      cacheQuests(userId, activeQuests, newQuestStats);

      console.log('✅ Quests loaded and cached - Active:', activeQuests.length, 'Completed:', completedCount);
    } catch (error) {
      console.error('Error fetching fresh quests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load quests with caching
  const loadQuests = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      setIsLoading(true);

      // Try to load from cache first
      const cachedData = getCachedQuests(userId);
      if (cachedData) {
        setQuests(cachedData.quests);
        setQuestStats(cachedData.questStats);
        setHasCachedData(true);
        setIsLoading(false);
        
        // Start background refresh
        setTimeout(() => fetchFreshQuests(), 100);
        return;
      }

      // No cache, fetch fresh data
      await fetchFreshQuests();
    } catch (error) {
      console.error('Error loading quests:', error);
      setIsLoading(false);
    }
  }, [userId, enabled, fetchFreshQuests]);

  // Refresh quests (invalidate cache and reload)
  const refreshQuests = useCallback(() => {
    invalidateQuestCache(userId);
    loadQuests();
  }, [loadQuests, userId]);

  // Load quests on mount
  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // Listen for quest completion events to refresh quests
  useEffect(() => {
    const handleQuestCompleted = () => {
      console.log('🔄 useQuests: Refreshing quests due to quest-completed event');
      refreshQuests();
    };
    
    window.addEventListener('quest-completed', handleQuestCompleted);
    window.addEventListener('quest-list-updated', handleQuestCompleted);
    
    return () => {
      window.removeEventListener('quest-completed', handleQuestCompleted);
      window.removeEventListener('quest-list-updated', handleQuestCompleted);
    };
  }, [refreshQuests]);

  return {
    quests,
    questStats,
    isLoading: isLoading && !hasCachedData, // Only show loading if no cached data
    hasCachedData,
    refreshQuests,
    loadQuests
  };
};

