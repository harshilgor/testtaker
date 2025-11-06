
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseQuestion } from '@/services/questionService';
import { MarathonSettings } from '../../types/marathon';

interface UseQuestionLoaderProps {
  session: any;
  setCurrentQuestion: (question: DatabaseQuestion | null) => void;
  setLoading: (loading: boolean) => void;
  loadSessionStats: () => Promise<void>;
  startTimer: () => void;
  settings?: MarathonSettings;
  getAdaptiveQuestions?: (questions: any[], sessionProgress: any, count: number, subject?: 'math' | 'english') => Promise<any[]>;
  sessionHistory?: string[];
  irtMarathon?: {
    selectNextQuestion: (questions: DatabaseQuestion[]) => Promise<DatabaseQuestion | null>;
    proficiency: any;
    phase: string;
    loading: boolean;
  } | null;
}

export const useQuestionLoader = ({
  session,
  setCurrentQuestion,
  setLoading,
  loadSessionStats,
  startTimer,
  settings,
  getAdaptiveQuestions,
  sessionHistory = [],
  irtMarathon
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
      
      // Apply difficulty filter (skip for IRT mode as it selects adaptively)
      if (session.difficulty && session.difficulty !== 'mixed' && !settings?.skill) {
        query = query.eq('difficulty', session.difficulty);
      }

      // Apply skill filter if IRT marathon is active
      if (settings?.skill) {
        query = query.eq('skill', settings.skill);
      }

      const { data: questions, error } = await query.order('id');

      if (error) {
        console.error('useQuestionLoader: Error loading question:', error);
        return;
      }

      if (questions && questions.length > 0) {
        let selectedQuestion: any;

        // Use IRT-based selection if skill is specified
        if (irtMarathon && !irtMarathon.loading) {
          console.log('🎯 Using IRT-based question selection for skill:', settings?.skill);
          try {
            const irtSelected = await irtMarathon.selectNextQuestion(questions);
            if (irtSelected) {
              selectedQuestion = irtSelected;
              console.log('✅ IRT selected question:', {
                id: irtSelected.id,
                difficulty: irtSelected.difficulty,
                proficiency: irtMarathon.proficiency?.theta,
                phase: irtMarathon.phase,
              });
            } else {
              // Fallback to random if IRT selection fails
              const randomIndex = Math.floor(Math.random() * questions.length);
              selectedQuestion = questions[randomIndex];
              console.log('🔄 IRT selection returned null, using random fallback');
            }
          } catch (error) {
            console.error('❌ Error in IRT question selection:', error);
            // Fallback to random selection
            const randomIndex = Math.floor(Math.random() * questions.length);
            selectedQuestion = questions[randomIndex];
          }
        }
        // Use adaptive learning if enabled and available (and not IRT mode)
        else if (settings?.adaptiveLearning && getAdaptiveQuestions && !settings?.skill) {
          console.log('🧠 Using adaptive learning for question selection');
          
          try {
            // Determine subject based on session subjects
            const sessionSubjects = session.subjects || ['both'];
            let targetSubject: 'math' | 'english' | undefined;
            
            if (sessionSubjects.includes('math') && !sessionSubjects.includes('english') && !sessionSubjects.includes('both')) {
              targetSubject = 'math';
            } else if (sessionSubjects.includes('english') && !sessionSubjects.includes('math') && !sessionSubjects.includes('both')) {
              targetSubject = 'english';
            }
            
            // Get adaptive questions (just 1 for now)
            const adaptiveQuestions = await getAdaptiveQuestions(questions, {}, 1, targetSubject);
            
            if (adaptiveQuestions.length > 0) {
              selectedQuestion = adaptiveQuestions[0];
              console.log('🎯 Selected adaptive question:', {
                id: selectedQuestion.id,
                targetSkill: selectedQuestion.targetSkill,
                selectionReason: selectedQuestion.selectionReason,
                difficulty: selectedQuestion.difficulty
              });
            } else {
              // Fallback to random if adaptive selection fails
              const randomIndex = Math.floor(Math.random() * questions.length);
              selectedQuestion = questions[randomIndex];
              console.log('🔄 Fallback to random question due to empty adaptive selection');
            }
          } catch (error) {
            console.error('❌ Error in adaptive question selection:', error);
            // Fallback to random selection
            const randomIndex = Math.floor(Math.random() * questions.length);
            selectedQuestion = questions[randomIndex];
            console.log('🔄 Fallback to random question due to error');
          }
        } else {
          // Traditional random selection
          const randomIndex = Math.floor(Math.random() * questions.length);
          selectedQuestion = questions[randomIndex];
          console.log('🎲 Using random question selection (adaptive learning disabled)');
        }

        console.log('useQuestionLoader: Loaded question:', selectedQuestion.id);
        
        // Format question with proper type conversion
        const formattedQuestion: DatabaseQuestion = {
          id: selectedQuestion.id.toString(),
          question_text: selectedQuestion.question_text || '',
          option_a: selectedQuestion.option_a || '',
          option_b: selectedQuestion.option_b || '',
          option_c: selectedQuestion.option_c || '',
          option_d: selectedQuestion.option_d || '',
          correct_answer: selectedQuestion.correct_answer || '',
          correct_rationale: selectedQuestion.correct_rationale || '',
          incorrect_rationale_a: selectedQuestion.incorrect_rationale_a || '',
          incorrect_rationale_b: selectedQuestion.incorrect_rationale_b || '',
          incorrect_rationale_c: selectedQuestion.incorrect_rationale_c || '',
          incorrect_rationale_d: selectedQuestion.incorrect_rationale_d || '',
          section: selectedQuestion.assessment || 'SAT',
          skill: selectedQuestion.skill || '',
          difficulty: selectedQuestion.difficulty || 'medium',
          domain: selectedQuestion.domain || '',
          test_name: selectedQuestion.test || '',
          question_type: 'multiple-choice',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            // Store adaptive learning metadata
            targetSkill: selectedQuestion.targetSkill,
            selectionReason: selectedQuestion.selectionReason,
            adaptiveWeight: selectedQuestion.adaptiveWeight
          },
          image: typeof selectedQuestion.image === 'string' && ['true', 'True', '1'].includes(selectedQuestion.image)
        };
        
        setCurrentQuestion(formattedQuestion);
        startTimer();
        
        // Mark question as used and refresh stats in parallel
        const markUsedPromise = supabase.rpc('mark_question_used_in_session', {
          p_session_id: session.id,
          p_session_type: 'marathon',
          p_question_id: selectedQuestion.id.toString()
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
