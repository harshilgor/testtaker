// Consolidated data service for all question-related operations
// This file eliminates duplication across multiple question services

import { 
  QuestionAttempt, 
  MarathonSession, 
  DatabaseQuestion, 
  GeneratedQuestion,
  QuestionGenerationRequest,
  QuestionGenerationResponse,
  InfiniteQuestionRequest
} from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { openaiQuestionService } from '@/services/openaiQuestionService';
import { geminiQuestionService } from '@/services/geminiQuestionService';

// ============================================================================
// QUESTION ATTEMPTS SERVICE
// ============================================================================

export class QuestionAttemptsService {
  /**
   * Save a question attempt to the database
   */
  static async saveAttempt(attempt: Omit<QuestionAttempt, 'id'>): Promise<QuestionAttempt> {
    const { data, error } = await supabase
      .from('question_attempts')
      .insert([attempt])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get question attempts for a user
   */
  static async getAttempts(userName: string): Promise<QuestionAttempt[]> {
    const { data, error } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('user_name', userName)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get attempts by subject
   */
  static async getAttemptsBySubject(
    userName: string, 
    subject: 'math' | 'english'
  ): Promise<QuestionAttempt[]> {
    const { data, error } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('user_name', userName)
      .or(`test.ilike.%${subject}%,assessment.ilike.%${subject}%`)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

// ============================================================================
// MARATHON SESSIONS SERVICE
// ============================================================================

export class MarathonSessionsService {
  /**
   * Save a marathon session
   */
  static async saveSession(session: Omit<MarathonSession, 'id'>): Promise<MarathonSession> {
    const { data, error } = await supabase
      .from('marathon_sessions')
      .insert([session])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get marathon sessions for a user
   */
  static async getSessions(userName: string): Promise<MarathonSession[]> {
    const { data, error } = await supabase
      .from('marathon_sessions')
      .select('*')
      .eq('user_name', userName)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update session end time and stats
   */
  static async updateSession(
    sessionId: string, 
    updates: Partial<MarathonSession>
  ): Promise<MarathonSession> {
    const { data, error } = await supabase
      .from('marathon_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ============================================================================
// QUESTION GENERATION SERVICE
// ============================================================================

export class QuestionGenerationService {
  private static cache = new Map<string, DatabaseQuestion[]>();

  /**
   * Generate questions using AI services
   */
  static async generateQuestions(
    request: QuestionGenerationRequest
  ): Promise<QuestionGenerationResponse> {
    try {
      // Try OpenAI first, fallback to Gemini
      let response = await openaiQuestionService.generateQuestions(request);
      
      if (!response.success) {
        console.warn('OpenAI failed, trying Gemini:', response.error);
        response = await geminiQuestionService.generateQuestions(request);
      }

      return response;
    } catch (error) {
      console.error('Question generation failed:', error);
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get infinite questions for practice
   */
  static async getInfiniteQuestions(
    request: InfiniteQuestionRequest
  ): Promise<DatabaseQuestion[]> {
    const cacheKey = `${request.subject}-${request.difficulty}-${request.count}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Get database questions first
      const dbQuestions = await this.getDatabaseQuestions(request);
      
      // If we need more questions, generate with AI
      if (dbQuestions.length < request.count) {
        const remainingCount = request.count - dbQuestions.length;
        const aiResponse = await this.generateQuestions({
          skill: 'mixed',
          domain: 'mixed',
          difficulty: request.difficulty,
          count: remainingCount
        });

        if (aiResponse.success) {
          // Convert generated questions to database format
          const convertedQuestions = aiResponse.questions.map(q => ({
            id: `ai_${Date.now()}_${Math.random()}`,
            question: q.question,
            options: [q.options.A, q.options.B, q.options.C, q.options.D],
            correct_answer: q.correct_answer === 'A' ? 0 : q.correct_answer === 'B' ? 1 : q.correct_answer === 'C' ? 2 : 3,
            explanation: q.rationales.correct,
            subject: request.subject,
            topic: 'AI Generated',
            difficulty: request.difficulty,
            rationales: q.rationales
          }));

          const allQuestions = [...dbQuestions, ...convertedQuestions];
          this.cache.set(cacheKey, allQuestions);
          return allQuestions;
        }
      }

      this.cache.set(cacheKey, dbQuestions);
      return dbQuestions;
    } catch (error) {
      console.error('Error getting infinite questions:', error);
      return [];
    }
  }

  /**
   * Get questions from database
   */
  private static async getDatabaseQuestions(
    request: InfiniteQuestionRequest
  ): Promise<DatabaseQuestion[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', request.subject)
      .eq('difficulty', request.difficulty)
      .not('id', 'in', `(${request.excludeIds?.join(',') || ''})`)
      .limit(request.count);

    if (error) {
      console.error('Database query error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// PERFORMANCE ANALYTICS SERVICE
// ============================================================================

export class PerformanceAnalyticsService {
  /**
   * Calculate performance statistics
   */
  static calculateStats(attempts: QuestionAttempt[]) {
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
    const averageAccuracy = Math.round((correctAnswers / totalQuestions) * 100);

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      averageAccuracy,
      totalSessions: new Set(attempts.map(a => a.test)).size
    };
  }

  /**
   * Calculate topic performance
   */
  static calculateTopicPerformance(attempts: QuestionAttempt[]) {
    const topicStats = attempts.reduce((acc, attempt) => {
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
      accuracy: Math.round((stat.correct / stat.attempts) * 100),
      avgTime: Math.round(stat.totalTime / stat.attempts)
    }));
  }

  /**
   * Get performance trends over time
   */
  static calculateTrends(attempts: QuestionAttempt[]) {
    const dailyStats = attempts.reduce((acc, attempt) => {
      const date = new Date(attempt.timestamp).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          accuracy: 0,
          questions: 0,
          timeSpent: 0,
          correct: 0
        };
      }
      
      acc[date].questions++;
      acc[date].timeSpent += attempt.timeSpent;
      if (attempt.isCorrect) acc[date].correct++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dailyStats).map((stat: any) => ({
      date: stat.date,
      accuracy: Math.round((stat.correct / stat.questions) * 100),
      questions: stat.questions,
      timeSpent: stat.timeSpent
    }));
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCES
// ============================================================================

export const questionAttemptsService = QuestionAttemptsService;
export const marathonSessionsService = MarathonSessionsService;
export const questionGenerationService = QuestionGenerationService;
export const performanceAnalyticsService = PerformanceAnalyticsService;
