
import React from 'react';

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

interface SATModuleHandlerProps {
  currentQuestions: any[];
  answers: Map<string, TestAnswer>;
  currentProgress: TestProgress;
  setCurrentProgress: (progress: TestProgress) => void;
  moduleResults: ModuleResult[];
  setModuleResults: (results: ModuleResult[]) => void;
  onTestComplete: () => void;
}

export const useSATModuleHandler = ({
  currentQuestions,
  answers,
  currentProgress,
  setCurrentProgress,
  moduleResults,
  setModuleResults,
  onTestComplete
}: SATModuleHandlerProps) => {
  const handleModuleComplete = () => {
    const moduleQuestions = currentQuestions;
    let correctAnswers = 0;
    
    moduleQuestions.forEach(question => {
      const userAnswer = answers.get(question.id);
      if (userAnswer && userAnswer.answer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const moduleResult: ModuleResult = {
      section: currentProgress.section,
      module: currentProgress.module,
      score: correctAnswers,
      totalQuestions: moduleQuestions.length,
      timeUsed: currentProgress.module === 1 ? 32 * 60 - currentProgress.timeRemaining : 32 * 60 - currentProgress.timeRemaining
    };

    setModuleResults(prev => [...prev, moduleResult]);

    // Advance to next module/section
    if (currentProgress.section === 'reading-writing' && currentProgress.module === 1) {
      setCurrentProgress({
        section: 'reading-writing',
        module: 2,
        questionIndex: 0,
        timeRemaining: 32 * 60
      });
    } else if (currentProgress.section === 'reading-writing' && currentProgress.module === 2) {
      setCurrentProgress({
        section: 'math',
        module: 1,
        questionIndex: 0,
        timeRemaining: 35 * 60
      });
    } else if (currentProgress.section === 'math' && currentProgress.module === 1) {
      setCurrentProgress({
        section: 'math',
        module: 2,
        questionIndex: 0,
        timeRemaining: 35 * 60
      });
    } else {
      onTestComplete();
    }
  };

  return { handleModuleComplete };
};
