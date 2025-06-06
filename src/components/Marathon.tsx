
import React, { useEffect } from 'react';
import { MarathonSettings, QuestionAttempt } from '@/types/marathon';
import { useMarathonSession } from '@/hooks/useMarathonSession';
import { useMarathonState } from './Marathon/useMarathonState';
import { useMarathonActions } from './Marathon/useMarathonActions';
import MarathonHeader from './Marathon/MarathonHeader';
import MarathonQuestion from './Marathon/MarathonQuestion';
import MarathonLoadingState from './Marathon/MarathonLoadingState';
import MarathonNoSettingsState from './Marathon/MarathonNoSettingsState';
import MarathonCompletionState from './Marathon/MarathonCompletionState';
import MarathonEndConfirmation from './Marathon/MarathonEndConfirmation';
import MarathonSummary from './MarathonSummary';
import MarathonTimer from './Marathon/MarathonTimer';

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
    initializeSessionData
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
    setCurrentQuestion,
    setTimeSpent,
    setLoading,
    setSessionPoints,
    loadUserPoints,
    loadSessionStats,
    recordAttempt,
    endSession,
    setShowSummary,
    setShowEndConfirmation,
    sessionPoints
  });

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

  console.log('Marathon: Rendering state', {
    hasSettings: !!settings,
    hasSession: !!session,
    hasCurrentQuestion: !!currentQuestion,
    loading,
    showSummary,
    sessionStatsUsed: sessionStats.used,
    sessionStatsTotal: sessionStats.total
  });

  if (!settings) {
    console.log('Marathon: No settings, showing NoSettingsState');
    return <MarathonNoSettingsState onBack={onBack} />;
  }

  if (showSummary) {
    console.log('Marathon: Showing summary');
    return (
      <MarathonSummary
        attempts={attempts}
        onBack={onBack}
        onRestart={() => {
          setShowSummary(false);
          loadNextQuestion();
        }}
        sessionPoints={sessionPoints}
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
    <div className="min-h-screen bg-white">
      {settings.timedMode && settings.timeGoalMinutes && (
        <MarathonTimer 
          timeGoalMinutes={settings.timeGoalMinutes} 
          onTimeUp={handleTimerEnd}
        />
      )}
      
      <div className="max-w-6xl mx-auto p-6">
        <MarathonHeader
          sessionStats={sessionStats}
          totalPoints={totalPoints}
          sessionPoints={sessionPoints}
          onEndMarathon={handleEndMarathon}
        />

        <MarathonQuestion
          question={currentQuestion}
          onAnswer={(selectedAnswer: string) => {
            console.log('Marathon: Answer submitted', { selectedAnswer, correctAnswer: currentQuestion.correct_answer });
            const isCorrect = selectedAnswer === currentQuestion.correct_answer;
            handleAnswer(selectedAnswer);
          }}
          onNext={handleNext}
        />

        <MarathonEndConfirmation
          isOpen={showEndConfirmation}
          onContinue={() => setShowEndConfirmation(false)}
          onConfirmEnd={confirmEndMarathon}
        />
      </div>
    </div>
  );
};

export default Marathon;
