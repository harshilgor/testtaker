
import { useState, useCallback } from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import { MarathonSession } from '../../types/marathon';
import { getUserTotalPoints } from '@/services/pointsService';
import { useQuestionSession } from '@/hooks/useQuestionSession';

interface SessionStats {
  used: number;
  total: number;
}

interface UseMarathonStateReturn {
  currentQuestion: DatabaseQuestion | null;
  setCurrentQuestion: (question: DatabaseQuestion | null) => void;
  timeSpent: number;
  setTimeSpent: (time: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sessionStats: SessionStats;
  showEndConfirmation: boolean;
  setShowEndConfirmation: (show: boolean) => void;
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  totalPoints: number;
  sessionPoints: number;
  setSessionPoints: (points: number | ((prev: number) => number)) => void;
  loadUserPoints: () => Promise<void>;
  loadSessionStats: () => Promise<void>;
  initializeSessionData: () => Promise<void>;
}

export const useMarathonState = (session: MarathonSession | null): UseMarathonStateReturn => {
  const [currentQuestion, setCurrentQuestion] = useState<DatabaseQuestion | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ used: 0, total: 0 });
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);

  const { getSessionStats, initializeSession } = useQuestionSession();

  const loadUserPoints = useCallback(async () => {
    try {
      const points = await getUserTotalPoints();
      setTotalPoints(points);
    } catch (error) {
      console.error('Error loading user points:', error);
    }
  }, []);

  const loadSessionStats = useCallback(async () => {
    if (!session) return;
    
    try {
      const stats = await getSessionStats(session.id, 'marathon');
      setSessionStats(stats);
    } catch (error) {
      console.error('Error loading session stats:', error);
    }
  }, [session, getSessionStats]);

  const initializeSessionData = useCallback(async () => {
    if (!session) return;
    
    try {
      await initializeSession(session.id, 'marathon');
      await loadUserPoints();
      await loadSessionStats();
    } catch (error) {
      console.error('Error initializing session data:', error);
    }
  }, [session, initializeSession, loadUserPoints, loadSessionStats]);

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
