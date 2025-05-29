
import { useState, useEffect } from 'react';
import { SATQuestion, getSATQuestions, getAdaptiveQuestions } from '../data/satQuestions';

type SATSection = 'reading-writing' | 'math';
type SATModule = 1 | 2;

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

    if (currentProgress.module === 1) {
      const questions = getSATQuestions(currentProgress.section, 1);
      setCurrentQuestions(questions);
    } else {
      const module1Results = moduleResults.find(
        r => r.section === currentProgress.section && r.module === 1
      );
      
      if (module1Results) {
        const performance = module1Results.score / module1Results.totalQuestions;
        const adaptiveQuestions = getAdaptiveQuestions(currentProgress.section, performance);
        setCurrentQuestions(adaptiveQuestions);
      }
    }
  }, [currentProgress.section, currentProgress.module, testStarted, moduleResults]);

  const startTest = () => {
    setTestStarted(true);
    setStartTime(new Date());
    const questions = getSATQuestions('reading-writing', 1);
    setCurrentQuestions(questions);
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
