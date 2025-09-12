import { supabase } from '@/integrations/supabase/client';

export interface Session {
  id: string;
  type: 'marathon' | 'quiz' | 'mocktest';
  date: string;
  questions: number;
  accuracy: number;
  subject?: string;
  difficulty?: string;
  score?: number;
}

export interface SessionData {
  marathonSessions: any[];
  quizSessions: any[];
  mockTestSessions: any[];
  localQuizSessions: any[];
}

/**
 * Pre-fetch all recent session data for a user
 * This function loads data from all sources in parallel for optimal performance
 */
export const prefetchRecentSessions = async (userName: string): Promise<SessionData> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return {
        marathonSessions: [],
        quizSessions: [],
        mockTestSessions: [],
        localQuizSessions: []
      };
    }

    // Fetch all session types in parallel for maximum performance
    const [marathonResult, quizResult, mockTestResult] = await Promise.allSettled([
      // Marathon sessions
      supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(5), // Increased limit for better caching

      // Quiz sessions
      supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(5), // Increased limit for better caching

      // Mock test sessions
      supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false })
        .limit(3)
    ]);

    // Extract data from results, handling potential failures gracefully
    const marathonSessions = marathonResult.status === 'fulfilled' && !marathonResult.value.error 
      ? marathonResult.value.data || [] 
      : [];

    const quizSessions = quizResult.status === 'fulfilled' && !quizResult.value.error 
      ? quizResult.value.data || [] 
      : [];

    const mockTestSessions = mockTestResult.status === 'fulfilled' && !mockTestResult.value.error 
      ? mockTestResult.value.data || [] 
      : [];

    // Load local quiz sessions (for offline/fallback data)
    let localQuizSessions: any[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      localQuizSessions = (stored || []).filter((r: any) => r.userName === userName);
    } catch (e) {
      console.warn('Failed to parse local quiz results', e);
    }

    return {
      marathonSessions,
      quizSessions,
      mockTestSessions,
      localQuizSessions
    };
  } catch (error) {
    console.error('Error prefetching recent sessions:', error);
    return {
      marathonSessions: [],
      quizSessions: [],
      mockTestSessions: [],
      localQuizSessions: []
    };
  }
};

/**
 * Transform raw session data into the unified Session format
 */
