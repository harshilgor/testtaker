
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Flag, X, CheckCircle, ChevronDown } from 'lucide-react';
import SATMockTestResults from './SATMockTestResults';

interface Question {
  id: string;
  content: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
}

interface TestAnswer {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number;
  flagged: boolean;
}

interface SATMockTestInterfaceProps {
  onBack: () => void;
}

type TestSection = 'reading-writing' | 'math';
type TestModule = 1 | 2;

interface TestProgress {
  section: TestSection;
  module: TestModule;
  questionIndex: number;
  timeRemaining: number;
}

const SATMockTestInterface: React.FC<SATMockTestInterfaceProps> = ({ onBack }) => {
  const [currentProgress, setCurrentProgress] = useState<TestProgress>({
    section: 'reading-writing',
    module: 1,
    questionIndex: 0,
    timeRemaining: 32 * 60 // 32 minutes for Reading & Writing Module 1
  });
  
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [eliminatedAnswers, setEliminatedAnswers] = useState<{ [key: string]: Set<number> }>({});
  const [eliminateMode, setEliminateMode] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [showNavigator, setShowNavigator] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [moduleResults, setModuleResults] = useState<any[]>([]);

  // Generate questions based on current section and module
  const getQuestionsForCurrentModule = (): Question[] => {
    const { section, module } = currentProgress;
    const questionCount = section === 'reading-writing' ? 27 : 22;
    
    return Array.from({ length: questionCount }, (_, i) => ({
      id: `${section}-m${module}-q${i + 1}`,
      content: i === 0 && section === 'reading-writing' && module === 1
        ? "During a spirited class debate about the most influential technological innovations of the 21st century, one student asserted that social media platforms have ____ our ability to communicate effectively. She argued that while these platforms have increased the quantity of our communication, the quality and depth have significantly diminished."
        : `Sample ${section} question ${i + 1} for Module ${module}...`,
      passage: section === 'reading-writing' ? "Sample passage content for context..." : undefined,
      options: section === 'reading-writing' 
        ? ["enhanced", "expanded", "undermined", "diversified"]
        : ["2", "4", "8", "13"],
      correctAnswer: section === 'reading-writing' ? 2 : 1,
      explanation: `This is the explanation for ${section} Module ${module} question ${i + 1}.`,
      section,
      topic: section === 'reading-writing' ? 'Writing and Language' : 'Algebra'
    }));
  };

  const currentQuestions = getQuestionsForCurrentModule();
  const currentQuestion = currentQuestions[currentProgress.questionIndex];
  const currentQuestionId = currentQuestion?.id || '';

  // Timer effect
  useEffect(() => {
    if (!testCompleted && !showTransition) {
      const timer = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev.timeRemaining <= 1) {
            handleModuleComplete();
            return prev;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testCompleted, showTransition]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (!eliminateMode) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerIndex
      }));
    }
  };

  const handleEliminateAnswer = (questionId: string, answerIndex: number) => {
    if (eliminateMode) {
      setEliminatedAnswers(prev => {
        const questionEliminated = prev[questionId] || new Set();
        const newEliminated = new Set(questionEliminated);
        
        if (newEliminated.has(answerIndex)) {
          newEliminated.delete(answerIndex);
        } else {
          newEliminated.add(answerIndex);
        }
        
        return {
          ...prev,
          [questionId]: newEliminated
        };
      });
    }
  };

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Navigate to specific question
  const navigateToQuestion = (index: number) => {
    setCurrentProgress(prev => ({ ...prev, questionIndex: index }));
    setShowNavigator(false);
  };

  // Calculate performance for adaptive logic
  const calculateModulePerformance = () => {
    let correctCount = 0;
    currentQuestions.forEach(question => {
      const userAnswer = selectedAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const totalQuestions = currentQuestions.length;
    const performance = correctCount / totalQuestions;
    
    // Threshold for harder module 2: 70% for Reading/Writing, 75% for Math
    const threshold = currentProgress.section === 'reading-writing' ? 0.7 : 0.75;
    
    return {
      performance,
      goToHardModule: performance >= threshold,
      correctCount,
      totalQuestions
    };
  };

  const handleModuleComplete = () => {
    const modulePerformance = calculateModulePerformance();
    
    // Store module result
    const moduleResult = {
      section: currentProgress.section,
      module: currentProgress.module,
      correctCount: modulePerformance.correctCount,
      totalQuestions: modulePerformance.totalQuestions,
      performance: modulePerformance.performance
    };
    
    setModuleResults(prev => [...prev, moduleResult]);

    if (currentProgress.module === 1) {
      // Show transition screen
      setShowTransition(true);
      
      setTimeout(() => {
        setShowTransition(false);
        
        // Move to Module 2
        setCurrentProgress(prev => ({
          ...prev,
          module: 2,
          questionIndex: 0,
          timeRemaining: prev.section === 'reading-writing' ? 32 * 60 : 35 * 60
        }));
      }, 3000);
    } else if (currentProgress.section === 'reading-writing' && currentProgress.module === 2) {
      // Move to Math Module 1
      setCurrentProgress({
        section: 'math',
        module: 1,
        questionIndex: 0,
        timeRemaining: 35 * 60
      });
    } else {
      // Test completed
      setTestCompleted(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentProgress.questionIndex < currentQuestions.length - 1) {
      setCurrentProgress(prev => ({ ...prev, questionIndex: prev.questionIndex + 1 }));
    } else {
      handleModuleComplete();
    }
  };

  const generateTestAnswers = (): Map<string, TestAnswer> => {
    const answers = new Map();
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Combine all questions from all modules
    const allQuestions: Question[] = [];
    
    // Add questions from completed modules and current module
    moduleResults.forEach(result => {
      const moduleQuestions = Array.from({ length: result.totalQuestions }, (_, i) => ({
        id: `${result.section}-m${result.module}-q${i + 1}`,
        content: `Question ${i + 1}`,
        options: ["A", "B", "C", "D"],
        correctAnswer: 0,
        explanation: "Explanation",
        section: result.section,
        topic: "Topic"
      }));
      allQuestions.push(...moduleQuestions);
    });
    
    // Add current module questions
    allQuestions.push(...currentQuestions);
    
    allQuestions.forEach((question) => {
      const selectedAnswer = selectedAnswers[question.id];
      const isCorrect = selectedAnswer === question.correctAnswer;
      
      answers.set(question.id, {
        questionId: question.id,
        selectedAnswer: selectedAnswer !== undefined ? selectedAnswer : null,
        isCorrect,
        timeSpent: Math.floor(totalTimeSpent / allQuestions.length),
        flagged: markedForReview.has(question.id)
      });
    });
    
    return answers;
  };

  const handleRetakeTest = () => {
    // Reset all state
    setCurrentProgress({
      section: 'reading-writing',
      module: 1,
      questionIndex: 0,
      timeRemaining: 32 * 60
    });
    setSelectedAnswers({});
    setMarkedForReview(new Set());
    setEliminatedAnswers({});
    setEliminateMode(false);
    setTestCompleted(false);
    setModuleResults([]);
  };

  // Show transition screen
  if (showTransition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Analyzing your performance...</h2>
          <p className="text-indigo-200">Preparing your next module</p>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    const testAnswers = generateTestAnswers();
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Create all questions for results
    const allQuestions: Question[] = [];
    moduleResults.forEach(result => {
      const moduleQuestions = Array.from({ length: result.totalQuestions }, (_, i) => ({
        id: `${result.section}-m${result.module}-q${i + 1}`,
        content: `Question ${i + 1}`,
        options: ["A", "B", "C", "D"],
        correctAnswer: 0,
        explanation: "Explanation",
        section: result.section,
        topic: "Topic"
      }));
      allQuestions.push(...moduleQuestions);
    });
    allQuestions.push(...currentQuestions);
    
    return (
      <SATMockTestResults
        answers={testAnswers}
        questions={allQuestions}
        totalTimeSpent={totalTimeSpent}
        onRetakeTest={handleRetakeTest}
        onBackToHome={onBack}
      />
    );
  }

  const currentEliminated = eliminatedAnswers[currentQuestionId] || new Set();
  const currentAnswer = selectedAnswers[currentQuestionId];

  // Question Navigator Modal
  const QuestionNavigator = () => (
    showNavigator && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Section {currentProgress.section === 'reading-writing' ? '1' : '2'}, Module {currentProgress.module}: {currentProgress.section === 'reading-writing' ? 'Reading and Writing' : 'Math'} Questions
            </h3>
            <Button
              onClick={() => setShowNavigator(false)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded border-2 border-gray-300"></div>
              <span>Unanswered</span>
            </div>
            <div className="flex items-center space-x-2">
              <Flag className="h-4 w-4 text-red-500" />
              <span>For Review</span>
            </div>
          </div>
          
          <div className="grid grid-cols-10 gap-2 mb-6">
            {currentQuestions.map((_, index) => {
              const questionId = currentQuestions[index].id;
              const isAnswered = selectedAnswers[questionId] !== undefined;
              const isMarked = markedForReview.has(questionId);
              const isCurrent = currentProgress.questionIndex === index;
              
              return (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  className={`relative w-12 h-12 rounded border-2 text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isAnswered
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {index + 1}
                  {isMarked && (
                    <Flag className="h-3 w-3 absolute -top-1 -right-1 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={() => setShowNavigator(false)}
              variant="outline"
              className="px-6"
            >
              Go to Review Page
            </Button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 rounded px-3 py-1 text-sm font-medium">
            SAT
          </div>
          <span className="text-sm">
            Section {currentProgress.section === 'reading-writing' ? '1' : '2'}, Module {currentProgress.module}: {currentProgress.section === 'reading-writing' ? 'Reading and Writing' : 'Math'}
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-lg font-mono">
            <span>{formatTime(currentProgress.timeRemaining)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <span>Eliminate Answers</span>
            <Switch
              checked={eliminateMode}
              onCheckedChange={setEliminateMode}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-lg leading-relaxed text-gray-900">
              {currentQuestion.content}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="mark-review"
                checked={markedForReview.has(currentQuestionId)}
                onCheckedChange={() => toggleMarkForReview(currentQuestionId)}
              />
              <label htmlFor="mark-review" className="text-sm text-gray-600 cursor-pointer">
                Mark for Review
              </label>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Choose the most appropriate alternative. If the original version is best, choose "NO CHANGE."
            </div>

            <RadioGroup 
              value={currentAnswer?.toString() || ""} 
              onValueChange={(value) => handleAnswerSelect(currentQuestionId, parseInt(value))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => {
                const isEliminated = currentEliminated.has(index);
                const optionLabel = String.fromCharCode(65 + index);
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 ${
                      isEliminated ? 'opacity-50 bg-gray-100' : 'bg-white'
                    } ${currentAnswer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <RadioGroupItem 
                        value={index.toString()} 
                        id={`option-${index}`}
                        disabled={isEliminated}
                        className="text-blue-600"
                      />
                      <label 
                        htmlFor={`option-${index}`} 
                        className="cursor-pointer flex-1 flex items-center"
                      >
                        <span className="font-medium text-gray-700 mr-3 min-w-[20px]">
                          {optionLabel}
                        </span>
                        <span className={isEliminated ? 'line-through text-gray-400' : 'text-gray-900'}>
                          {option}
                        </span>
                      </label>
                    </div>
                    
                    {eliminateMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminateAnswer(currentQuestionId, index)}
                        className={`p-1 h-6 w-6 ${
                          isEliminated 
                            ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Harshil Gor
        </div>
        
        <div className="flex items-center">
          <Button
            onClick={() => setShowNavigator(true)}
            variant="ghost"
            className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded flex items-center space-x-2"
          >
            <span>Question {currentProgress.questionIndex + 1} of {currentQuestions.length}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-3">
          {currentProgress.questionIndex < currentQuestions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleModuleComplete}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 px-6 py-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Complete {currentProgress.module === 1 ? 'Module' : 'Test'}</span>
            </Button>
          )}
        </div>
      </div>

      <QuestionNavigator />
    </div>
  );
};

export default SATMockTestInterface;
