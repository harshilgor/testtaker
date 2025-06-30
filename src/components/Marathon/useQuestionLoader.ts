
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseQuestion } from '@/services/questionService';

interface UseQuestionLoaderProps {
  session: any;
  setCurrentQuestion: (question: DatabaseQuestion | null) => void;
  setLoading: (loading: boolean) => void;
  loadSessionStats: () => Promise<void>;
  startTimer: () => void;
}

export const useQuestionLoader = ({
  session,
  setCurrentQuestion,
  setLoading,
  loadSessionStats,
  startTimer
}: UseQuestionLoaderProps) => {

  const loadNextQuestion = useCallback(async () => {
    if (!session) {
      console.log('useQuestionLoader: No session available');
      return;
    }
    
    setLoading(true);
    console.log('useQuestionLoader: Loading next question for session', session.id);
    
    try {
      // Get used questions from session
      const { data: sessionData } = await supabase
        .from('question_sessions')
        .select('questions_used')
        .eq('session_id', session.id)
        .eq('session_type', 'marathon')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      const usedQuestions = sessionData?.questions_used || [];
      
      // Optimized query with better filtering and limits
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
        .limit(50); // Increased limit for better variety

      // Exclude used questions more efficiently
      if (usedQuestions.length > 0) {
        const usedIds = usedQuestions.map(id => parseInt(id)).filter(id => !isNaN(id));
        if (usedIds.length > 0) {
          query = query.not('id', 'in', `(${usedIds.join(',')})`);
        }
      }
      
      // Apply subject filters
      if (session.subjects && !session.subjects.includes('both')) {
        if (session.subjects.includes('math')) {
          query = query.or('test.ilike.%math%,assessment.ilike.%math%');
        } else if (session.subjects.includes('english')) {
          query = query.not('test', 'ilike', '%math%').not('assessment', 'ilike', '%math%');
        }
      }
      
      // Apply difficulty filter
      if (session.difficulty && session.difficulty !== 'mixed') {
        query = query.eq('difficulty', session.difficulty);
      }

      const { data: questions, error } = await query.order('id');

      if (error) {
        console.error('useQuestionLoader: Error loading question:', error);
        return;
      }

      if (questions && questions.length > 0) {
        // Pick random question for variety
        const randomIndex = Math.floor(Math.random() * questions.length);
        const question = questions[randomIndex];
        console.log('useQuestionLoader: Loaded question:', question.id);
        
        // Format question with proper type conversion
        const formattedQuestion: DatabaseQuestion = {
          id: question.id.toString(),
          question_text: question.question_text || '',
          option_a: question.option_a || '',
          option_b: question.option_b || '',
          option_c: question.option_c || '',
          option_d: question.option_d || '',
          correct_answer: question.correct_answer || '',
          correct_rationale: question.correct_rationale || '',
          incorrect_rationale_a: question.incorrect_rationale_a || '',
          incorrect_rationale_b: question.incorrect_rationale_b || '',
          incorrect_rationale_c: question.incorrect_rationale_c || '',
          incorrect_rationale_d: question.incorrect_rationale_d || '',
          section: question.assessment || 'SAT',
          skill: question.skill || '',
          difficulty: question.difficulty || 'medium',
          domain: question.domain || '',
          test_name: question.test || '',
          question_type: 'multiple-choice',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {},
          image: typeof question.image === 'string' && ['true', 'True', '1'].includes(question.image)
        };
        
        setCurrentQuestion(formattedQuestion);
        startTimer();
        
        // Mark question as used and refresh stats in parallel
        const markUsedPromise = supabase.rpc('mark_question_used_in_session', {
          p_session_id: session.id,
          p_session_type: 'marathon',
          p_question_id: question.id.toString()
        });
        
        const statsPromise = loadSessionStats();
        
        // Don't await these operations to avoid blocking the UI
        Promise.all([markUsedPromise, statsPromise]).catch(console.error);
      } else {
        console.log('useQuestionLoader: No more questions available');
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('useQuestionLoader: Error in loadNextQuestion:', error);
    } finally {
      setLoading(false);
    }
  }, [session, setCurrentQuestion, setLoading, loadSessionStats, startTimer]);

  return { loadNextQuestion };
};
