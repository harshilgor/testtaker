
import React, { useEffect } from 'react';
import { MarathonSettings, QuestionAttempt } from '@/types/marathon';
import { useMarathonSession } from '@/hooks/useMarathonSession';
import { useMarathonState } from './Marathon/useMarathonState';
import { useMarathonActions } from './Marathon/useMarathonActions';
import MarathonInterface from './Marathon/MarathonInterface';
import MarathonLoadingState from './Marathon/MarathonLoadingState';
import MarathonNoSettingsState from './Marathon/MarathonNoSettingsState';
import MarathonCompletionState from './Marathon/MarathonCompletionState';
import MarathonEndConfirmation from './Marathon/MarathonEndConfirmation';
import MarathonSummary from './MarathonSummary';
import MarathonTimer from './Marathon/MarathonTimer';
import { calculatePoints } from '@/services/pointsService';

interface MarathonProps {
  settings: MarathonSettings | null;
  onBack: () => void;
  onEndMarathon: () => void;
}

const Marathon: React.FC<MarathonProps> = ({ settings, onBack, onEndMarathon }) => {
  const { session, attempts, recordAttempt, endSession } = useMarathonSession(settings);
  
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
    incrementQuestionsAttempted
  });

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

  const handleTimerEnd = () => {
    console.log('Marathon: Timer ended, ending marathon');
    confirmEndMarathon();
  };

  const handleFlag = () => {
    // Flag functionality - could be implemented later
    console.log('Question flagged');
  };

  console.log('Marathon: Rendering state', {
    hasSettings: !!settings,
    hasSession: !!session,
    hasCurrentQuestion: !!currentQuestion,
    loading,
    showSummary,
    sessionStatsUsed: sessionStats.used,
    sessionStatsTotal: sessionStats.total,
    correctAnswers: session?.correctAnswers || 0
  });

  // Render states
  if (!settings) {
    console.log('Marathon: No settings, showing NoSettingsState');
    return <MarathonNoSettingsState onBack={onBack} />;
  }

  if (showSummary) {
    console.log('Marathon: Showing summary');
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
        onEndMarathon={confirmEndMarathon}
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
        currentQuestionNumber={sessionStats.used + 1}
        totalQuestions={sessionStats.total}
        timeRemaining={settings.timedMode && settings.timeGoalMinutes ? settings.timeGoalMinutes * 60 - (totalTimeSpent + timeSpent) : undefined}
        onAnswer={(selectedAnswer: string, showAnswerUsed?: boolean) => {
          console.log('Marathon: Answer submitted', { selectedAnswer, correctAnswer: currentQuestion.correct_answer, showAnswerUsed });
          handleAnswer(selectedAnswer, showAnswerUsed || false);
        }}
        onNext={handleNext}
        onFlag={handleFlag}
        onEndMarathon={handleEndMarathon}
        questionsSolved={session?.correctAnswers || 0}
      />

      <MarathonEndConfirmation
        isOpen={showEndConfirmation}
        onContinue={() => setShowEndConfirmation(false)}
        onConfirmEnd={confirmEndMarathon}
      />
    </>
  );
};

export default Marathon;
