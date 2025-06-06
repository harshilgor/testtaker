
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseQuestion } from '@/services/questionService';

interface QuestionSessionHook {
  getNextQuestion: (sessionId: string, sessionType: string, filters?: any) => Promise<DatabaseQuestion | null>;
  markQuestionUsed: (sessionId: string, sessionType: string, questionId: string) => Promise<void>;
  getSessionStats: (sessionId: string, sessionType: string) => Promise<{ used: number; total: number }>;
  getTotalQuestions: () => Promise<number>;
  initializeSession: (sessionId: string, sessionType: string) => Promise<void>;
}

export const useQuestionSession = (): QuestionSessionHook => {
  const initializeSession = useCallback(async (
    sessionId: string,
    sessionType: string
  ): Promise<void> => {
    try {
      console.log('Initializing session:', sessionId, sessionType);
      
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user.user) {
        console.error('No authenticated user for session initialization:', userError);
        return;
      }

      // Check if session already exists
      const { data: existingSession, error: sessionError } = await supabase
        .from('question_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('session_type', sessionType)
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (sessionError) {
        console.error('Error checking existing session:', sessionError);
        return;
      }

      if (existingSession) {
        console.log('Session already exists:', existingSession);
        return;
      }

      // Create new session with empty questions_used array
      const totalQuestions = await getTotalQuestions();
      const { error } = await supabase
        .from('question_sessions')
        .insert({
          user_id: user.user.id,
          session_id: sessionId,
          session_type: sessionType,
          questions_used: [],
          total_questions_available: totalQuestions
        });

      if (error) {
        console.error('Error initializing session:', error);
      } else {
        console.log('Session initialized successfully');
      }
    } catch (error) {
      console.error('Error in initializeSession:', error);
    }
  }, []);

  const getNextQuestion = useCallback(async (
    sessionId: string,
    sessionType: string,
    filters: any = {}
  ): Promise<DatabaseQuestion | null> => {
    try {
      console.log('Fetching question with filters:', filters);
      
      // Check if user is authenticated
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user.user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      // Map subject filters to database section values
      let sectionFilter = null;
      if (filters.section) {
        sectionFilter = filters.section;
      } else if (filters.subjects) {
        if (filters.subjects.includes('math') && !filters.subjects.includes('english')) {
          sectionFilter = 'math';
        } else if (filters.subjects.includes('english') && !filters.subjects.includes('math')) {
          sectionFilter = 'reading-writing';
        }
      }

      console.log('Mapped section filter:', sectionFilter);
      
      // Try to call the RPC function with proper error handling
      const { data, error } = await supabase.rpc('get_unused_questions_for_session', {
        p_session_id: sessionId,
        p_session_type: sessionType,
        p_section: sectionFilter,
        p_difficulty: filters.difficulty === 'mixed' ? null : filters.difficulty,
        p_limit: 1
      });

      if (error) {
        console.error('Error calling get_unused_questions_for_session:', error);
        
        // Fallback: try to get questions directly from question_bank
        console.log('Falling back to direct question_bank query');
        
        let query = supabase
          .from('question_bank')
          .select('*')
          .not('question_text', 'is', null);

        if (sectionFilter) {
          query = query.eq('section', sectionFilter);
        }
        
        if (filters.difficulty && filters.difficulty !== 'mixed') {
          query = query.eq('difficulty', filters.difficulty);
        }

        const { data: fallbackData, error: fallbackError } = await query
          .order('id')
          .limit(1);

        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return null;
        }

        if (fallbackData && fallbackData.length > 0) {
          const dbQuestion = fallbackData[0];
          console.log('Successfully loaded question via fallback:', dbQuestion.id);
          
          const mappedQuestion: DatabaseQuestion = {
            ...dbQuestion,
            id: dbQuestion.id?.toString() || '',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return mappedQuestion;
        }
        
        return null;
      }

      if (data && data.length > 0) {
        const dbQuestion = data[0];
        console.log('Successfully loaded question:', dbQuestion.id, 'Section:', dbQuestion.section);
        
        const mappedQuestion: DatabaseQuestion = {
          ...dbQuestion,
          id: dbQuestion.id?.toString() || '',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return mappedQuestion;
      }

      console.log('No questions available with current filters');
      return null;
    } catch (error) {
      console.error('Error in getNextQuestion:', error);
      return null;
    }
  }, []);

  const markQuestionUsed = useCallback(async (
    sessionId: string,
    sessionType: string,
    questionId: string
  ): Promise<void> => {
    try {
      console.log('Marking question as used:', questionId);
      
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user.user) {
        console.error('User not authenticated for marking question used:', userError);
        return;
      }

      // Try RPC function first
      const { error } = await supabase.rpc('mark_question_used_in_session', {
        p_session_id: sessionId,
        p_session_type: sessionType,
        p_question_id: questionId
      });

      if (error) {
        console.error('Error with RPC mark_question_used_in_session:', error);
        
        // Fallback: update directly
        console.log('Falling back to direct update');
        
        const { data: session, error: getError } = await supabase
          .from('question_sessions')
          .select('questions_used')
          .eq('session_id', sessionId)
          .eq('session_type', sessionType)
          .eq('user_id', user.user.id)
          .maybeSingle();

        if (getError) {
          console.error('Error getting session for fallback:', getError);
          return;
        }

        const currentUsed = session?.questions_used || [];
        const updatedUsed = [...currentUsed, questionId];

        const { error: updateError } = await supabase
          .from('question_sessions')
          .upsert({
            user_id: user.user.id,
            session_id: sessionId,
            session_type: sessionType,
            questions_used: updatedUsed,
            total_questions_available: await getTotalQuestions()
          });

        if (updateError) {
          console.error('Error updating session directly:', updateError);
          throw updateError;
        }
      }

      console.log('Question marked as used successfully');
    } catch (error) {
      console.error('Error in markQuestionUsed:', error);
      throw error;
    }
  }, []);

  const getSessionStats = useCallback(async (
    sessionId: string,
    sessionType: string
  ): Promise<{ used: number; total: number }> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No authenticated user for session stats:', userError);
        return { used: 0, total: 0 };
      }

      const { data, error } = await supabase
        .from('question_sessions')
        .select('questions_used, total_questions_available')
        .eq('session_id', sessionId)
        .eq('session_type', sessionType)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error getting session stats:', error);
        const total = await getTotalQuestions();
        return { used: 0, total };
      }

      if (!data) {
        console.log('No session data found, returning defaults');
        const total = await getTotalQuestions();
        return { used: 0, total };
      }

      return {
        used: data.questions_used?.length || 0,
        total: data.total_questions_available || 0
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { used: 0, total: 0 };
    }
  }, []);

  const getTotalQuestions = useCallback(async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('question_bank')
        .select('*', { count: 'exact', head: true })
        .not('question_text', 'is', null);

      if (error) {
        console.error('Error getting total questions:', error);
        return 0;
      }

      console.log('Total questions in question_bank:', count);
      return count || 0;
    } catch (error) {
      console.error('Error in getTotalQuestions:', error);
      return 0;
    }
  }, []);

  return {
    getNextQuestion,
    markQuestionUsed,
    getSessionStats,
    getTotalQuestions,
    initializeSession
  };
};
