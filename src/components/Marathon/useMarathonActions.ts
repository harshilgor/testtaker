
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

  const { handleAnswer } = useAnswerHandler({
    currentQuestion,
    timeSpent,
    recordAttempt,
    setSessionPoints,
    sessionPoints,
    session,
    loadUserPoints,
    stopTimer
  });

  const { handleNext, handleEndMarathon, confirmEndMarathon } = useMarathonNavigation({
    loadNextQuestion,
    setShowEndConfirmation,
    stopTimer,
    endSession,
    loadUserPoints,
    loadSessionStats,
    setShowSummary
  });

  return {
    loadNextQuestion,
    handleAnswer,
    handleNext,
    handleEndMarathon,
    confirmEndMarathon
  };
};
