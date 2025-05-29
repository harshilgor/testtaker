import React, { useState, useEffect } from 'react';
import { SATQuestion, getSATQuestions, getAdaptiveQuestions } from '../data/satQuestions';
import SATQuestionView from './SATQuestionView';
import SATResults from './SATResults';
import SATTestHeader from './SATTestHeader';
import SATTestIntroduction from './SATTestIntroduction';
import SATQuestionNavigator from './SATQuestionNavigator';

interface SATMockTestProps {
  userName: string;
  onBack: () => void;
}

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

const SATMockTest: React.FC<SATMockTestProps> = ({ userName, onBack }) => {
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
  const [showNavigator, setShowNavigator] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!testStarted || testCompleted) return;

    const timer = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - auto advance to next module
          handleModuleComplete();
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
      // Load Module 1 questions
      const questions = getSATQuestions(currentProgress.section, 1);
      setCurrentQuestions(questions);
    } else {
      // Load Module 2 with adaptive difficulty based on Module 1 performance
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

  const handleNextQuestion = () => {
    if (currentProgress.questionIndex < currentQuestions.length - 1) {
      setCurrentProgress(prev => ({ ...prev, questionIndex: prev.questionIndex + 1 }));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentProgress.questionIndex > 0) {
      setCurrentProgress(prev => ({ ...prev, questionIndex: prev.questionIndex - 1 }));
    }
  };

  const handleModuleComplete = () => {
    // Calculate module score
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
      // Go to Reading & Writing Module 2
      setCurrentProgress({
        section: 'reading-writing',
        module: 2,
        questionIndex: 0,
        timeRemaining: 32 * 60
      });
    } else if (currentProgress.section === 'reading-writing' && currentProgress.module === 2) {
      // Go to Math Module 1
      setCurrentProgress({
        section: 'math',
        module: 1,
        questionIndex: 0,
        timeRemaining: 35 * 60
      });
    } else if (currentProgress.section === 'math' && currentProgress.module === 1) {
      // Go to Math Module 2
      setCurrentProgress({
        section: 'math',
        module: 2,
        questionIndex: 0,
        timeRemaining: 35 * 60
      });
    } else {
      // Test complete
      finishTest();
    }
  };

  const finishTest = () => {
    setTestCompleted(true);
    
    // Save test results to localStorage
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

  const getCurrentQuestion = () => {
    return currentQuestions[currentProgress.questionIndex];
  };

  const getAnsweredCount = () => {
    return currentQuestions.filter(q => answers.has(q.id) && answers.get(q.id)?.answer !== null).length;
  };

  const getFlaggedCount = () => {
    return currentQuestions.filter(q => answers.get(q.id)?.flagged).length;
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentProgress(prev => ({ ...prev, questionIndex: index }));
  };

  if (testCompleted) {
    return (
      <SATResults
        userName={userName}
        moduleResults={moduleResults}
        answers={answers}
        allQuestions={currentQuestions}
        onBack={onBack}
        onRetake={() => {
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
        }}
      />
    );
  }

  if (!testStarted) {
    return <SATTestIntroduction onStartTest={startTest} />;
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-gray-50">
      <SATTestHeader
        onBack={onBack}
        section={currentProgress.section}
        module={currentProgress.module}
        timeRemaining={currentProgress.timeRemaining}
        questionIndex={currentProgress.questionIndex}
        totalQuestions={currentQuestions.length}
        answeredCount={getAnsweredCount()}
        flaggedCount={getFlaggedCount()}
        showNavigator={showNavigator}
        onToggleNavigator={() => setShowNavigator(!showNavigator)}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 flex gap-6">
        {/* Question Area */}
        <div className="flex-1">
          {currentQuestion && (
            <SATQuestionView
              question={currentQuestion}
              selectedAnswer={answers.get(currentQuestion.id)?.answer || null}
              isFlagged={answers.get(currentQuestion.id)?.flagged || false}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
              onFlag={() => handleFlagQuestion(currentQuestion.id)}
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
              canGoNext={currentProgress.questionIndex < currentQuestions.length - 1}
              canGoPrevious={currentProgress.questionIndex > 0}
              isLastQuestion={currentProgress.questionIndex === currentQuestions.length - 1}
              onModuleComplete={handleModuleComplete}
            />
          )}
        </div>

        {/* Question Navigator */}
        {showNavigator && (
          <SATQuestionNavigator
            questions={currentQuestions}
            answers={answers}
            currentQuestionIndex={currentProgress.questionIndex}
            onQuestionSelect={handleQuestionSelect}
          />
        )}
      </div>
    </div>
  );
};

export default SATMockTest;
