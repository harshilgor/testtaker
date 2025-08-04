
import { useCallback } from 'react';
import { useQuestionLoader } from './useQuestionLoader';
import { useAnswerHandler } from './useAnswerHandler';
import { useMarathonNavigation } from './useMarathonNavigation';

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
  incrementQuestionsAttempted: () => void;
}

export const useMarathonActions = (props: UseMarathonActionsProps) => {
  const {
    session,
    currentQuestion,
    timeSpent,
    setCurrentQuestion,
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
    startTimer,
    incrementQuestionsAttempted
  } = props;

  // Use the smaller, focused hooks
  const { loadNextQuestion } = useQuestionLoader({
    session,
    setCurrentQuestion,
    setLoading,
    loadSessionStats,
    startTimer
  });

  const { handleAnswer } = useAnswerHandler({
    currentQuestion,
    timeSpent,
    session,
    sessionPoints,
    setSessionPoints,
    recordAttempt,
    loadUserPoints,
    stopTimer,
    incrementQuestionsAttempted
  });

  const { handleEndMarathon, confirmEndMarathon } = useMarathonNavigation({
    setShowEndConfirmation,
    setShowSummary,
    endSession,
    loadUserPoints,
    loadSessionStats,
    stopTimer
  });

  const handleNext = useCallback(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  return {
    loadNextQuestion,
    handleAnswer,
    handleNext,
    handleEndMarathon,
    confirmEndMarathon
  };
};
