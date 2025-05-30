
import React, { useEffect } from 'react';
import { useMarathonSession } from '../hooks/useMarathonSession';
import { MarathonSettings } from '../types/marathon';
import MarathonQuestion from './MarathonQuestion';
import MarathonSummary from './MarathonSummary';
import MarathonHeader from './Marathon/MarathonHeader';
import MarathonLoadingState from './Marathon/MarathonLoadingState';
import MarathonCompletionState from './Marathon/MarathonCompletionState';
import MarathonEndConfirmation from './Marathon/MarathonEndConfirmation';
import MarathonNoSettingsState from './Marathon/MarathonNoSettingsState';
import { useMarathonState } from './Marathon/useMarathonState';
import { useMarathonActions } from './Marathon/useMarathonActions';

interface MarathonProps {
  settings?: MarathonSettings | null;
  onBack: () => void;
  onEndMarathon: () => void;
}

const Marathon: React.FC<MarathonProps> = ({ settings, onBack, onEndMarathon }) => {
  const { session, recordAttempt, toggleFlag, flaggedQuestions, endSession } = useMarathonSession();
  
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
    sessionInitialized,
    setSessionInitialized,
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
    flaggedQuestions,
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

  // Initialize session and load first question
  useEffect(() => {
    if (session && !sessionInitialized) {
      console.log('Marathon session started:', session);
      const initialize = async () => {
        await initializeSessionData();
        await loadNextQuestion();
      };
      initialize();
      setSessionInitialized(true);
    }
  }, [session, sessionInitialized, initializeSessionData, loadNextQuestion, setSessionInitialized]);

  const handleFlag = () => {
    if (currentQuestion) {
      toggleFlag(currentQuestion.id);
    }
  };

  const handleBackFromSummary = () => {
    onBack();
  };

  const handleRestartFromSummary = () => {
    setShowSummary(false);
    setCurrentQuestion(null);
    setSessionInitialized(false);
    onBack();
  };

  // Show summary if session ended
  if (showSummary) {
    return (
      <MarathonSummary
        session={session}
        attempts={session?.attempts || []}
        weakTopics={[]}
        onBack={handleBackFromSummary}
        onRestart={handleRestartFromSummary}
      />
    );
  }

  if (!session && !settings) {
    return <MarathonNoSettingsState onBack={onBack} />;
  }

  if (loading) {
    return <MarathonLoadingState />;
  }

  if (!currentQuestion) {
    return (
      <MarathonCompletionState
        sessionStats={sessionStats}
        onBack={onBack}
        onEndMarathon={onEndMarathon}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <MarathonHeader
          sessionStats={sessionStats}
          totalPoints={totalPoints}
          sessionPoints={sessionPoints}
          onEndMarathon={handleEndMarathon}
        />

        <MarathonQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          onFlag={handleFlag}
          onNext={handleNext}
          isFlagged={flaggedQuestions.includes(currentQuestion.id)}
          timeSpent={timeSpent}
          questionNumber={sessionStats.used + 1}
          totalQuestions={sessionStats.total}
          questionsAttempted={sessionStats.used}
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
