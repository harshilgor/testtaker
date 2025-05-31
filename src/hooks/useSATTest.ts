
import { useState, useEffect } from 'react';
import { questionService, DatabaseQuestion } from '@/services/questionService';
import { useQuestionSession } from './useQuestionSession';

type SATSection = 'reading-writing' | 'math';
type SATModule = 1 | 2;

interface SATQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'grid-in';
  rationales?: {
    correct: string;
    incorrect: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
    };
  };
}

interface TestProgress {
  section: SATSection;
  module: SATModule;
  questionIndex: number;
  timeRemaining: number;
}

interface TestAnswer {
  questionId: string;
  answer: number | string | null;
  flagged: boolean;
  timeSpent: number;
}

interface ModuleResult {
  section: SATSection;
  module: SATModule;
  score: number;
  totalQuestions: number;
  timeUsed: number;
}

export const useSATTest = (userName: string) => {
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<TestProgress>({
    section: 'reading-writing',
    module: 1,
    questionIndex: 0,
    timeRemaining: 32 * 60 // 32 minutes in seconds
  });
  
  const [currentQuestions, setCurrentQuestions] = useState<SATQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<string, TestAnswer>>(new Map());
  const [moduleResults, setModuleResults] = useState<ModuleResult[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sessionId] = useState(() => `sat-${Date.now()}-${Math.random()}`);

  const { initializeSession, markQuestionUsed } = useQuestionSession();

  // Timer effect
  useEffect(() => {
    if (!testStarted || testCompleted) return;

    const timer = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev.timeRemaining <= 1) {
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted, currentProgress.section, currentProgress.module]);

  // Load questions for current module
  useEffect(() => {
    if (!testStarted) return;

    const loadQuestions = async () => {
      try {
        console.log(`Loading SAT questions for ${currentProgress.section} Module ${currentProgress.module}`);
        
        let dbQuestions: DatabaseQuestion[] = [];
        
        if (currentProgress.module === 1) {
          // Module 1: Standard difficulty mix
          const filters = {
            section: currentProgress.section,
            limit: 27
          };
          dbQuestions = await questionService.getRandomQuestions(filters);
        } else {
          // Module 2: Adaptive based on Module 1 performance
          const module1Results = moduleResults.find(
            r => r.section === currentProgress.section && r.module === 1
          );
          
          if (module1Results) {
            const performance = module1Results.score / module1Results.totalQuestions;
            const difficulty = performance >= 0.7 ? 'hard' : performance >= 0.4 ? 'medium' : 'easy';
            
            const filters = {
              section: currentProgress.section,
              difficulty,
              limit: 27
            };
            dbQuestions = await questionService.getRandomQuestions(filters);
          }
        }

        // Convert database questions to SAT format
        const satQuestions = dbQuestions.map(q => questionService.convertToSATFormat(q));
        
        console.log(`Loaded ${satQuestions.length} SAT questions`);
        setCurrentQuestions(satQuestions);

        // Mark questions as used in session
        for (const question of dbQuestions) {
          try {
            await markQuestionUsed(sessionId, 'mocktest', question.id);
          } catch (error) {
            console.error('Error marking question as used:', error);
          }
        }
        
      } catch (error) {
        console.error('Error loading SAT questions:', error);
        setCurrentQuestions([]);
      }
    };

    loadQuestions();
  }, [currentProgress.section, currentProgress.module, testStarted, moduleResults, sessionId, markQuestionUsed]);

  const startTest = async () => {
    try {
      setTestStarted(true);
      setStartTime(new Date());
      
      // Initialize session for question tracking
      await initializeSession(sessionId, 'mocktest');
      
      // Load initial questions for reading-writing module 1
      const filters = {
        section: 'reading-writing' as const,
        limit: 27
      };
      const dbQuestions = await questionService.getRandomQuestions(filters);
      const satQuestions = dbQuestions.map(q => questionService.convertToSATFormat(q));
      
      setCurrentQuestions(satQuestions);

      // Mark questions as used
      for (const question of dbQuestions) {
        try {
          await markQuestionUsed(sessionId, 'mocktest', question.id);
        } catch (error) {
          console.error('Error marking question as used:', error);
        }
      }
      
    } catch (error) {
      console.error('Error starting test:', error);
      setCurrentQuestions([]);
    }
  };

  const handleAnswerChange = (questionId: string, answer: number | string | null) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const existing = newAnswers.get(questionId) || {
        questionId,
        answer: null,
        flagged: false,
        timeSpent: 0
      };
      
      newAnswers.set(questionId, { ...existing, answer });
      return newAnswers;
    });
  };

  const handleFlagQuestion = (questionId: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const existing = newAnswers.get(questionId) || {
        questionId,
        answer: null,
        flagged: false,
        timeSpent: 0
      };
      
      newAnswers.set(questionId, { ...existing, flagged: !existing.flagged });
      return newAnswers;
    });
  };

  const finishTest = () => {
    setTestCompleted(true);
    
    const testResult = {
      userName,
      moduleResults,
      answers: Array.from(answers.entries()),
      completedAt: new Date().toISOString(),
      totalTime: startTime ? new Date().getTime() - startTime.getTime() : 0
    };
    
    const existingSATResults = JSON.parse(localStorage.getItem('satTestResults') || '[]');
    existingSATResults.push(testResult);
    localStorage.setItem('satTestResults', JSON.stringify(existingSATResults));
  };

  const resetTest = () => {
    setTestCompleted(false);
    setTestStarted(false);
    setCurrentProgress({
      section: 'reading-writing',
      module: 1,
      questionIndex: 0,
      timeRemaining: 32 * 60
    });
    setAnswers(new Map());
    setModuleResults([]);
  };

  return {
    testStarted,
    testCompleted,
    currentProgress,
    setCurrentProgress,
    currentQuestions,
    answers,
    moduleResults,
    setModuleResults,
    startTest,
    handleAnswerChange,
    handleFlagQuestion,
    finishTest,
    resetTest
  };
};
