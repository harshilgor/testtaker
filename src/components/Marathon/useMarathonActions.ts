
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { recordQuestionAttempt, calculatePoints } from '@/services/pointsService';

interface UseMarathonActionsProps {
  session: any;
  currentQuestion: any;
  timeSpent: number;
  totalTimeSpent: number;
  setCurrentQuestion: (question: any) => void;
  setTimeSpent: (time: number) => void;
  setTotalTimeSpent: (time: number) => void;
  setLoading: (loading: boolean) => void;
  setSessionPoints: (points: number) => void;
  loadUserPoints: () => Promise<void>;
  loadSessionStats: () => Promise<void>;
  recordAttempt: (attempt: any) => void;
  endSession: () => any;
  setShowSummary: (show: boolean) => void;
  setShowEndConfirmation: (show: boolean) => void;
  sessionPoints: number;
  stopTimer: () => void;
  startTimer: () => void;
}

export const useMarathonActions = ({
  session,
  currentQuestion,
  timeSpent,
  totalTimeSpent,
  setCurrentQuestion,
  setTimeSpent,
  setTotalTimeSpent,
  setLoading,
  setSessionPoints,
  loadUserPoints,
  loadSessionStats,
  recordAttempt,
  endSession,
  setShowSummary,
  setShowEndConfirmation,
  sessionPoints,
  stopTimer,
  startTimer
}: UseMarathonActionsProps) => {

  const loadNextQuestion = useCallback(async () => {
    if (!session) {
      console.log('useMarathonActions: No session available');
      return;
    }
    
    setLoading(true);
    console.log('useMarathonActions: Loading next question for session', session.id);
    
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
      
      // Filter by subject if specified - now using test column
      if (session.subjects && !session.subjects.includes('both')) {
        if (session.subjects.includes('math')) {
          // Filter for math questions using test column
          query = query.ilike('test', '%math%');
        } else if (session.subjects.includes('english')) {
          // Filter for non-math questions (Reading and Writing)
          query = query.not('test', 'ilike', '%math%');
        }
      }
      
      // Add difficulty filter if not mixed
      if (session.difficulty && session.difficulty !== 'mixed') {
        query = query.eq('difficulty', session.difficulty);
      }

      const { data: questions, error } = await query.order('id');

      if (error) {
        console.error('useMarathonActions: Error loading question:', error);
        return;
      }

      if (questions && questions.length > 0) {
        // Pick a random question from the results
        const randomIndex = Math.floor(Math.random() * questions.length);
        const question = questions[randomIndex];
        console.log('useMarathonActions: Loaded question:', question.id, question.question_text?.substring(0, 50));
        
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
          image: question.image === 'true' || question.image === 'True' || question.image === '1' || question.image === true
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
        console.log('useMarathonActions: No more questions available');
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('useMarathonActions: Error in loadNextQuestion:', error);
    } finally {
      setLoading(false);
    }
  }, [session, setCurrentQuestion, setLoading, loadSessionStats, startTimer]);

  const handleAnswer = useCallback(async (selectedAnswer: string, showAnswerUsed: boolean = false) => {
    if (!currentQuestion) {
      console.log('useMarathonActions: No current question for answer');
      return;
    }
    
    stopTimer(); // Stop timer when answer is submitted
    
    // If show answer was used, mark as incorrect regardless of the actual answer
    const isCorrect = showAnswerUsed ? false : selectedAnswer === currentQuestion.correct_answer;
    console.log('useMarathonActions: Recording answer', { selectedAnswer, isCorrect, timeSpent, showAnswerUsed });
    
    const attempt = {
      questionId: currentQuestion.id.toString(),
      subject: currentQuestion.section === 'Reading and Writing' ? 'english' : 'math',
      topic: currentQuestion.skill || 'general',
      difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
      isCorrect,
      timeSpent,
      hintsUsed: 0,
      showAnswerUsed,
      flagged: false,
      timestamp: new Date()
    };
    
    recordAttempt(attempt);
    
    // Calculate and record points (0 points if show answer was used)
    const points = showAnswerUsed ? 0 : calculatePoints(attempt.difficulty, isCorrect);
    console.log('useMarathonActions: Calculated points for answer:', points);
    
    if (points > 0) {
      const newSessionPoints = sessionPoints + points;
      console.log('useMarathonActions: Updating session points from', sessionPoints, 'to', newSessionPoints);
      setSessionPoints(newSessionPoints);
    }
    
    // Record the attempt in the database and refresh points in parallel
    try {
      await Promise.all([
        recordQuestionAttempt({
          question_id: currentQuestion.id.toString(),
          session_id: session.id,
          session_type: 'marathon',
          is_correct: isCorrect,
          difficulty: attempt.difficulty,
          subject: attempt.subject,
          topic: attempt.topic,
          time_spent: timeSpent
        }),
        loadUserPoints()
      ]);
    } catch (error) {
      console.error('useMarathonActions: Error recording question attempt:', error);
    }
  }, [currentQuestion, timeSpent, recordAttempt, setSessionPoints, sessionPoints, session, loadUserPoints, stopTimer]);

  const handleNext = useCallback(() => {
    console.log('useMarathonActions: Moving to next question');
    loadNextQuestion();
  }, [loadNextQuestion]);

  const handleEndMarathon = useCallback(() => {
    console.log('useMarathonActions: Ending marathon requested');
    stopTimer(); // Stop timer when ending marathon
    setShowEndConfirmation(true);
  }, [setShowEndConfirmation, stopTimer]);

  const confirmEndMarathon = useCallback(async () => {
    console.log('useMarathonActions: Confirming marathon end');
    try {
      const sessionData = endSession();
      
      if (sessionData?.session) {
        // Save marathon session to Supabase
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          console.log('useMarathonActions: Saving session to database');
          const { error } = await supabase
            .from('marathon_sessions')
            .insert({
              user_id: user.user.id,
              total_questions: sessionData.session.totalQuestions,
              correct_answers: sessionData.session.correctAnswers,
              difficulty: sessionData.session.difficulty,
              subjects: sessionData.session.subjects,
              start_time: sessionData.session.startTime,
              end_time: sessionData.session.endTime || new Date(),
            });

          if (error) {
            console.error('useMarathonActions: Error saving marathon session:', error);
          } else {
            console.log('useMarathonActions: Marathon session saved successfully');
          }
        }
      }
      
      await loadUserPoints();
      await loadSessionStats();
      setShowSummary(true);
    } catch (error) {
      console.error('useMarathonActions: Error ending marathon:', error);
      setShowSummary(true);
    }
  }, [endSession, loadUserPoints, loadSessionStats, setShowSummary]);

  return {
    loadNextQuestion,
    handleAnswer,
    handleNext,
    handleEndMarathon,
    confirmEndMarathon
  };
};
