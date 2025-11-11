import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import SATMockTestResults from './SATMockTestResults';
import { questionService, DatabaseQuestion } from '@/services/questionService';
import { useSATTestState } from '@/hooks/useSATTestState';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import SATTestHeader from './SAT/SATTestHeader';
import SATQuestionPanel from './SAT/SATQuestionPanel';
import SATAnswerPanel from './SAT/SATAnswerPanel';
import SATBottomNavigation from './SAT/SATBottomNavigation';
import SATQuestionNavigatorModal from './SAT/SATQuestionNavigatorModal';
import SATTransitionScreen from './SAT/SATTransitionScreen';
import {
  MockTestConfig,
  SectionConfig,
  SatSectionId,
  DifficultyDistribution
} from './SAT/mockTestConfig';
import {
  generateMathQuestion,
  GeneratedMathQuestion
} from '@/services/mathQuestionGenerator';
import { SATQuestion as SATQuestionType } from '@/types/question';

type ModuleDifficultyPath = 'baseline' | 'easy' | 'hard';

interface Question extends SATQuestionType {
  originalId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  module: number;
  question_prompt?: string;
}

interface ModuleHistory {
  sectionId: SatSectionId;
  module: number;
  questionIds: string[];
  difficultyPath: ModuleDifficultyPath;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
}

interface TestAnswer {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number;
  flagged: boolean;
}

interface SATMockTestInterfaceProps {
  userName: string;
  config: MockTestConfig;
  onExit: () => void;
  onCancel: () => void;
}

const SECTION_DB_MAPPING: Record<SatSectionId, string> = {
  'reading-writing': 'Reading and Writing',
  math: 'Math'
};

const difficultyOrder: Array<keyof DifficultyDistribution> = [
  'easy',
  'medium',
  'hard'
];

const normalizeDifficulty = (
  value?: string
): 'easy' | 'medium' | 'hard' => {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized.startsWith('e')) return 'easy';
  if (normalized.startsWith('h')) return 'hard';
  if (normalized.startsWith('m')) return 'medium';
  return 'medium';
};

const computeCounts = (
  distribution: DifficultyDistribution,
  total: number
): Record<'easy' | 'medium' | 'hard', number> => {
  const raw = difficultyOrder.map((key) => ({
    key,
    value: (distribution[key] || 0) * total
  }));

  const counts: Record<'easy' | 'medium' | 'hard', number> = {
    easy: 0,
    medium: 0,
    hard: 0
  };

  let assigned = 0;
  raw.forEach(({ key, value }) => {
    const floor = Math.max(0, Math.floor(value));
    counts[key] = floor;
    assigned += floor;
  });

  let remaining = total - assigned;
  const fractions = raw
    .map(({ key, value }) => ({
      key,
      fraction: value - Math.floor(value)
    }))
    .sort((a, b) => b.fraction - a.fraction);

  let index = 0;
  while (remaining > 0 && fractions.length > 0) {
    const target = fractions[index % fractions.length];
    counts[target.key] += 1;
    remaining -= 1;
    index += 1;
  }

  // Ensure no over-allocation
  const sum = counts.easy + counts.medium + counts.hard;
  if (sum > total) {
    let overflow = sum - total;
    for (const key of ['hard', 'medium', 'easy'] as const) {
      if (counts[key] >= overflow) {
        counts[key] -= overflow;
        break;
      } else {
        const reduction = counts[key];
        counts[key] = 0;
        overflow -= reduction;
      }
    }
  }

  return counts;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const createFallbackQuestions = (
  sectionConfig: SectionConfig,
  moduleNumber: number,
  count: number,
  startIndex = 0
): Question[] => {
  const isReading = sectionConfig.id === 'reading-writing';
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset + 1;
    const options = isReading
      ? ['NO CHANGE', 'Option B', 'Option C', 'Option D']
      : ['1', '2', '3', '4'];

    return {
      id: `${sectionConfig.id}-m${moduleNumber}-fallback-${index}`,
      originalId: `fallback-${sectionConfig.id}-${moduleNumber}-${index}`,
      content: `Sample ${sectionConfig.title} question ${index}. Use the process of elimination to find the best answer.`,
      options,
      correctAnswer: 0,
      explanation:
        'This is a placeholder question. Review official SAT practice materials for authentic questions.',
      section: sectionConfig.id,
      topic: sectionConfig.topics[0] || 'General',
      difficulty: 'medium',
      module: moduleNumber
    };
  });
};