export const transformSessions = (sessionData: SessionData): Session[] => {
  const sessions: Session[] = [];
  const seenIds = new Set<string>();
  const seenSessions = new Set<string>(); // Track sessions by content to prevent duplicates

  console.log('🔄 Transforming sessions:', {
    marathon: sessionData.marathonSessions.length,
    quiz: sessionData.quizSessions.length,
    mock: sessionData.mockTestSessions.length,
    local: sessionData.localQuizSessions.length
  });

  // Add marathon sessions
  sessionData.marathonSessions.forEach(session => {
    if (!seenIds.has(session.id)) {
      seenIds.add(session.id);
      sessions.push({
        id: session.id,
        type: 'marathon',
        date: session.created_at,
        questions: session.total_questions || 0,
        accuracy: session.total_questions > 0 ? 
          Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 0,
        difficulty: session.difficulty || 'mixed'
      });
    }
  });

  // Add quiz sessions (DB) - prioritize database results
  sessionData.quizSessions.forEach(session => {
    if (!seenIds.has(session.id)) {
      seenIds.add(session.id);
      const accuracy = session.total_questions > 0 ? 
        Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 
        Math.round(session.score_percentage || 0);
      
      // Create a unique key for this session to prevent duplicates
      const sessionKey = `${session.type}-${session.total_questions}-${accuracy}-${new Date(session.created_at).toISOString().split('T')[0]}`;
      
      if (!seenSessions.has(sessionKey)) {
        seenSessions.add(sessionKey);
        sessions.push({
          id: session.id,
          type: 'quiz',
          date: session.created_at,
          questions: session.total_questions || 0,
          accuracy,
          subject: session.subject || 'Mixed'
        });
      } else {
        console.log('🚫 Skipping duplicate quiz session:', sessionKey);
      }
    }
  });

  // Add mock test sessions (DB)
  sessionData.mockTestSessions.forEach(session => {
    if (!seenIds.has(session.id)) {
      seenIds.add(session.id);
      const accuracy = Math.round((session.total_score / 1600) * 100);
      sessions.push({
        id: session.id,
        type: 'mocktest',
        date: session.completed_at,
        questions: 154,
        accuracy,
        score: session.total_score || 0
      });
    }
  });

  // Add local quiz sessions as fallback ONLY if not already in database
  // This prevents duplicates when the same quiz is saved both locally and in DB
  sessionData.localQuizSessions.forEach((r: any, idx: number) => {
    const localId = r.id || `local-quiz-${idx}-${r.date}`;
    
    // Check if this local quiz already exists in database results
    const existsInDB = sessionData.quizSessions.some(dbSession => {
      // Compare by date, questions count, and accuracy to detect duplicates
      const dbDate = new Date(dbSession.created_at).toISOString().split('T')[0];
      const localDate = new Date(r.date).toISOString().split('T')[0];
      const dbAccuracy = dbSession.total_questions > 0 ? 
        Math.round(((dbSession.correct_answers || 0) / dbSession.total_questions) * 100) : 
        Math.round(dbSession.score_percentage || 0);
      const localAccuracy = r.questions?.length > 0 ? 
        Math.round((r.answers.filter((ans: any, i: number) => ans === r.questions[i]?.correctAnswer).length / r.questions.length) * 100) : 0;
      
      return dbDate === localDate && 
             dbSession.total_questions === (r.questions?.length || 0) && 
             Math.abs(dbAccuracy - localAccuracy) <= 5; // Allow 5% tolerance for accuracy
    });

    // Only add local quiz if it doesn't exist in database and not already seen
    if (!existsInDB && !seenIds.has(localId)) {
      seenIds.add(localId);
      const correct = r.answers.filter((ans: any, i: number) => ans === r.questions[i]?.correctAnswer).length;
      const total = r.questions?.length || 0;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      // Create a unique key for this session to prevent duplicates
      const sessionKey = `quiz-${total}-${accuracy}-${new Date(r.date).toISOString().split('T')[0]}`;
      
      if (!seenSessions.has(sessionKey)) {
        seenSessions.add(sessionKey);
        sessions.push({
          id: localId,
          type: 'quiz',
          date: r.date,
          questions: total,
          accuracy,
          subject: r.subject || 'Mixed'
        });
      } else {
        console.log('🚫 Skipping duplicate local quiz session:', sessionKey);
      }
    }
  });

  // Sort by date (most recent first) and take top 10
  const finalSessions = sessions
    .filter(s => !!s.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  console.log('✅ Final sessions after deduplication:', finalSessions.length);
  return finalSessions;
};

/**
 * Get cached session data from localStorage for instant loading
 */
export const getCachedSessions = (userName: string): Session[] => {
  try {
    const cacheKey = `recent-sessions-cache-${userName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache is valid for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Failed to load cached sessions', e);
  }
  return [];
};

/**
 * Cache session data in localStorage for instant loading
 */
export const cacheSessions = (userName: string, sessions: Session[]): void => {
  try {
    const cacheKey = `recent-sessions-cache-${userName}`;
    const cacheData = {
      data: sessions,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (e) {
    console.warn('Failed to cache sessions', e);
  }
};

/**
 * Invalidate cached session data
 */
export const invalidateSessionCache = (userName: string): void => {
  try {
    const cacheKey = `recent-sessions-cache-${userName}`;
    localStorage.removeItem(cacheKey);
  } catch (e) {
    console.warn('Failed to invalidate session cache', e);
  }
};

/**
 * Clean up duplicate quiz results from localStorage
 */
export const cleanupDuplicateQuizResults = (userName: string): void => {
  try {
    const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const userQuizzes = (stored || []).filter((r: any) => r.userName === userName);
    
    // Group by date and questions count to find duplicates
    const grouped = new Map<string, any[]>();
    userQuizzes.forEach((quiz: any) => {
      const key = `${new Date(quiz.date).toISOString().split('T')[0]}-${quiz.questions?.length || 0}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(quiz);
    });
    
    // Keep only the most recent quiz for each group
    const cleanedQuizzes: any[] = [];
    grouped.forEach((quizzes) => {
      if (quizzes.length > 1) {
        // Sort by date and keep the most recent
        quizzes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        cleanedQuizzes.push(quizzes[0]);
        console.log(`🧹 Removed ${quizzes.length - 1} duplicate quiz results`);
      } else {
        cleanedQuizzes.push(quizzes[0]);
      }
    });
    
    // Update localStorage with cleaned data
    const otherUsersQuizzes = (stored || []).filter((r: any) => r.userName !== userName);
    const finalQuizzes = [...otherUsersQuizzes, ...cleanedQuizzes];
    localStorage.setItem('quizResults', JSON.stringify(finalQuizzes));
    
    console.log(`✅ Cleaned up quiz results for ${userName}: ${userQuizzes.length} → ${cleanedQuizzes.length}`);
  } catch (e) {
    console.warn('Failed to cleanup duplicate quiz results', e);
  }
};

/**
 * Global cleanup function for immediate duplicate removal
 * Can be called from browser console: window.cleanupDuplicateSessions()
 */
if (typeof window !== 'undefined') {
  (window as any).cleanupDuplicateSessions = (userName?: string) => {
    const currentUser = userName || localStorage.getItem('userName') || 'Student';
    console.log('🧹 Starting immediate cleanup for user:', currentUser);
    cleanupDuplicateQuizResults(currentUser);
    invalidateSessionCache(currentUser);
    console.log('✅ Cleanup complete! Refresh the page to see changes.');
  };
}
