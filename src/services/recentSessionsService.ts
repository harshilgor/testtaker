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

  // Add marathon sessions
  sessionData.marathonSessions.forEach(session => {
    sessions.push({
      id: session.id,
      type: 'marathon',
      date: session.created_at,
      questions: session.total_questions || 0,
      accuracy: session.total_questions > 0 ? 
        Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 0,
      difficulty: session.difficulty || 'mixed'
    });
  });

  // Add quiz sessions (DB)
  sessionData.quizSessions.forEach(session => {
    sessions.push({
      id: session.id,
      type: 'quiz',
      date: session.created_at,
      questions: session.total_questions || 0,
      accuracy: session.total_questions > 0 ? 
        Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : Math.round(session.score_percentage || 0),
      subject: session.subject || 'Mixed'
    });
  });

  // Add mock test sessions (DB)
  sessionData.mockTestSessions.forEach(session => {
    const accuracy = Math.round((session.total_score / 1600) * 100);
    sessions.push({
      id: session.id,
      type: 'mocktest',
      date: session.completed_at,
      questions: 154,
      accuracy,
      score: session.total_score || 0
    });
  });

  // Add local quiz sessions as fallback
  sessionData.localQuizSessions.forEach((r: any, idx: number) => {
    const correct = r.answers.filter((ans: any, i: number) => ans === r.questions[i]?.correctAnswer).length;
    const total = r.questions?.length || 0;
    sessions.push({
      id: r.id || `local-quiz-${idx}-${r.date}`,
      type: 'quiz',
      date: r.date,
      questions: total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      subject: r.subject || 'Mixed'
    });
  });

  // Sort by date (most recent first) and take top 10
  return sessions
    .filter(s => !!s.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
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
