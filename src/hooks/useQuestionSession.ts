
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseQuestion } from '@/services/questionService';

interface QuestionSessionHook {
  getNextQuestion: (sessionId: string, sessionType: string, filters?: any) => Promise<DatabaseQuestion | null>;
  markQuestionUsed: (sessionId: string, sessionType: string, questionId: string) => Promise<void>;
  getSessionStats: (sessionId: string, sessionType: string) => Promise<{ used: number; total: number }>;
  getTotalQuestions: () => Promise<number>;
}

export const useQuestionSession = (): QuestionSessionHook => {
  const getNextQuestion = useCallback(async (
    sessionId: string,
    sessionType: string,
    filters: any = {}
  ): Promise<DatabaseQuestion | null> => {
    try {
      console.log('Fetching question with filters:', filters);
      
      const { data, error } = await supabase.rpc('get_unused_questions_for_session', {
        p_session_id: sessionId,
        p_session_type: sessionType,
        p_section: filters.section || null,
        p_difficulty: filters.difficulty || null,
        p_limit: 1
      });

      if (error) {
        console.error('Error getting next question:', error);
        return null;
      }

      if (data && data.length > 0) {
        const dbQuestion = data[0];
        console.log('Successfully loaded question:', dbQuestion.id);
        
        // Map the database response to DatabaseQuestion type
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
    getTotalQuestions
  };
};