const createQuestionFromGeneratedMath = (
  moduleNumber: number,
  difficulty: 'easy' | 'medium' | 'hard'
): Question => {
  const generated: GeneratedMathQuestion = generateMathQuestion(
    undefined,
    difficulty
  );

  return {
    id: generated.id,
    originalId: generated.id,
    content: generated.question,
    options: generated.options ?? [],
    correctAnswer:
      typeof generated.correctAnswer === 'number'
        ? generated.correctAnswer
        : 0,
    explanation: generated.explanation,
    section: 'math',
    topic: generated.metadata.skill || generated.topic || 'Algebra',
    difficulty: generated.difficulty || 'easy',
    module: moduleNumber
  };
};

const formatQuestion = (
  question: DatabaseQuestion,
  sectionConfig: SectionConfig,
  moduleNumber: number,
  fallbackDifficulty: 'easy' | 'medium' | 'hard'
): Question => {
  const options = [
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d
  ].filter((option): option is string => Boolean(option && option.trim()));

  while (options.length < 4) {
    options.push(`Option ${options.length + 1}`);
  }

  const correctIndex = (() => {
    const letter = (question.correct_answer || '').toUpperCase();
    const map = ['A', 'B', 'C', 'D'];
    const idx = map.indexOf(letter);
    return idx >= 0 ? idx : 0;
  })();

  const difficulty = normalizeDifficulty(question.difficulty) || fallbackDifficulty;
  const content = question.question_text || `SAT ${sectionConfig.title} question`;

  return {
    id: `${sectionConfig.id}-m${moduleNumber}-${question.id}`,
    originalId: question.id?.toString() || `${sectionConfig.id}-${moduleNumber}-${Date.now()}`,
    content,
    passage:
      sectionConfig.id === 'reading-writing' && content.length > 240
        ? content
        : undefined,
    options,
    correctAnswer: correctIndex,
    explanation:
      question.correct_rationale ||
      'Review the concept behind this question to understand the correct answer.',
    section: sectionConfig.id,
    topic: question.skill || sectionConfig.topics[0] || 'General',
    difficulty,
    module: moduleNumber,
    question_prompt: question.question_prompt || undefined
  };
};

const fetchQuestionsForModule = async (
  sectionConfig: SectionConfig,
  moduleNumber: number,
  distribution: DifficultyDistribution,
  excludeIds: Set<string>
): Promise<Question[]> => {
  const counts = computeCounts(distribution, sectionConfig.questionCountPerModule);
  const perDifficultyCount: Record<'easy' | 'medium' | 'hard', number> = {
    easy: 0,
    medium: 0,
    hard: 0
  };
  const collected: Question[] = [];
  const exclude = new Set(excludeIds);
  const sectionFilter = SECTION_DB_MAPPING[sectionConfig.id];

  for (const diff of difficultyOrder) {
    const needed = counts[diff];
    if (needed <= 0) continue;

    const pool = await questionService.getRandomQuestions({
      section: sectionFilter,
      difficulty: diff,
      limit: Math.max(needed * 4, needed + 8),
      excludeIds: Array.from(exclude)
    });

    for (const item of pool) {
      if (perDifficultyCount[diff] >= needed) break;
      const originalId = item.id?.toString() || '';
      if (!originalId || exclude.has(originalId)) continue;

      const formatted = formatQuestion(item, sectionConfig, moduleNumber, diff);
      collected.push(formatted);
      perDifficultyCount[diff] += 1;
      exclude.add(originalId);
    }
  }

  while (collected.length < sectionConfig.questionCountPerModule) {
    const remaining = sectionConfig.questionCountPerModule - collected.length;
    const additional = await questionService.getRandomQuestions({
      section: sectionFilter,
      limit: Math.max(remaining * 3, remaining + 6),
      excludeIds: Array.from(exclude)
    });

    if (!additional.length) {
      break;
    }

    for (const item of additional) {
      if (collected.length >= sectionConfig.questionCountPerModule) break;
      const originalId = item.id?.toString() || '';
      if (!originalId || exclude.has(originalId)) continue;

      const formatted = formatQuestion(
        item,
        sectionConfig,
        moduleNumber,
        normalizeDifficulty(item.difficulty)
      );
      collected.push(formatted);
      exclude.add(originalId);
    }
  }

  collected.forEach((question) => excludeIds.add(question.originalId));

  if (collected.length < sectionConfig.questionCountPerModule) {
    if (sectionConfig.id === 'math') {
      const toGenerate = sectionConfig.questionCountPerModule - collected.length;
      for (let i = 0; i < toGenerate; i++) {
        const generatedQuestion = createQuestionFromGeneratedMath(
          moduleNumber,
          moduleNumber === 1 ? 'easy' : 'medium'
        );
        collected.push(generatedQuestion);
        excludeIds.add(generatedQuestion.originalId);
      }
    }
  }

  if (collected.length < sectionConfig.questionCountPerModule) {
    const fallback = createFallbackQuestions(
      sectionConfig,
      moduleNumber,
      sectionConfig.questionCountPerModule - collected.length,
      collected.length
    );
    collected.push(...fallback);
  }

  return shuffleArray(collected).slice(0, sectionConfig.questionCountPerModule);
};

