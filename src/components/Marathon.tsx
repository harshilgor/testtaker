
import React, { useEffect, useState } from 'react';
import { MarathonSettings, QuestionAttempt } from '@/types/marathon';
import { useMarathonSession } from '@/hooks/useMarathonSession';
import { useMarathonState } from './Marathon/useMarathonState';
import { useMarathonActions } from './Marathon/useMarathonActions';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import MarathonInterface from './Marathon/MarathonInterface';
import MarathonLoadingState from './Marathon/MarathonLoadingState';
import MarathonNoSettingsState from './Marathon/MarathonNoSettingsState';
import MarathonCompletionState from './Marathon/MarathonCompletionState';
import MarathonEndConfirmation from './Marathon/MarathonEndConfirmation';
import MarathonSummary from './MarathonSummary';
import { calculatePoints } from '@/services/pointsService';
import { DatabaseQuestion } from '@/services/questionService';

interface MarathonProps {
  settings: MarathonSettings | null;
  onBack: () => void;
  onEndMarathon: () => void;
}

const Marathon: React.FC<MarathonProps> = ({ settings, onBack, onEndMarathon }) => {
  const { session, attempts, recordAttempt, endSession } = useMarathonSession(settings);
  
  // Track answered questions and their history
  const [questionHistory, setQuestionHistory] = useState<DatabaseQuestion[]>([]);
  const [answerHistory, setAnswerHistory] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  
  const {
    currentQuestion,
    setCurrentQuestion,
    timeSpent,
    setTimeSpent,
    totalTimeSpent,
    setTotalTimeSpent,
    loading,
    setLoading,
    sessionStats,
    showEndConfirmation,
    setShowEndConfirmation,
    showSummary,
    setShowSummary,
    totalPoints,
    sessionPoints,
    setSessionPoints,
    loadUserPoints,
    loadSessionStats,
    initializeSessionData,
    stopTimer,
    startTimer,
    incrementQuestionsAttempted
  } = useMarathonState(session);

  // Initialize adaptive learning
  const {
    getAdaptiveQuestions,
    recordAnswer,
    sessionHistory,
    isInitialized,
    getProgressSummary,
    getNextSkillToFocus
  } = useAdaptiveLearning();

  const {
    loadNextQuestion,
    handleAnswer,
    handleNext,
    handleEndMarathon,
    confirmEndMarathon
  } = useMarathonActions({
    session,
    currentQuestion,
    timeSpent,
    totalTimeSpent,
    setCurrentQuestion,
    setTimeSpent,
    setTotalTimeSpent,
    setLoading,
    setSessionPoints,
    loadUserPoints,
    loadSessionStats,
    recordAttempt,
    endSession,
    setShowSummary,
    setShowEndConfirmation,
    sessionPoints,
    stopTimer,
    startTimer,
    incrementQuestionsAttempted,
    settings,
    getAdaptiveQuestions: settings?.adaptiveLearning ? getAdaptiveQuestions : undefined,
    sessionHistory,
    recordAnswer: settings?.adaptiveLearning ? recordAnswer : undefined
  });

  // Log adaptive learning status
  useEffect(() => {
    if (settings?.adaptiveLearning && isInitialized) {
      console.log('🧠 Adaptive Learning ENABLED for marathon session');
      const progress = getProgressSummary();
      const nextSkill = getNextSkillToFocus();
      console.log('📊 Current adaptive learning status:', {
        progress,
        nextSkill: nextSkill?.name,
        sessionHistory: sessionHistory.length
      });
    } else if (settings?.adaptiveLearning && !isInitialized) {
      console.log('🔄 Adaptive Learning initializing...');
    } else {
      console.log('🎲 Using traditional random question selection');
    }
  }, [settings?.adaptiveLearning, isInitialized, sessionHistory.length]);

  // Initialize session when ready
  useEffect(() => {
    console.log('Marathon: useEffect triggered', { session: !!session, currentQuestion: !!currentQuestion, loading });
    if (session && !currentQuestion && !loading) {
      console.log('Marathon: Initializing session data');
      initializeSessionData().then(() => {
        loadNextQuestion();
      });
    }
  }, [session, currentQuestion, loading]);

  // Add question to history when a new question is loaded
  useEffect(() => {
    if (currentQuestion && !questionHistory.find(q => q.id === currentQuestion.id)) {
      setQuestionHistory(prev => [...prev, currentQuestion]);
      setCurrentQuestionIndex(questionHistory.length);
    }
  }, [currentQuestion, questionHistory]);

  const handleTimerEnd = () => {
    console.log('Marathon: Timer ended, ending marathon');
    confirmEndMarathon();
  };

  const handleFlag = () => {
    console.log('Question flagged');
  };

  const handleGoToQuestion = (questionNumber: number) => {
    const questionIndex = questionNumber - 1;
    if (questionIndex >= 0 && questionIndex < questionHistory.length) {
      const question = questionHistory[questionIndex];
      setCurrentQuestion(question);
      setCurrentQuestionIndex(questionIndex);
      console.log('Marathon: Navigated to question', questionNumber);
    }
  };

  const handleAnswerWithHistory = (answer: string, showAnswerUsed?: boolean) => {
    console.log('Marathon: Answer submitted', { 
      answer, 
      correctAnswer: currentQuestion?.correct_answer, 
      showAnswerUsed,
      questionNumber: currentQuestionIndex + 1
    });
    
    // Store the answer in history
    setAnswerHistory(prev => {
      const newHistory = [...prev];
      newHistory[currentQuestionIndex] = answer;
      return newHistory;
    });
    
    // Mark this question as answered
    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex + 1]));
    
    // Handle the answer normally
    handleAnswer(answer, showAnswerUsed || false);
  };

  const handleNextWithHistory = () => {
    console.log('Marathon: Moving to next question');
    // Always load a new question when clicking next
    loadNextQuestion();
  };

  // Optimized end marathon handler that shows summary immediately
  const handleEndMarathonOptimized = () => {
    console.log('Marathon: End marathon clicked - showing summary immediately');
    stopTimer();
    setShowSummary(true);
    setTimeout(() => {
      if (session) {
        endSession();
      }
    }, 100);
  };

  console.log('Marathon: Rendering state', {
    hasSettings: !!settings,
    hasSession: !!session,
    hasCurrentQuestion: !!currentQuestion,
    loading,
    showSummary,
    sessionStatsUsed: sessionStats.used,
    sessionStatsTotal: sessionStats.total,
    correctAnswers: session?.correctAnswers || 0,
    questionHistoryLength: questionHistory.length,
    answerHistoryLength: answerHistory.length,
    currentQuestionIndex
  });

  // Render states
  if (!settings) {
    console.log('Marathon: No settings, showing NoSettingsState');
    return <MarathonNoSettingsState onBack={onBack} />;
  }

  if (showSummary) {
    console.log('Marathon: Showing summary with session data:', {
      questions: questionHistory,
      answers: answerHistory,
      topics: [...new Set(questionHistory.map(q => q.skill || q.domain || 'General'))],
      subjects: settings.subjects
    });
    
    return (
      <MarathonSummary
        sessionStats={{
          totalQuestions: session?.totalQuestions || 0,
          correctAnswers: session?.correctAnswers || 0,
          incorrectAnswers: session?.incorrectAnswers || 0,
          showAnswerUsed: session?.showAnswerUsed || 0,
          timeSpent: totalTimeSpent + timeSpent,
          pointsEarned: sessionPoints
        }}
        sessionData={{
          questions: questionHistory,
          answers: answerHistory,
          topics: [...new Set(questionHistory.map(q => q.skill || q.domain || 'General'))],
          subjects: settings.subjects
        }}
        sessionId={session?.id}
        onBackToDashboard={onBack}
        onBackToSettings={() => {
          setShowSummary(false);
          loadNextQuestion();
        }}
        userName="User"
      />
    );
  }

  if (loading) {
    console.log('Marathon: Loading state');
    return <MarathonLoadingState />;
  }

  if (!currentQuestion && sessionStats.used >= sessionStats.total) {
    console.log('Marathon: No more questions available');
    return (
      <MarathonCompletionState
        sessionStats={sessionStats}
        onBack={onBack}
        onEndMarathon={handleEndMarathonOptimized}
      />
    );
  }

  if (!currentQuestion) {
    console.log('Marathon: Loading first question');
    return <MarathonLoadingState message="Loading first question..." />;
  }

  console.log('Marathon: Rendering main question interface');
  return (
    <>
      <MarathonInterface
        question={currentQuestion}
        currentQuestionNumber={currentQuestionIndex + 1}
        totalQuestions={Math.max(questionHistory.length, currentQuestionIndex + 1)}
        timeRemaining={settings.timedMode && settings.timeGoalMinutes ? settings.timeGoalMinutes * 60 - (totalTimeSpent + timeSpent) : undefined}
        onAnswer={handleAnswerWithHistory}
        onNext={handleNextWithHistory}
        onFlag={handleFlag}
        onEndMarathon={handleEndMarathonOptimized}
        questionsSolved={session?.correctAnswers || 0}
        onGoToQuestion={handleGoToQuestion}
        answeredQuestions={answeredQuestions}
      />

      <MarathonEndConfirmation
        isOpen={showEndConfirmation}
        onContinue={() => setShowEndConfirmation(false)}
        onConfirmEnd={handleEndMarathonOptimized}
      />
    </>
  );
};

export default Marathon;
