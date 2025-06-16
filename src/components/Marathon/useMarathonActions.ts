
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
      const subjects = session.subjects.includes('both') ? ['math', 'reading-writing'] : session.subjects;
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      
      console.log('useMarathonActions: Requesting question', { subject: randomSubject, difficulty: session.difficulty });
      
      // Optimize by reducing the RPC call complexity and using a simpler query
      const { data: questions, error } = await supabase.rpc('get_unused_questions_for_session', {
        p_session_id: session.id,
        p_session_type: 'marathon',
        p_section: randomSubject,
        p_difficulty: session.difficulty === 'mixed' ? null : session.difficulty,
        p_limit: 1
      });

      if (error) {
        console.error('useMarathonActions: Error loading question:', error);
        return;
      }

      if (questions && questions.length > 0) {
        const question = questions[0];
        console.log('useMarathonActions: Loaded question:', question.id, question.question_text?.substring(0, 50));
        setCurrentQuestion(question);
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
  }, [session, setCurrentQuestion, setTimeSpent, setLoading, loadSessionStats, startTimer]);

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
      subject: currentQuestion.section === 'reading-writing' ? 'english' : currentQuestion.section as 'math' | 'english',
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
