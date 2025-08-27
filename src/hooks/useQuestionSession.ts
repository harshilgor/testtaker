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

      // Quick check if session exists
      const { data: existingSession } = await supabase
        .from('question_sessions')
        .select('session_id')
        .eq('session_id', sessionId)
        .eq('session_type', sessionType)
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (existingSession) {
        console.log('Session already exists');
        return;
      }

      // Fast count for total questions
      const { count } = await supabase
        .from('question_bank')
        .select('*', { count: 'exact', head: true })
        .not('question_text', 'is', null);

      // Create session immediately
      const { error } = await supabase
        .from('question_sessions')
        .insert({
          user_id: user.user.id,
          session_id: sessionId,
          session_type: sessionType,
          questions_used: [],
          total_questions_available: count || 0
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
      
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user.user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      // Get used questions for this session
      const { data: sessionData } = await supabase
        .from('question_sessions')
        .select('questions_used')
        .eq('session_id', sessionId)
        .eq('session_type', sessionType)
        .eq('user_id', user.user.id)
        .maybeSingle();

      const usedQuestions = sessionData?.questions_used || [];

      // Map subject filters to database assessment field
      let sectionFilter = null;
      if (filters.section) {
        if (filters.section === 'math') {
          sectionFilter = 'Math';
        } else if (filters.section === 'reading-writing') {
          sectionFilter = 'Reading and Writing';
        }
      } else if (filters.subjects) {
        if (filters.subjects.includes('math') && !filters.subjects.includes('english')) {
          sectionFilter = 'Math';
        } else if (filters.subjects.includes('english') && !filters.subjects.includes('math')) {
          sectionFilter = 'Reading and Writing';
        }
      }

      console.log('Mapped section filter:', sectionFilter);
      
      // Build query to get unused questions
      let query = supabase
        .from('question_bank')
        .select(`
          id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          correct_rationale,
          incorrect_rationale_a,
          incorrect_rationale_b,
          incorrect_rationale_c,
          incorrect_rationale_d,
          assessment,
          skill,
          difficulty,
          domain,
          test,
          question_prompt,
          image
        `)
        .not('question_text', 'is', null)
        .not('id', 'in', `(${usedQuestions.map(id => `'${id}'`).join(',')})`)
        .limit(1);

      if (sectionFilter) {
        query = query.eq('assessment', sectionFilter);
      }
      
      if (filters.difficulty && filters.difficulty !== 'mixed') {
        query = query.eq('difficulty', filters.difficulty);
      }

      const { data, error } = await query.order('random()');

      if (error) {
        console.error('Error fetching question:', error);
        return null;
      }

      if (data && data.length > 0) {
        const dbQuestion = data[0];
        console.log('Successfully loaded question:', dbQuestion.id, 'Section:', dbQuestion.assessment);
        
        return {
          id: dbQuestion.id?.toString() || '',
          question_text: dbQuestion.question_text || '',
          option_a: dbQuestion.option_a || '',
          option_b: dbQuestion.option_b || '',
          option_c: dbQuestion.option_c || '',
          option_d: dbQuestion.option_d || '',
          correct_answer: dbQuestion.correct_answer || '',
          correct_rationale: dbQuestion.correct_rationale || '',
          incorrect_rationale_a: dbQuestion.incorrect_rationale_a || '',
          incorrect_rationale_b: dbQuestion.incorrect_rationale_b || '',
          incorrect_rationale_c: dbQuestion.incorrect_rationale_c || '',
          incorrect_rationale_d: dbQuestion.incorrect_rationale_d || '',
          section: dbQuestion.assessment || '',
          skill: dbQuestion.skill || '',
          difficulty: dbQuestion.difficulty || 'medium',
          domain: dbQuestion.domain || '',
          test_name: dbQuestion.test || '',
          question_type: 'multiple-choice',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {},
          image: dbQuestion.image === 'true' || dbQuestion.image === 'True' || dbQuestion.image === '1' || false
        };
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

      // Try RPC function for speed
      const { error } = await supabase.rpc('mark_question_used_in_session', {
        p_session_id: sessionId,
        p_session_type: sessionType,
        p_question_id: questionId
      });

      if (error) {
        console.error('Error with RPC mark_question_used_in_session:', error);
        
        // Quick fallback update
        const { data: session } = await supabase
          .from('question_sessions')
          .select('questions_used')
          .eq('session_id', sessionId)
          .eq('session_type', sessionType)
          .eq('user_id', user.user.id)
          .maybeSingle();

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