const SATMockTestInterface: React.FC<SATMockTestInterfaceProps> = ({
  userName,
  config,
  onExit,
  onCancel
}) => {
  const { isMobile } = useResponsiveLayout();
  const initialSection = config.sections[0];

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
  } = useSATTestState(
    initialSection?.id ?? 'reading-writing',
    initialSection?.moduleTimeSeconds ?? 32 * 60
  );

  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentModulePath, setCurrentModulePath] =
    useState<ModuleDifficultyPath>('baseline');
  const [questionsById, setQuestionsById] = useState<Record<string, Question>>({});
  const [moduleHistory, setModuleHistory] = useState<ModuleHistory[]>([]);

  const usedQuestionIdsRef = useRef<Set<string>>(new Set());
  const moduleStartTimestampRef = useRef<number>(Date.now());
  const moduleCompletionInFlightRef = useRef(false);

  const currentSectionConfig =
    config.sections[currentSectionIndex] ?? config.sections[0];

  const initializeModule = useCallback(
    async (sectionIndex: number, moduleNumber: 1 | 2, path: ModuleDifficultyPath) => {
      const sectionConfig = config.sections[sectionIndex];
      if (!sectionConfig) return;

      setLoading(true);
      setShowNavigator(false);
      setCurrentSectionIndex(sectionIndex);
      setCurrentModulePath(path);
      setCurrentQuestions([]);
      setShowFeedback({});
      moduleCompletionInFlightRef.current = false;

      try {
        const distribution =
          moduleNumber === 1
            ? sectionConfig.module1Distribution
            : path === 'hard'
            ? sectionConfig.adaptivePaths.hard.distribution
            : sectionConfig.adaptivePaths.easy.distribution;

        const questions = await fetchQuestionsForModule(
          sectionConfig,
          moduleNumber,
          distribution,
          usedQuestionIdsRef.current
        );

        setCurrentQuestions(questions);
        setQuestionsById((prev) => {
          const next = { ...prev };
          questions.forEach((question) => {
            next[question.id] = question;
          });
          return next;
        });

        setCurrentProgress({
          section: sectionConfig.id,
          module: moduleNumber,
          questionIndex: 0,
          timeRemaining: sectionConfig.moduleTimeSeconds
        });

        moduleStartTimestampRef.current = Date.now();
      } catch (error) {
        console.error('Error loading questions for module:', error);
        const fallback = createFallbackQuestions(
          sectionConfig,
          moduleNumber,
          sectionConfig.questionCountPerModule
        );
        setCurrentQuestions(fallback);
        setQuestionsById((prev) => {
          const next = { ...prev };
          fallback.forEach((question) => {
            next[question.id] = question;
          });
          return next;
        });
        setCurrentProgress({
          section: sectionConfig.id,
          module: moduleNumber,
          questionIndex: 0,
          timeRemaining: sectionConfig.moduleTimeSeconds
        });
        moduleStartTimestampRef.current = Date.now();
      } finally {
        setLoading(false);
      }
    },
    [config.sections, setCurrentProgress, setCurrentQuestions, setLoading]
  );

  useEffect(() => {
    usedQuestionIdsRef.current = new Set();
    setSelectedAnswers({});
    setMarkedForReview(new Set());
    setEliminatedAnswers({});
    setModuleResults([]);
    setModuleHistory([]);
    setTestCompleted(false);
    setShowTransition(false);
    initializeModule(0, 1, 'baseline');
  }, [
    config.id,
    initializeModule,
    setEliminatedAnswers,
    setMarkedForReview,
    setModuleResults,
    setSelectedAnswers,
    setShowTransition,
    setTestCompleted
  ]);

  const handleModuleComplete = useCallback(() => {
    if (moduleCompletionInFlightRef.current) {
      return;
    }

    const sectionConfig = config.sections[currentSectionIndex];
    if (!sectionConfig || currentQuestions.length === 0) {
      moduleCompletionInFlightRef.current = false;
      return;
    }

    moduleCompletionInFlightRef.current = true;

    const questionsSnapshot = [...currentQuestions];
    const correctCount = questionsSnapshot.reduce((acc, question) => {
      const answer = selectedAnswers[question.id];
      return acc + (answer === question.correctAnswer ? 1 : 0);
    }, 0);

    const totalQuestions = questionsSnapshot.length;
    const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
    const timeSpentSeconds = Math.max(
      0,
      sectionConfig.moduleTimeSeconds - currentProgress.timeRemaining
    );

    const historyEntry: ModuleHistory = {
      sectionId: sectionConfig.id,
      module: currentProgress.module,
      questionIds: questionsSnapshot.map((q) => q.id),
      difficultyPath: currentModulePath,
      correctCount,
      totalQuestions,
      accuracy,
      timeSpentSeconds
    };

    setModuleHistory((prev) => [...prev, historyEntry]);
    setModuleResults((prev) => [
      ...prev,
      {
        section: sectionConfig.id,
        module: currentProgress.module,
        correctCount,
        totalQuestions,
        performance: accuracy
      }
    ]);

    const proceed = () => {
      moduleCompletionInFlightRef.current = false;
    };

    if (currentProgress.module === 1) {
      const nextPath: ModuleDifficultyPath = accuracy >= 0.7 ? 'hard' : 'easy';
      setShowTransition(true);
      setTimeout(() => {
        setShowTransition(false);
        initializeModule(currentSectionIndex, 2, nextPath);
        proceed();
      }, 2000);
    } else {
      const nextSectionIndex = currentSectionIndex + 1;
      if (nextSectionIndex < config.sections.length) {
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          initializeModule(nextSectionIndex, 1, 'baseline');
          proceed();
        }, 2000);
      } else {
        setTestCompleted(true);
        setShowTransition(false);
        setLoading(false);
        proceed();
      }
    }
  }, [
    config.sections,
    currentModulePath,
    currentProgress.module,
    currentProgress.timeRemaining,
    currentQuestions,
    currentSectionIndex,
    initializeModule,
    selectedAnswers,
    setLoading,
    setModuleResults,
    setShowTransition,
    setTestCompleted
  ]);

  useEffect(() => {
    if (testCompleted || showTransition) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev.timeRemaining <= 1) {
          if (!moduleCompletionInFlightRef.current) {
            handleModuleComplete();
          }
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [handleModuleComplete, setCurrentProgress, showTransition, testCompleted]);

  const handleAnswerSelect = useCallback(
    (questionId: string, answerIndex: number) => {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answerIndex
      }));
    },
    [setSelectedAnswers]
  );

  const handleEliminateAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
      if (!eliminateMode) return;
      setEliminatedAnswers((prev) => {
        const existing = prev[questionId] || new Set<number>();
        const nextSet = new Set(existing);
        if (nextSet.has(answerIndex)) {
          nextSet.delete(answerIndex);
        } else {
          nextSet.add(answerIndex);
        }
        return {
          ...prev,
          [questionId]: nextSet
        };
      });
    },
    [eliminateMode, setEliminatedAnswers]
  );

  const toggleMarkForReview = useCallback(
    (questionId: string) => {
      setMarkedForReview((prev) => {
        const next = new Set(prev);
        if (next.has(questionId)) {
          next.delete(questionId);
        } else {
          next.add(questionId);
        }
        return next;
      });
    },
    [setMarkedForReview]
  );

  const navigateToQuestion = useCallback(
    (index: number) => {
      setCurrentProgress((prev) => ({ ...prev, questionIndex: index }));
      setShowNavigator(false);
    },
    [setCurrentProgress, setShowNavigator]
  );

  const handleNextQuestion = useCallback(() => {
    const currentQuestion = currentQuestions[currentProgress.questionIndex];
    if (currentQuestion) {
      setShowFeedback((prev) => ({
        ...prev,
        [currentQuestion.id]: false
      }));
    }

    if (currentProgress.questionIndex < currentQuestions.length - 1) {
      setCurrentProgress((prev) => ({
        ...prev,
        questionIndex: prev.questionIndex + 1
      }));
    } else {
      handleModuleComplete();
    }
  }, [currentProgress.questionIndex, currentQuestions, handleModuleComplete, setCurrentProgress]);

  const handleSubmitAnswer = useCallback(() => {
    handleNextQuestion();
  }, [handleNextQuestion]);

  const handleRetakeTest = useCallback(() => {
    usedQuestionIdsRef.current = new Set();
    setSelectedAnswers({});
    setMarkedForReview(new Set());
    setEliminatedAnswers({});
    setModuleResults([]);
    setModuleHistory([]);
    setTestCompleted(false);
    setShowTransition(false);
    setShowNavigator(false);
    setEliminateMode(false);
    setQuestionsById({});
    initializeModule(0, 1, 'baseline');
  }, [
    initializeModule,
    setEliminatedAnswers,
    setEliminateMode,
    setMarkedForReview,
    setModuleResults,
    setSelectedAnswers,
    setShowNavigator,
    setShowTransition,
    setTestCompleted
  ]);

  const handlePauseTest = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleQuitTest = useCallback(() => {
    onExit();
  }, [onExit]);

  const currentQuestion = currentQuestions[currentProgress.questionIndex] ?? null;
  const currentQuestionId = currentQuestion?.id ?? '';
  const currentEliminated =
    currentQuestionId && eliminatedAnswers[currentQuestionId]
      ? eliminatedAnswers[currentQuestionId]
      : new Set<number>();
  const currentAnswer =
    currentQuestionId !== '' ? selectedAnswers[currentQuestionId] : undefined;
  const currentShowFeedback = currentQuestionId
    ? showFeedback[currentQuestionId] ?? false
    : false;

  const buildAnswerMap = useCallback((): Map<string, TestAnswer> => {
    const answers = new Map<string, TestAnswer>();
    const totalElapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const questionValues = Object.values(questionsById);
    const divisor = Math.max(1, questionValues.length);

    questionValues.forEach((question) => {
      const selected = selectedAnswers[question.id];
      answers.set(question.id, {
        questionId: question.id,
        selectedAnswer: selected !== undefined ? selected : null,
        isCorrect: selected === question.correctAnswer,
        timeSpent: Math.floor(totalElapsedSeconds / divisor),
        flagged: markedForReview.has(question.id)
      });
    });

    return answers;
  }, [markedForReview, questionsById, selectedAnswers, startTime]);

  const totalTimeSpent = useMemo(
    () =>
      moduleHistory.reduce((acc, module) => acc + module.timeSpentSeconds, 0),
    [moduleHistory]
  );

  if (showTransition) {
    return <SATTransitionScreen />;
  }

  if (testCompleted) {
    const answers = buildAnswerMap();
    const allQuestions = Object.values(questionsById);

    return (
      <SATMockTestResults
        config={config}
        answers={answers}
        questions={allQuestions}
        moduleHistory={moduleHistory}
        totalTimeSpent={totalTimeSpent}
        onRetakeTest={handleRetakeTest}
        onBackToHome={onExit}
      />
    );
  }

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

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
            onBack={handleQuitTest}
            isMobile
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
              <div className="h-full bg-white border-b border-gray-200 overflow-hidden">
                <SATQuestionPanel question={currentQuestion} isMobile />
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
                  onAnswerSelect={(answerIndex) =>
                    handleAnswerSelect(currentQuestionId, answerIndex)
                  }
                  onToggleMarkForReview={() => toggleMarkForReview(currentQuestionId)}
                  onSubmitAnswer={handleSubmitAnswer}
                  isMobile
                  eliminateMode={eliminateMode}
                  eliminatedAnswers={currentEliminated}
                  onEliminateAnswer={(answerIndex) =>
                    handleEliminateAnswer(currentQuestionId, answerIndex)
                  }
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
            isMobile
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
        onBack={handleQuitTest}
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
              onAnswerSelect={(answerIndex) =>
                handleAnswerSelect(currentQuestionId, answerIndex)
              }
              onToggleMarkForReview={() => toggleMarkForReview(currentQuestionId)}
              onSubmitAnswer={handleSubmitAnswer}
              isMobile={false}
              eliminateMode={eliminateMode}
              eliminatedAnswers={currentEliminated}
              onEliminateAnswer={(answerIndex) =>
                handleEliminateAnswer(currentQuestionId, answerIndex)
              }
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
