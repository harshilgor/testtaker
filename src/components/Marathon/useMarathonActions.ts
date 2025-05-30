
import { useCallback } from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import { MarathonSession, QuestionAttempt } from '../../types/marathon';
import { useQuestionSession } from '@/hooks/useQuestionSession';
import { recordQuestionAttempt } from '@/services/pointsService';

interface UseMarathonActionsProps {
  session: MarathonSession | null;
  currentQuestion: DatabaseQuestion | null;
  timeSpent: number;
  setCurrentQuestion: (question: DatabaseQuestion | null) => void;
  setTimeSpent: (time: number) => void;
  setLoading: (loading: boolean) => void;
  setSessionPoints: (points: (prev: number) => number) => void;
  loadUserPoints: () => Promise<void>;
  loadSessionStats: () => Promise<void>;
  recordAttempt: (attempt: QuestionAttempt) => void;
  endSession: () => any;
  setShowSummary: (show: boolean) => void;
  setShowEndConfirmation: (show: boolean) => void;
}

export const useMarathonActions = ({
  session,
  currentQuestion,
  timeSpent,
  setCurrentQuestion,
  setTimeSpent,
  setLoading,
  setSessionPoints,
  loadUserPoints,
  loadSessionStats,
  recordAttempt,
  endSession,
  setShowSummary,
  setShowEndConfirmation
}: UseMarathonActionsProps) => {
  const { getNextQuestion, markQuestionUsed } = useQuestionSession();

  const loadNextQuestion = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    try {
      const filters: any = {};
      
      if (session.subjects.length > 0 && !session.subjects.includes('both')) {
        filters.subjects = session.subjects;
      }
      
      if (session.difficulty !== 'mixed') {
        filters.difficulty = session.difficulty;
      }

      const question = await getNextQuestion(session.id, 'marathon', filters);
      
      if (question) {
        setCurrentQuestion(question);
        setTimeSpent(0);
        await loadSessionStats();
      } else {
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Error loading next question:', error);
    } finally {
      setLoading(false);
    }
  }, [session, getNextQuestion, setCurrentQuestion, setTimeSpent, setLoading, loadSessionStats, setShowSummary]);

  const handleAnswer = useCallback(async (answer: string, isCorrect: boolean, showAnswerUsed: boolean) => {
    if (!currentQuestion || !session) return;

    try {
      await markQuestionUsed(session.id, 'marathon', currentQuestion.id);
      
      const points = await recordQuestionAttempt({
        question_id: currentQuestion.id,
        session_id: session.id,
        session_type: 'marathon',
        is_correct: isCorrect,
        difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
        subject: currentQuestion.section === 'math' ? 'math' : 'english',
        topic: currentQuestion.skill,
        time_spent: timeSpent
      });
      
      setSessionPoints(prev => prev + points);
      await loadUserPoints();

      const attempt: QuestionAttempt = {
        questionId: currentQuestion.id,
        subject: currentQuestion.section === 'math' ? 'math' : 'english',
        topic: currentQuestion.skill,
        difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
        isCorrect,
        timeSpent,
        hintsUsed: 0,
        showAnswerUsed,
        flagged: false,
        timestamp: new Date()
      };

      recordAttempt(attempt);
    } catch (error) {
      console.error('Error recording answer:', error);
    }
  }, [currentQuestion, session, timeSpent, markQuestionUsed, recordQuestionAttempt, setSessionPoints, loadUserPoints, recordAttempt]);

  const handleNext = useCallback(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  const handleEndMarathon = useCallback(() => {
    setShowEndConfirmation(true);
  }, [setShowEndConfirmation]);

  const confirmEndMarathon = useCallback(() => {
    endSession();
    setShowSummary(true);
    setShowEndConfirmation(false);
  }, [endSession, setShowSummary, setShowEndConfirmation]);

  return {
    loadNextQuestion,
    handleAnswer,
    handleNext,
    handleEndMarathon,
    confirmEndMarathon
  };
};
