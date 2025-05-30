
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
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const { getSessionStats, getTotalQuestions, initializeSession } = useQuestionSession();

  // Timer effect
  useEffect(() => {
    if (!session || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session, currentQuestion]);

  const loadUserPoints = async () => {
    try {
      const points = await getUserTotalPoints();
      setTotalPoints(points);
    } catch (error) {
      console.error('Error loading user points:', error);
    }
  };

  const loadSessionStats = async () => {
    if (!session) return;
    
    try {
      const stats = await getSessionStats(session.id, 'marathon');
      const total = await getTotalQuestions();
      setSessionStats({ used: stats.used, total: total });
      console.log('Session stats:', { used: stats.used, total });
    } catch (error) {
      console.error('Error loading session stats:', error);
    }
  };

  const initializeSessionData = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      await initializeSession(session.id, 'marathon');
      await loadSessionStats();
      await loadUserPoints();
    } catch (error) {
      console.error('Error initializing marathon session:', error);
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
    sessionInitialized,
    setSessionInitialized,
    loadUserPoints,
    loadSessionStats,
    initializeSessionData
  };
};
