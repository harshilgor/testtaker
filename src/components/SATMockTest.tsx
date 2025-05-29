
import React, { useState } from 'react';
import SATQuestionView from './SATQuestionView';
import SATResults from './SATResults';
import SATTestHeader from './SATTestHeader';
import SATTestIntroduction from './SATTestIntroduction';
import SATQuestionNavigator from './SATQuestionNavigator';
import { useSATTest } from '../hooks/useSATTest';
import { useSATModuleHandler } from './SATModuleHandler';

interface SATMockTestProps {
  userName: string;
  onBack: () => void;
}

const SATMockTest: React.FC<SATMockTestProps> = ({ userName, onBack }) => {
  const [showNavigator, setShowNavigator] = useState(false);
  
  const {
    testStarted,
    testCompleted,
    currentProgress,
    setCurrentProgress,
    currentQuestions,
    answers,
    moduleResults,
    setModuleResults,
    startTest,
    handleAnswerChange,
    handleFlagQuestion,
    finishTest,
    resetTest
  } = useSATTest(userName);

  const { handleModuleComplete } = useSATModuleHandler({
    currentQuestions,
    answers,
    currentProgress,
    setCurrentProgress,
    moduleResults,
    setModuleResults,
    onTestComplete: finishTest
  });

  const handleNextQuestion = () => {
    if (currentProgress.questionIndex < currentQuestions.length - 1) {
      setCurrentProgress({ ...currentProgress, questionIndex: currentProgress.questionIndex + 1 });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentProgress.questionIndex > 0) {
      setCurrentProgress({ ...currentProgress, questionIndex: currentProgress.questionIndex - 1 });
    }
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

  const handleQuestionSelect = (index: number) => {
    setCurrentProgress({ ...currentProgress, questionIndex: index });
  };

  if (testCompleted) {
    return (
      <SATResults
        userName={userName}
        moduleResults={moduleResults}
        answers={answers}
        allQuestions={currentQuestions}
        onBack={onBack}
        onRetake={resetTest}
      />
    );
  }

  if (!testStarted) {
    return <SATTestIntroduction onStartTest={startTest} />;
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-gray-50">
      <SATTestHeader
        onBack={onBack}
        section={currentProgress.section}
        module={currentProgress.module}
        timeRemaining={currentProgress.timeRemaining}
        questionIndex={currentProgress.questionIndex}
        totalQuestions={currentQuestions.length}
        answeredCount={getAnsweredCount()}
        flaggedCount={getFlaggedCount()}
        showNavigator={showNavigator}
        onToggleNavigator={() => setShowNavigator(!showNavigator)}
      />

      <div className="max-w-6xl mx-auto p-6 flex gap-6">
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

        {showNavigator && (
          <SATQuestionNavigator
            questions={currentQuestions}
            answers={answers}
            currentQuestionIndex={currentProgress.questionIndex}
            onQuestionSelect={handleQuestionSelect}
          />
        )}
      </div>
    </div>
  );
};

export default SATMockTest;
