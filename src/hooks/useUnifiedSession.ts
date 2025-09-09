import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SessionType = 'quiz' | 'marathon' | 'sat' | 'practice';

interface SessionConfig {
  sessionType: SessionType;
  subjects?: string[];
  topics?: string[];
  difficulty?: string;
  timedMode?: boolean;
  timeLimit?: number;
}

interface SessionAttempt {
  questionId: string;
  isCorrect: boolean;
  timeSpent: number;
  selectedAnswer: number | string;
  showAnswerUsed?: boolean;
  hintsUsed?: number;
  flagged?: boolean;
}

interface SessionData {
  id: string;
  userId: string;
  sessionType: SessionType;
  config: SessionConfig;
  startTime: Date;
  endTime?: Date;
  attempts: SessionAttempt[];
  totalQuestions: number;
  correctAnswers: number;
  score?: number;
  completed: boolean;
}

export const useUnifiedSession = () => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [attempts, setAttempts] = useState<SessionAttempt[]>([]);
  const sessionStartTime = useRef<Date | null>(null);

  const startSession = useCallback(async (config: SessionConfig): Promise<string> => {
    const sessionId = `${config.sessionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const session: SessionData = {
      id: sessionId,
      userId: '', // Will be filled from auth
      sessionType: config.sessionType,
      config,
      startTime: now,
      attempts: [],
      totalQuestions: 0,
      correctAnswers: 0,
      completed: false
    };

    setCurrentSession(session);
    setAttempts([]);
    sessionStartTime.current = now;

    // Store in localStorage for recovery
    localStorage.setItem(`current_${config.sessionType}_session`, JSON.stringify(session));

    return sessionId;
  }, []);

  const recordAttempt = useCallback((attempt: SessionAttempt) => {
    if (!currentSession) return;

    const newAttempts = [...attempts, attempt];
    setAttempts(newAttempts);

    // Update session stats
    const correctCount = newAttempts.filter(a => a.isCorrect).length;
    const updatedSession = {
      ...currentSession,
      attempts: newAttempts,
      totalQuestions: newAttempts.length,
      correctAnswers: correctCount,
      score: newAttempts.length > 0 ? Math.round((correctCount / newAttempts.length) * 100) : 0
    };

    setCurrentSession(updatedSession);
    
    // Update localStorage
    localStorage.setItem(`current_${currentSession.sessionType}_session`, JSON.stringify(updatedSession));
  }, [currentSession, attempts]);

  const endSession = useCallback(async (): Promise<SessionData | null> => {
    if (!currentSession) return null;

    const endTime = new Date();
    const finalSession = {
      ...currentSession,
      endTime,
      completed: true,
      attempts
    };

    setCurrentSession(finalSession);

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save session to appropriate table based on type
        const sessionData = {
          user_id: user.id,
          session_type: currentSession.sessionType,
          started_at: currentSession.startTime.toISOString(),
          completed_at: endTime.toISOString(),
          total_questions: finalSession.totalQuestions,
          correct_answers: finalSession.correctAnswers,
          score_percentage: finalSession.score || 0,
          session_config: currentSession.config
        };

        // Save attempts
        if (attempts.length > 0) {
          const attemptData = attempts.map(attempt => ({
            user_id: user.id,
            session_id: currentSession.id,
            session_type: currentSession.sessionType,
            question_id: attempt.questionId,
            subject: currentSession.config.subjects?.[0] || 'unknown',
            topic: 'general', // Will be filled from actual question data
            difficulty: currentSession.config.difficulty || 'medium',
            is_correct: attempt.isCorrect,
            time_spent: attempt.timeSpent,
            points_earned: attempt.isCorrect ? 10 : 0 // Default point system
          }));

          await supabase
            .from('question_attempts_v2')
            .insert(attemptData);
        }
      }
    } catch (error) {
      console.error('Error saving session data:', error);
    }

    // Clear localStorage
    localStorage.removeItem(`current_${currentSession.sessionType}_session`);

    return finalSession;
  }, [currentSession, attempts]);

  const pauseSession = useCallback(() => {
    if (!currentSession) return;

    // Save current state to localStorage
    const pausedSession = {
      ...currentSession,
      attempts
    };
    
    localStorage.setItem(`paused_${currentSession.sessionType}_session`, JSON.stringify(pausedSession));
  }, [currentSession, attempts]);

  const resumeSession = useCallback((sessionType: SessionType): SessionData | null => {
    const saved = localStorage.getItem(`paused_${sessionType}_session`);
    if (!saved) return null;

    try {
      const session = JSON.parse(saved);
      setCurrentSession(session);
      setAttempts(session.attempts || []);
      localStorage.removeItem(`paused_${sessionType}_session`);
      return session;
    } catch (error) {
      console.error('Error resuming session:', error);
      return null;
    }
  }, []);

  const getSessionStats = useCallback(() => {
    if (!currentSession || attempts.length === 0) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        totalTime: 0
      };
    }

    const totalTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    const correctCount = attempts.filter(a => a.isCorrect).length;

    return {
      totalQuestions: attempts.length,
      correctAnswers: correctCount,
      incorrectAnswers: attempts.length - correctCount,
      accuracy: Math.round((correctCount / attempts.length) * 100),
      averageTime: Math.round(totalTime / attempts.length),
      totalTime
    };
  }, [currentSession, attempts]);

  return {
    currentSession,
    attempts,
    startSession,
    recordAttempt,
    endSession,
    pauseSession,
    resumeSession,
    getSessionStats
  };
};