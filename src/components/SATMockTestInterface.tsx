
import React, { useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import SATMockTestResults from './SATMockTestResults';
import { questionService } from '@/services/questionService';
import { useSATTestState } from '@/hooks/useSATTestState';
import SATTestHeader from './SAT/SATTestHeader';
import SATQuestionPanel from './SAT/SATQuestionPanel';
import SATAnswerPanel from './SAT/SATAnswerPanel';
import SATBottomNavigation from './SAT/SATBottomNavigation';
import SATQuestionNavigatorModal from './SAT/SATQuestionNavigatorModal';
import SATTransitionScreen from './SAT/SATTransitionScreen';

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
  onPauseTest?: () => void;
  onQuitTest?: () => void;
}

type TestSection = 'reading-writing' | 'math';
type TestModule = 1 | 2;

const SATMockTestInterface: React.FC<SATMockTestInterfaceProps> = ({ onBack, onPauseTest, onQuitTest }) => {
  const {
    currentProgress,
    setCurrentProgress,
    selectedAnswers,
    setSelectedAnswers,
    markedForReview,
    setMarkedForReview,
    eliminatedAnswers,
    setEliminatedAnswers,
    eliminateMode,
    setEliminateMode,
    testCompleted,
    setTestCompleted,
    showNavigator,
    setShowNavigator,
    showTransition,
    setShowTransition,
    moduleResults,
    setModuleResults,
    currentQuestions,
    setCurrentQuestions,
    loading,
    setLoading,
    userDisplayName,
    startTime
  } = useSATTestState();

  // Load questions from database
  const loadQuestionsForModule = async (section: TestSection, module: TestModule) => {
    setLoading(true);
    try {
      const questionCount = section === 'reading-writing' ? 27 : 22;
      const sectionFilter = section === 'reading-writing' ? 'Reading and Writing' : 'Math';
      
      const dbQuestions = await questionService.getRandomQuestions({
        section: sectionFilter,
        limit: questionCount,
        difficulty: 'mixed'
      });

      const formattedQuestions: Question[] = dbQuestions.map((q, index) => ({
        id: `${section}-m${module}-q${index + 1}-${q.id}`,
        content: q.question_text,
        passage: q.question_text.length > 200 ? q.question_text : undefined,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctAnswer: q.correct_answer === 'A' ? 0 : 
                     q.correct_answer === 'B' ? 1 :
                     q.correct_answer === 'C' ? 2 : 3,
        explanation: q.correct_rationale,
        section,
        topic: q.skill || 'General'
      }));

      setCurrentQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to sample questions if database fails
      const questionCount = section === 'reading-writing' ? 27 : 22;
      const fallbackQuestions = Array.from({ length: questionCount }, (_, i) => ({
        id: `${section}-m${module}-q${i + 1}`,
        content: `Sample ${section} question ${i + 1} for Module ${module}...`,
        passage: section === 'reading-writing' ? "Sample passage content for context..." : undefined,
        options: section === 'reading-writing' 
          ? ["enhanced", "expanded", "undermined", "diversified"]
          : ["2", "4", "8", "13"],
        correctAnswer: section === 'reading-writing' ? 2 : 1,
        explanation: `This is the explanation for ${section} Module ${module} question ${i + 1}.`,
        section,
        topic: section === 'reading-writing' ? 'Writing and Language' : 'Algebra'
      }));
      setCurrentQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  // Load initial questions
  useEffect(() => {
    loadQuestionsForModule(currentProgress.section, currentProgress.module);
  }, [currentProgress.section, currentProgress.module]);

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

  const handleModuleComplete = async () => {
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
      
      setTimeout(async () => {
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

  const handlePauseTest = () => {
    if (onPauseTest) {
      onPauseTest();
    } else {
      onBack();
    }
  };

  const handleQuitTest = () => {
    if (onQuitTest) {
      onQuitTest();
    } else {
      handleRetakeTest();
      onBack();
    }
  };

  // Show transition screen
  if (showTransition) {
    return <SATTransitionScreen />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentEliminated = eliminatedAnswers[currentQuestionId] || new Set();
  const currentAnswer = selectedAnswers[currentQuestionId];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <SATTestHeader
        section={currentProgress.section}
        module={currentProgress.module}
        timeRemaining={currentProgress.timeRemaining}
        eliminateMode={eliminateMode}
        onEliminateModeChange={setEliminateMode}
      />

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 pb-20">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Question Text/Passage */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <SATQuestionPanel question={currentQuestion} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Question Prompt and Options */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <SATAnswerPanel
              question={currentQuestion}
              currentAnswer={currentAnswer}
              markedForReview={markedForReview.has(currentQuestionId)}
              eliminatedAnswers={currentEliminated}
              eliminateMode={eliminateMode}
              onAnswerSelect={(answerIndex) => handleAnswerSelect(currentQuestionId, answerIndex)}
              onToggleMarkForReview={() => toggleMarkForReview(currentQuestionId)}
              onEliminateAnswer={(answerIndex) => handleEliminateAnswer(currentQuestionId, answerIndex)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Sticky Bottom Navigation */}
      <SATBottomNavigation
        userDisplayName={userDisplayName}
        currentQuestionIndex={currentProgress.questionIndex}
        totalQuestions={currentQuestions.length}
        isLastQuestion={currentProgress.questionIndex === currentQuestions.length - 1}
        onShowNavigator={() => setShowNavigator(true)}
        onNextQuestion={handleNextQuestion}
        onModuleComplete={handleModuleComplete}
        onPauseTest={handlePauseTest}
        onQuitTest={handleQuitTest}
      />

      {/* Question Navigator Modal */}
      <SATQuestionNavigatorModal
        showNavigator={showNavigator}
        currentSection={currentProgress.section}
        currentModule={currentProgress.module}
        currentQuestionIndex={currentProgress.questionIndex}
        questions={currentQuestions}
        selectedAnswers={selectedAnswers}
        markedForReview={markedForReview}
        onClose={() => setShowNavigator(false)}
        onNavigateToQuestion={navigateToQuestion}
        onPauseTest={handlePauseTest}
        onQuitTest={handleQuitTest}
      />
    </div>
  );
};

export default SATMockTestInterface;
