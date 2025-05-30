
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
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('No authenticated user for session initialization');
        return;
      }

      // Check if session already exists
      const { data: existingSession } = await supabase
        .from('question_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('session_type', sessionType)
        .eq('user_id', user.user.id)
        .single();

      if (existingSession) {
        console.log('Session already exists:', existingSession);
        return;
      }

      // Create new session with empty questions_used array
      const { error } = await supabase
        .from('question_sessions')
        .insert({
          user_id: user.user.id,
          session_id: sessionId,
          session_type: sessionType,
          questions_used: [],
          total_questions_available: await getTotalQuestions()
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
        // If both or neither, leave sectionFilter as null for mixed
      }

      console.log('Mapped section filter:', sectionFilter);
      
      const { data, error } = await supabase.rpc('get_unused_questions_for_session', {
        p_session_id: sessionId,
        p_session_type: sessionType,
        p_section: sectionFilter,
        p_difficulty: filters.difficulty === 'mixed' ? null : filters.difficulty,
        p_limit: 1
      });

      if (error) {
        console.error('Error getting next question:', error);
        return null;
      }

      if (data && data.length > 0) {
        const dbQuestion = data[0];
        console.log('Successfully loaded question:', dbQuestion.id, 'Section:', dbQuestion.section);
        
        const mappedQuestion: DatabaseQuestion = {
          ...dbQuestion,
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
      
      const { error } = await supabase.rpc('mark_question_used_in_session', {
        p_session_id: sessionId,
        p_session_type: sessionType,
        p_question_id: questionId
      });

      if (error) {
        console.error('Error marking question as used:', error);
        throw error;
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user');
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
        .single();

      if (error || !data) {
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
        .eq('is_active', true);

      if (error) {
        console.error('Error getting total questions:', error);
        return 0;
      }

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
