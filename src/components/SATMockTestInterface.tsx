import React, { useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import SATMockTestResults from './SATMockTestResults';
import { questionService } from '@/services/questionService';
import { useSATTestState } from '@/hooks/useSATTestState';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
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
  const { isMobile } = useResponsiveLayout();
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

  const [showFeedback, setShowFeedback] = React.useState<Record<string, boolean>>({});

  const loadQuestionsForModule = async (section: TestSection, module: TestModule) => {
    setLoading(true);
    try {
      console.log(`Loading questions for ${section} module ${module}`);
      
      const questionCount = section === 'reading-writing' ? 27 : 22;
      
      // Map section names to match database values
      const sectionMapping = {
        'reading-writing': 'Reading and Writing',
        'math': 'Math'
      };
      
      const sectionFilter = sectionMapping[section];
      console.log(`Querying for section: ${sectionFilter}, count: ${questionCount}`);
      
      const dbQuestions = await questionService.getRandomQuestions({
        section: sectionFilter,
        limit: questionCount,
        difficulty: 'mixed'
      });

      console.log(`Retrieved ${dbQuestions.length} questions from database`);

      if (dbQuestions.length === 0) {
        console.warn('No questions found in database, using fallback');
        // Create fallback questions
        const fallbackQuestions = Array.from({ length: questionCount }, (_, index) => ({
          id: `${section}-m${module}-q${index + 1}-fallback`,
          content: `Sample ${section} question ${index + 1} for Module ${module}. Which of the following best completes the sentence?`,
          passage: section === 'reading-writing' ? "This is a sample passage that provides context for the question. Students need to read carefully and choose the best answer based on the content provided." : undefined,
          options: section === 'reading-writing' 
            ? ["NO CHANGE", "enhanced", "expanded", "diversified"]
            : ["2", "4", "8", "13"],
          correctAnswer: 0,
          explanation: `This is the explanation for ${section} Module ${module} question ${index + 1}.`,
          section,
          topic: section === 'reading-writing' ? 'Writing and Language' : 'Algebra'
        }));
        setCurrentQuestions(fallbackQuestions);
        setLoading(false);
        return;
      }

      const formattedQuestions: Question[] = dbQuestions.map((q, index) => {
        // Ensure we have valid options
        const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(opt => opt && opt.trim());
        
        // If less than 4 options, add defaults
        while (options.length < 4) {
          options.push(`Option ${options.length + 1}`);
        }

        return {
          id: `${section}-m${module}-q${index + 1}-${q.id}`,
          content: q.question_text || `Question ${index + 1}`,
          passage: q.question_text && q.question_text.length > 200 ? q.question_text : undefined,
          options,
          correctAnswer: q.correct_answer === 'A' ? 0 : 
                       q.correct_answer === 'B' ? 1 :
                       q.correct_answer === 'C' ? 2 : 3,
          explanation: q.correct_rationale || 'No explanation available.',
          section,
          topic: q.skill || 'General'
        };
      });

      console.log(`Formatted ${formattedQuestions.length} questions`);
      setCurrentQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Create fallback questions on error
      const questionCount = section === 'reading-writing' ? 27 : 22;
      const fallbackQuestions = Array.from({ length: questionCount }, (_, i) => ({
        id: `${section}-m${module}-q${i + 1}-fallback`,
        content: `Sample ${section} question ${i + 1} for Module ${module}. Which of the following best completes the sentence?`,
        passage: section === 'reading-writing' ? "This is a sample passage that provides context for the question. Students need to read carefully and choose the best answer based on the content provided." : undefined,
        options: section === 'reading-writing' 
          ? ["NO CHANGE", "enhanced", "expanded", "diversified"]
          : ["2", "4", "8", "13"],
        correctAnswer: 0,
        explanation: `This is the explanation for ${section} Module ${module} question ${i + 1}.`,
        section,
        topic: section === 'reading-writing' ? 'Writing and Language' : 'Algebra'
      }));
      setCurrentQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Loading initial questions for:', currentProgress.section, currentProgress.module);
    loadQuestionsForModule(currentProgress.section, currentProgress.module);
  }, [currentProgress.section, currentProgress.module]);

  const currentQuestion = currentQuestions[currentProgress.questionIndex];
  const currentQuestionId = currentQuestion?.id || '';

  console.log('Current question:', currentQuestion);
  console.log('Current questions array length:', currentQuestions.length);
  console.log('Current question index:', currentProgress.questionIndex);

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
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitAnswer = (questionId: string) => {
    // For SAT Practice Test, just record the answer and move to next question
    // No immediate feedback shown
    handleNextQuestion();
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

  const navigateToQuestion = (index: number) => {
    setCurrentProgress(prev => ({ ...prev, questionIndex: index }));
    setShowNavigator(false);
  };

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
    
    const moduleResult = {
      section: currentProgress.section,
      module: currentProgress.module,
      correctCount: modulePerformance.correctCount,
      totalQuestions: modulePerformance.totalQuestions,
      performance: modulePerformance.performance
    };
    
    setModuleResults(prev => [...prev, moduleResult]);

    if (currentProgress.module === 1) {
      setShowTransition(true);
      
      setTimeout(async () => {
        setShowTransition(false);
        
        setCurrentProgress(prev => ({
          ...prev,
          module: 2,
          questionIndex: 0,
          timeRemaining: prev.section === 'reading-writing' ? 32 * 60 : 35 * 60
        }));
      }, 3000);
    } else if (currentProgress.section === 'reading-writing' && currentProgress.module === 2) {
      setCurrentProgress({
        section: 'math',
        module: 1,
        questionIndex: 0,
        timeRemaining: 35 * 60
      });
    } else {
      setTestCompleted(true);
    }
  };

  const handleNextQuestion = () => {
    // Reset feedback for the current question when moving to next
    if (currentQuestionId) {
      setShowFeedback(prev => ({
        ...prev,
        [currentQuestionId]: false
      }));
    }

    if (currentProgress.questionIndex < currentQuestions.length - 1) {
      setCurrentProgress(prev => ({ ...prev, questionIndex: prev.questionIndex + 1 }));
    } else {
      handleModuleComplete();
    }
  };

  const generateTestAnswers = (): Map<string, TestAnswer> => {
    const answers = new Map();
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    
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

  if (showTransition) {
    return <SATTransitionScreen />;
  }

  if (testCompleted) {
    const testAnswers = generateTestAnswers();
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    
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
  const currentShowFeedback = showFeedback[currentQuestionId] || false;

  if (isMobile) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <SATTestHeader
            section={currentProgress.section}
            module={currentProgress.module}
            timeRemaining={currentProgress.timeRemaining}
            eliminateMode={eliminateMode}
            onEliminateModeChange={setEliminateMode}
            onBack={onBack}
            isMobile={true}
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
              <div className="h-full bg-white border-b border-gray-200 overflow-hidden">
                <SATQuestionPanel question={currentQuestion} isMobile={true} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
              <div className="h-full bg-white overflow-hidden">
                <SATAnswerPanel
                  question={currentQuestion}
                  currentAnswer={currentAnswer}
                  markedForReview={markedForReview.has(currentQuestionId)}
                  showFeedback={currentShowFeedback}
                  onAnswerSelect={(answerIndex) => handleAnswerSelect(currentQuestionId, answerIndex)}
                  onToggleMarkForReview={() => toggleMarkForReview(currentQuestionId)}
                  onSubmitAnswer={() => handleSubmitAnswer(currentQuestionId)}
                  isMobile={true}
                  eliminateMode={eliminateMode}
                  eliminatedAnswers={currentEliminated}
                  onEliminateAnswer={(answerIndex) => handleEliminateAnswer(currentQuestionId, answerIndex)}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        <div className="flex-shrink-0 bg-white border-t border-gray-200">
          <SATBottomNavigation
            userDisplayName={userDisplayName}
            currentQuestionIndex={currentProgress.questionIndex}
            totalQuestions={currentQuestions.length}
            isLastQuestion={currentProgress.questionIndex === currentQuestions.length - 1}
            showFeedback={currentShowFeedback}
            onShowNavigator={() => setShowNavigator(true)}
            onNextQuestion={handleNextQuestion}
            onModuleComplete={handleModuleComplete}
            onPauseTest={handlePauseTest}
            onQuitTest={handleQuitTest}
            isMobile={true}
          />
        </div>

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
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SATTestHeader
        section={currentProgress.section}
        module={currentProgress.module}
        timeRemaining={currentProgress.timeRemaining}
        eliminateMode={eliminateMode}
        onEliminateModeChange={setEliminateMode}
        onBack={onBack}
        isMobile={false}
      />

      <div className="flex-1 pb-20">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={30}>
            <SATQuestionPanel question={currentQuestion} isMobile={false} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <SATAnswerPanel
              question={currentQuestion}
              currentAnswer={currentAnswer}
              markedForReview={markedForReview.has(currentQuestionId)}
              showFeedback={currentShowFeedback}
              onAnswerSelect={(answerIndex) => handleAnswerSelect(currentQuestionId, answerIndex)}
              onToggleMarkForReview={() => toggleMarkForReview(currentQuestionId)}
              onSubmitAnswer={() => handleSubmitAnswer(currentQuestionId)}
              isMobile={false}
              eliminateMode={eliminateMode}
              eliminatedAnswers={currentEliminated}
              onEliminateAnswer={(answerIndex) => handleEliminateAnswer(currentQuestionId, answerIndex)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <SATBottomNavigation
        userDisplayName={userDisplayName}
        currentQuestionIndex={currentProgress.questionIndex}
        totalQuestions={currentQuestions.length}
        isLastQuestion={currentProgress.questionIndex === currentQuestions.length - 1}
        showFeedback={currentShowFeedback}
        onShowNavigator={() => setShowNavigator(true)}
        onNextQuestion={handleNextQuestion}
        onModuleComplete={handleModuleComplete}
        onPauseTest={handlePauseTest}
        onQuitTest={handleQuitTest}
        isMobile={false}
      />

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
