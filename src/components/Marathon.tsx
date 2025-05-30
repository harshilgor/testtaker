
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
    setShowEndConfirmation
  });

  useEffect(() => {
    if (session && !currentQuestion && !loading) {
      initializeSessionData().then(() => {
        loadNextQuestion();
      });
    }
  }, [session, currentQuestion, loading]);

  if (!settings) {
    return <MarathonNoSettingsState onBack={onBack} />;
  }

  if (showSummary) {
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
    return <MarathonLoadingState />;
  }

  if (!currentQuestion && sessionStats.used >= sessionStats.total) {
    return (
      <MarathonCompletionState
        sessionStats={sessionStats}
        onBack={onBack}
        onEndMarathon={confirmEndMarathon}
      />
    );
  }

  if (!currentQuestion) {
    return <MarathonLoadingState message="Loading first question..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        <MarathonHeader
          sessionStats={sessionStats}
          totalPoints={totalPoints}
          sessionPoints={sessionPoints}
          onEndMarathon={handleEndMarathon}
        />

        <MarathonQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
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
