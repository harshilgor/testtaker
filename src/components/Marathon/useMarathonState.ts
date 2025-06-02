
import { useState, useEffect } from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import { MarathonSession } from '../../types/marathon';
import { useQuestionSession } from '@/hooks/useQuestionSession';
import { getUserTotalPoints } from '@/services/pointsService';

export const useMarathonState = (session: MarathonSession | null) => {
  const [currentQuestion, setCurrentQuestion] = useState<DatabaseQuestion | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({ used: 0, total: 0 });
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);

  const { getSessionStats, getTotalQuestions, initializeSession } = useQuestionSession();

  useEffect(() => {
    if (!session || !currentQuestion) return;

    console.log('useMarathonState: Starting timer for question', currentQuestion.id);
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => {
      console.log('useMarathonState: Clearing timer');
      clearInterval(timer);
    };
  }, [session, currentQuestion]);

  const loadUserPoints = async () => {
    console.log('useMarathonState: Loading user points');
    try {
      const points = await getUserTotalPoints();
      console.log('useMarathonState: Loaded points:', points);
      setTotalPoints(points);
    } catch (error) {
      console.error('useMarathonState: Error loading user points:', error);
    }
  };

  const loadSessionStats = async () => {
    if (!session) {
      console.log('useMarathonState: No session for stats loading');
      return;
    }
    
    console.log('useMarathonState: Loading session stats for', session.id);
    try {
      const stats = await getSessionStats(session.id, 'marathon');
      const total = await getTotalQuestions();
      console.log('useMarathonState: Session stats loaded', { used: stats.used, total });
      setSessionStats({ used: stats.used, total: total });
    } catch (error) {
      console.error('useMarathonState: Error loading session stats:', error);
    }
  };

  const initializeSessionData = async () => {
    if (!session) {
      console.log('useMarathonState: No session for initialization');
      return;
    }
    
    console.log('useMarathonState: Initializing session data for', session.id);
    setLoading(true);
    try {
      await initializeSession(session.id, 'marathon');
      await loadSessionStats();
      await loadUserPoints();
      console.log('useMarathonState: Session initialization complete');
    } catch (error) {
      console.error('useMarathonState: Error initializing marathon session:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentQuestion,
    setCurrentQuestion,
    timeSpent,
    setTimeSpent,
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
    initializeSessionData
  };
};
