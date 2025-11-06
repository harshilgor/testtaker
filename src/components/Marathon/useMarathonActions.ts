
import { useCallback } from 'react';
import { useQuestionLoader } from './useQuestionLoader';
import { useAnswerHandler } from './useAnswerHandler';
import { useMarathonNavigation } from './useMarathonNavigation';
import { MarathonSettings } from '../../types/marathon';

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
  settings?: MarathonSettings;
  getAdaptiveQuestions?: (questions: any[], sessionProgress: any, count: number, subject?: 'math' | 'english') => Promise<any[]>;
  sessionHistory?: string[];
  recordAnswer?: (questionId: string, isCorrect: boolean, timeSpent: number, difficulty: 'easy' | 'medium' | 'hard', targetSkill?: string) => Promise<void>;
  irtMarathon?: {
    selectNextQuestion: (questions: any[]) => Promise<any>;
    proficiency: any;
    phase: string;
    loading: boolean;
  } | null;
  irtMarathonForAnswer?: {
    recordAnswer: (isCorrect: boolean, itemParams: { a: number; b: number }) => Promise<any>;
    shouldStop: () => { stop: boolean; reason?: string };
    masteryAchieved: boolean;
  } | null;
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
    incrementQuestionsAttempted,
    settings,
    getAdaptiveQuestions,
    sessionHistory,
    recordAnswer,
    irtMarathon,
    irtMarathonForAnswer
  } = props;

  // Use the smaller, focused hooks
  const { loadNextQuestion } = useQuestionLoader({
    session,
    setCurrentQuestion,
    setLoading,
    loadSessionStats,
    startTimer,
    settings,
    getAdaptiveQuestions,
    sessionHistory,
    irtMarathon
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
    incrementQuestionsAttempted,
    recordAnswer,
    irtMarathon: irtMarathonForAnswer
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
