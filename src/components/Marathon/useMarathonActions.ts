
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculatePoints } from '@/services/pointsService';
import { useQuestionLoader } from './useQuestionLoader';

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

  const { loadNextQuestion } = useQuestionLoader({
    session,
    setCurrentQuestion,
    setLoading,
    loadSessionStats,
    startTimer
  });

  const handleAnswer = useCallback(async (selectedAnswer: string, showAnswerUsed: boolean = false) => {
    if (!currentQuestion || !session) return;

    stopTimer();
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const difficulty = currentQuestion.difficulty as 'easy' | 'medium' | 'hard';
    const pointsEarned = isCorrect ? calculatePoints(difficulty, true) : 0;

    // Update session points immediately
    setSessionPoints(prev => prev + pointsEarned);

    // Record the attempt
    const attempt = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent,
      showAnswerUsed,
      subject: currentQuestion.section?.toLowerCase() === 'math' ? 'math' as const : 'english' as const,
      topic: currentQuestion.skill || 'General',
      difficulty: difficulty
    };

    recordAttempt(attempt);

    // Record in database
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('question_attempts_v2').insert({
          user_id: user.user.id,
          question_id: currentQuestion.id,
          session_id: session.id,
          session_type: 'marathon',
          is_correct: isCorrect,
          points_earned: pointsEarned,
          time_spent: timeSpent,
          difficulty: difficulty,
          subject: currentQuestion.section?.toLowerCase() === 'math' ? 'math' : 'english',
          topic: currentQuestion.skill || 'General'
        });
      }
    } catch (error) {
      console.error('Error recording attempt:', error);
    }

    // Update total time spent
    setTotalTimeSpent(prev => prev + timeSpent);
    setTimeSpent(0);

    // Load next question and refresh stats
    setTimeout(async () => {
      await loadSessionStats(); // This will update the questions attempted counter
      await loadNextQuestion();
    }, 1500);
  }, [currentQuestion, session, timeSpent, stopTimer, setSessionPoints, recordAttempt, setTotalTimeSpent, setTimeSpent, loadSessionStats, loadNextQuestion]);

  const handleNext = useCallback(async () => {
    await loadNextQuestion();
  }, [loadNextQuestion]);

  const handleEndMarathon = useCallback(() => {
    setShowEndConfirmation(true);
  }, [setShowEndConfirmation]);

  const confirmEndMarathon = useCallback(() => {
    stopTimer();
    endSession();
    setShowSummary(true);
    setShowEndConfirmation(false);
  }, [stopTimer, endSession, setShowSummary, setShowEndConfirmation]);

  return {
    loadNextQuestion,
    handleAnswer,
    handleNext,
    handleEndMarathon,
    confirmEndMarathon
  };
};
