
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuestionLoader } from './useQuestionLoader';

interface SessionStats {
  used: number;
  total: number;
}

export const useMarathonState = (session: any) => {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ used: 0, total: 0 });
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const loadSessionStats = useCallback(async () => {
    if (!session) return;
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: sessionData } = await supabase
        .from('question_sessions')
        .select('questions_used')
        .eq('session_id', session.id)
        .eq('session_type', 'marathon')
        .eq('user_id', user.user.id)
        .maybeSingle();

      const usedQuestions = sessionData?.questions_used || [];
      
      // Update session stats - this is what displays in the UI
      setSessionStats({
        used: usedQuestions.length,
        total: 3000 // Total available questions
      });

      console.log('Marathon session stats updated:', { used: usedQuestions.length, total: 3000 });
    } catch (error) {
      console.error('Error loading session stats:', error);
    }
  }, [session]);

  const loadUserPoints = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: attempts } = await supabase
        .from('question_attempts_v2')
        .select('points_earned')
        .eq('user_id', user.user.id);

      const total = attempts?.reduce((sum, attempt) => sum + (attempt.points_earned || 0), 0) || 0;
      setTotalPoints(total);
    } catch (error) {
      console.error('Error loading user points:', error);
    }
  }, []);

  const initializeSessionData = useCallback(async () => {
    await Promise.all([
      loadSessionStats(),
      loadUserPoints()
    ]);
  }, [loadSessionStats, loadUserPoints]);

  const startTimer = useCallback(() => {
    if (timer) clearInterval(timer);
    
    setTimeSpent(0);
    const newTimer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    setTimer(newTimer);
  }, [timer]);

  const stopTimer = useCallback(() => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [timer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  const { loadNextQuestion } = useQuestionLoader({
    session,
    setCurrentQuestion,
    setLoading,
    loadSessionStats, // This will refresh the counter after each question
    startTimer
  });

  return {
    currentQuestion,
    setCurrentQuestion,
    timeSpent,
    setTimeSpent,
    totalTimeSpent,
    setTotalTimeSpent,
    loading,
    setLoading,
    sessionStats,
    showEndConfirmation,
    setShowEndConfirmation,
    showSummary,
    setShowSummary,
    totalPoints,
    sessionPoints,
    setSessionPoints,
    loadUserPoints,
    loadSessionStats,
    initializeSessionData,
    stopTimer,
    startTimer,
    loadNextQuestion
  };
};
