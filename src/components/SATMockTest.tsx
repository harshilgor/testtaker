
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Flag, Calculator, Eye } from 'lucide-react';
import { SATQuestion, getSATQuestions, getAdaptiveQuestions } from '../data/satQuestions';
import SATQuestionView from './SATQuestionView';
import SATResults from './SATResults';

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Digital SAT Practice Test</h1>
              <p className="text-gray-600 mb-6">
                This practice test mirrors the official Digital SAT format with adaptive modules and real timing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-4">Section 1: Reading and Writing</h3>
                <ul className="text-blue-800 space-y-2">
                  <li>• Module 1: 27 questions (32 minutes)</li>
                  <li>• Module 2: 27 questions (32 minutes)</li>
                  <li>• Adaptive difficulty based on Module 1 performance</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-4">Section 2: Math</h3>
                <ul className="text-green-800 space-y-2">
                  <li>• Module 1: 22 questions (35 minutes)</li>
                  <li>• Module 2: 22 questions (35 minutes)</li>
                  <li>• Calculator available throughout</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={startTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Start SAT Practice Test
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Total test time: approximately 2 hours and 14 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = ((currentProgress.questionIndex + 1) / currentQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer and Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Test
            </Button>
            <div className="text-sm text-gray-600">
              {currentProgress.section === 'reading-writing' ? 'Reading and Writing' : 'Math'} - Module {currentProgress.module}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className={`font-mono text-lg ${currentProgress.timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'}`}>
                {formatTime(currentProgress.timeRemaining)}
              </span>
            </div>
            
            {currentProgress.section === 'math' && (
              <Calculator className="h-5 w-5 text-gray-500" />
            )}
            
            <Button
              onClick={() => setShowNavigator(!showNavigator)}
              variant="outline"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              Navigator
            </Button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Question {currentProgress.questionIndex + 1} of {currentQuestions.length}</span>
            <span>{getAnsweredCount()} answered, {getFlaggedCount()} flagged</span>
          </div>
        </div>
      </div>

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
          <div className="w-80 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-4">Question Navigator</h3>
            <div className="grid grid-cols-6 gap-2">
              {currentQuestions.map((question, index) => {
                const answer = answers.get(question.id);
                const isAnswered = answer?.answer !== null && answer?.answer !== undefined;
                const isFlagged = answer?.flagged || false;
                const isCurrent = index === currentProgress.questionIndex;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentProgress(prev => ({ ...prev, questionIndex: index }))}
                    className={`w-8 h-8 text-xs font-medium rounded ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isAnswered
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    } ${isFlagged ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                <span>Flagged</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SATMockTest;
