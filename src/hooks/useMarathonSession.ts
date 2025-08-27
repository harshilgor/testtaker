
import { useState, useEffect, useCallback } from 'react';
import { MarathonSession, QuestionAttempt, WeakTopic, MarathonSettings } from '../types/marathon';
import { questionService } from '@/services/questionService';

export const useMarathonSession = (settings?: MarathonSettings | null) => {
  const [session, setSession] = useState<MarathonSession | null>(null);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [questionPool, setQuestionPool] = useState<any[]>([]);
  const [poolIndex, setPoolIndex] = useState(0);

  // Preload questions when session starts
  const preloadQuestions = useCallback(async (marathonSettings: MarathonSettings) => {
    console.log('Preloading questions for marathon session...');
    
    try {
      const allQuestions = [];
      
      for (const subject of marathonSettings.subjects) {
        // Map subjects to database assessment field
        const section = subject === 'math' ? 'Math' : 'Reading and Writing';
        const filters = {
          section,
          difficulty: marathonSettings.difficulty === 'mixed' ? undefined : marathonSettings.difficulty,
          limit: 100 // Preload a large pool
        };
        
        const questions = await questionService.getRandomQuestions(filters);
        const formattedQuestions = questions.map(q => ({
          ...questionService.convertToLegacyFormat(q),
          subject: subject as 'math' | 'english'
        }));
        
        allQuestions.push(...formattedQuestions);
      }
      
      // Shuffle the questions
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setQuestionPool(shuffled);
      setPoolIndex(0);
      
      console.log(`Preloaded ${shuffled.length} questions for marathon`);
      
    } catch (error) {
      console.error('Error preloading questions:', error);
      setQuestionPool([]);
    }
  }, []);

  const startSession = useCallback(async (marathonSettings: MarathonSettings) => {
    console.log('Starting marathon session with settings:', marathonSettings);
    
    const newSession: MarathonSession = {
      id: `marathon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      showAnswerUsed: 0,
      subjects: marathonSettings.subjects,
      difficulty: marathonSettings.difficulty,
      timedMode: marathonSettings.timedMode,
      timeGoalMinutes: marathonSettings.timeGoalMinutes,
    };
    
    console.log('Created new marathon session:', newSession);
    
    setSession(newSession);
    setAttempts([]);
    
    // Preload questions immediately
    await preloadQuestions(marathonSettings);
    
    localStorage.setItem('currentMarathonSession', JSON.stringify(newSession));
  }, [preloadQuestions]);

  // Auto-start session when settings are provided
  useEffect(() => {
    if (settings && !session) {
      startSession(settings);
    }
  }, [settings, session, startSession]);

  const getNextQuestion = useCallback(() => {
    if (questionPool.length === 0) {
      console.log('No questions in pool');
      return null;
    }
    
    if (poolIndex >= questionPool.length) {
      // If we've used all questions, shuffle and restart
      const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
      setQuestionPool(shuffled);
      setPoolIndex(0);
      return shuffled[0];
    }
    
    const question = questionPool[poolIndex];
    setPoolIndex(prev => prev + 1);
    
    return question;
  }, [questionPool, poolIndex]);

  const recordAttempt = useCallback((attempt: QuestionAttempt) => {
    console.log('Recording attempt:', attempt);
    
    setAttempts(prev => {
      const newAttempts = [...prev, attempt];
      
      setSession(current => {
        if (!current) return current;
        
        const updated = {
          ...current,
          totalQuestions: current.totalQuestions + 1,
          correctAnswers: attempt.isCorrect ? current.correctAnswers + 1 : current.correctAnswers,
          incorrectAnswers: attempt.isCorrect ? current.incorrectAnswers : current.incorrectAnswers + 1,
          showAnswerUsed: attempt.showAnswerUsed ? current.showAnswerUsed + 1 : current.showAnswerUsed,
        };
        
        localStorage.setItem('currentMarathonSession', JSON.stringify(updated));
        return updated;
      });
      
      if (newAttempts.length % 5 === 0) {
        analyzeWeakTopics(newAttempts);
      }
      
      return newAttempts;
    });
  }, []);

  const analyzeWeakTopics = useCallback((allAttempts: QuestionAttempt[]) => {
    const topicStats: { [key: string]: { total: number; correct: number; subject: 'math' | 'english' } } = {};
    
    allAttempts.forEach(attempt => {
      const key = `${attempt.subject}_${attempt.topic}`;
      if (!topicStats[key]) {
        topicStats[key] = { total: 0, correct: 0, subject: attempt.subject };
      }
      topicStats[key].total += 1;
      if (attempt.isCorrect) topicStats[key].correct += 1;
    });
    
    const weak = Object.entries(topicStats)
      .map(([key, stats]) => ({
        topic: key.split('_')[1],
        subject: stats.subject,
        totalAttempts: stats.total,
        correctAttempts: stats.correct,
        accuracy: stats.correct / stats.total,
      }))
      .filter(topic => topic.totalAttempts >= 3 && topic.accuracy < 0.7)
      .sort((a, b) => a.accuracy - b.accuracy);
    
    setWeakTopics(weak);
  }, []);

  const endSession = useCallback(() => {
    if (!session) return null;
    
    const endedSession = {
      ...session,
      endTime: new Date(),
    };
    
    setSession(endedSession);
    localStorage.removeItem('currentMarathonSession');
    
    console.log('Marathon session ended:', endedSession);
    
    return {
      session: endedSession,
      attempts,
      weakTopics,
    };
  }, [session, attempts, weakTopics]);

  const toggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions(prev => {
      const newFlagged = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      
      localStorage.setItem('flaggedQuestions', JSON.stringify(newFlagged));
      return newFlagged;
    });
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem('currentMarathonSession');
    const savedFlagged = localStorage.getItem('flaggedQuestions');
    
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        console.log('Restored marathon session from localStorage:', parsed);
        setSession(parsed);
      } catch (error) {
        console.error('Error parsing saved session:', error);
        localStorage.removeItem('currentMarathonSession');
      }
    }
    
    if (savedFlagged) {
      try {
        setFlaggedQuestions(JSON.parse(savedFlagged));
      } catch (error) {
        console.error('Error parsing flagged questions:', error);
        localStorage.removeItem('flaggedQuestions');
      }
    }
  }, []);

  return {
    session,
    attempts,
    weakTopics,
    flaggedQuestions,
    questionPool,
    getNextQuestion,
    startSession,
    recordAttempt,
    endSession,
    toggleFlag,
  };
};
