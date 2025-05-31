
import { supabase } from '@/integrations/supabase/client';
import { DatabaseQuestion } from './questionService';

interface QuestionFilters {
  section?: string;
  difficulty?: string;
  limit?: number;
}

class MarathonQuestionService {
  private questionCache: Map<string, DatabaseQuestion[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private getCacheKey(filters: QuestionFilters): string {
    return JSON.stringify({
      section: filters.section || 'all',
      difficulty: filters.difficulty || 'all'
    });
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry !== undefined && Date.now() < expiry;
  }

  async getQuestionsForSession(
    sessionId: string,
    sessionType: string,
    filters: QuestionFilters = {}
  ): Promise<DatabaseQuestion[]> {
    const cacheKey = this.getCacheKey(filters);
    
    // Check cache first for faster loading
    if (this.isCacheValid(cacheKey)) {
      const cached = this.questionCache.get(cacheKey);
      if (cached && cached.length > 0) {
        console.log('Using cached questions for faster loading');
        return this.filterUnusedQuestions(cached, sessionId, sessionType);
      }
    }

    console.log('Fetching fresh questions with filters:', filters);
    
    try {
      // Get used questions for this session
      const { data: sessionData } = await supabase
        .from('question_sessions')
        .select('questions_used')
        .eq('session_id', sessionId)
        .eq('session_type', sessionType)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      const usedQuestionIds = sessionData?.questions_used || [];

      // Build optimized query
      let query = supabase
        .from('question_bank')
        .select('*')
        .not('question_text', 'is', null)
        .limit(filters.limit || 50); // Fetch more questions at once

      if (filters.section) {
        query = query.eq('section', filters.section);
      }
      
      if (filters.difficulty && filters.difficulty !== 'mixed') {
        query = query.eq('difficulty', filters.difficulty);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      if (!data) return [];

      // Convert to our format and filter out used questions
      const questions: DatabaseQuestion[] = data
        .filter(q => !usedQuestionIds.includes(q.id.toString()))
        .map(q => ({
          ...q,
          id: q.id.toString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {}
        }));

      // Cache the results
      this.questionCache.set(cacheKey, questions);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      console.log(`Loaded and cached ${questions.length} questions`);
      return questions;
    } catch (error) {
      console.error('Error in getQuestionsForSession:', error);
      return [];
    }
  }

  private async filterUnusedQuestions(
    questions: DatabaseQuestion[],
    sessionId: string,
    sessionType: string
  ): Promise<DatabaseQuestion[]> {
    try {
      const { data: sessionData } = await supabase
        .from('question_sessions')
        .select('questions_used')
        .eq('session_id', sessionId)
        .eq('session_type', sessionType)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      const usedQuestionIds = sessionData?.questions_used || [];
      return questions.filter(q => !usedQuestionIds.includes(q.id));
    } catch (error) {
      console.error('Error filtering unused questions:', error);
      return questions;
    }
  }

  clearCache(): void {
    this.questionCache.clear();
    this.cacheExpiry.clear();
  }
}

export const marathonQuestionService = new MarathonQuestionService();
