
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseQuestionLoaderProps {
  session: any;
  setCurrentQuestion: (question: any) => void;
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
      // Get used questions first
      const { data: sessionData } = await supabase
        .from('question_sessions')
        .select('questions_used')
        .eq('session_id', session.id)
        .eq('session_type', 'marathon')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      const usedQuestions = sessionData?.questions_used || [];
      
      // Build optimized query for unused questions from question_bank
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
        .limit(50); // Get more questions to have options

      // Add used questions filter if any exist
      if (usedQuestions.length > 0) {
        query = query.not('id', 'in', `(${usedQuestions.join(',')})`);
      }
      
      // Filter by subject if specified using test column
      if (session.subjects && !session.subjects.includes('both')) {
        if (session.subjects.includes('math')) {
          query = query.eq('test', 'Math');
        } else if (session.subjects.includes('english')) {
          query = query.eq('test', 'Reading and Writing');
        }
      }
      
      // Add difficulty filter if not mixed
      if (session.difficulty && session.difficulty !== 'mixed') {
        query = query.eq('difficulty', session.difficulty);
      }

      const { data: questions, error } = await query.order('id');

      if (error) {
        console.error('useQuestionLoader: Error loading question:', error);
        return;
      }

      if (questions && questions.length > 0) {
        // Pick a random question from the results
        const randomIndex = Math.floor(Math.random() * questions.length);
        const question = questions[randomIndex];
        console.log('useQuestionLoader: Loaded question:', question.id, question.question_text?.substring(0, 50));
        
        // Format question to match expected interface
        const formattedQuestion = {
          id: question.id,
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
          image: String(question.image || '').toLowerCase() === 'true' || String(question.image || '') === '1'
        };
        
        setCurrentQuestion(formattedQuestion);
        startTimer(); // Start timer for new question
        
        // Mark question as used and refresh stats in parallel for better performance
        await Promise.all([
          supabase.rpc('mark_question_used_in_session', {
            p_session_id: session.id,
            p_session_type: 'marathon',
            p_question_id: question.id.toString()
          }),
          loadSessionStats()
        ]);
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
