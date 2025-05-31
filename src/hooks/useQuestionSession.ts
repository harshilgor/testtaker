import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseQuestion } from '@/services/questionService';
import { marathonQuestionService } from '@/services/marathonQuestionService';

interface QuestionSessionHook {
  getNextQuestion: (sessionId: string, sessionType: string, filters?: any) => Promise<DatabaseQuestion | null>;
  markQuestionUsed: (sessionId: string, sessionType: string, questionId: string) => Promise<void>;
  getSessionStats: (sessionId: string, sessionType: string) => Promise<{ used: number; total: number }>;
  getTotalQuestions: () => Promise<number>;
  initializeSession: (sessionId: string, sessionType: string) => Promise<void>;
}

export const useQuestionSession = (): QuestionSessionHook => {
  const [questionBuffer, setQuestionBuffer] = useState<DatabaseQuestion[]>([]);

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
        console.log('Session already exists');
        return;
      }

      // Create new session
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
      // Check buffer first for immediate response
      if (questionBuffer.length > 0) {
        const question = questionBuffer[0];
        setQuestionBuffer(prev => prev.slice(1));
        console.log('Using buffered question for instant loading');
        
        // Prefetch more questions in background if buffer is getting low
        if (questionBuffer.length <= 2) {
          marathonQuestionService.getQuestionsForSession(sessionId, sessionType, {
            section: filters.section,
            difficulty: filters.difficulty,
            limit: 10
          }).then(questions => {
            setQuestionBuffer(prev => [...prev, ...questions.slice(1)]);
          });
        }
        
        return question;
      }

      // If no buffer, fetch immediately
      console.log('Fetching questions with filters:', filters);
      
      const sectionFilter = filters.subjects?.includes('math') && !filters.subjects?.includes('english') 
        ? 'math' 
        : filters.subjects?.includes('english') && !filters.subjects?.includes('math')
        ? 'reading-writing'
        : filters.section;

      const questions = await marathonQuestionService.getQuestionsForSession(
        sessionId,
        sessionType,
        {
          section: sectionFilter,
          difficulty: filters.difficulty === 'mixed' ? undefined : filters.difficulty,
          limit: 10
        }
      );

      if (questions.length > 0) {
        const question = questions[0];
        setQuestionBuffer(questions.slice(1)); // Buffer the rest
        console.log('Successfully loaded question:', question.id);
        return question;
      }

      console.log('No questions available');
      return null;
    } catch (error) {
      console.error('Error in getNextQuestion:', error);
      return null;
    }
  }, [questionBuffer]);

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
