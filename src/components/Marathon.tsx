
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MarathonSettingsComponent from './MarathonSettings';
import MarathonQuestion from './MarathonQuestion';
import MarathonStats from './MarathonStats';
import MarathonSummary from './MarathonSummary';
import { useMarathonSession } from '../hooks/useMarathonSession';
import { getRandomQuestion } from '../data/questions';
import { MarathonSettings, QuestionAttempt } from '../types/marathon';
import { Subject } from '../pages/Index';

interface MarathonProps {
  userName: string;
  selectedSubject: Subject | null;
  onSubjectSelect: (subject: Subject) => void;
  onBack: () => void;
}

const Marathon: React.FC<MarathonProps> = ({ userName, selectedSubject, onSubjectSelect, onBack }) => {
  const [currentScreen, setCurrentScreen] = useState<'settings' | 'question' | 'summary'>('settings');
  const [currentQuestion, setCurrentQuestion] = useState(getRandomQuestion('math'));
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [settings, setSettings] = useState<MarathonSettings | null>(null);
  
  const {
    session,
    attempts,
    weakTopics,
    flaggedQuestions,
    startSession,
    recordAttempt,
    endSession,
    toggleFlag,
  } = useMarathonSession();

  const handleStartMarathon = (marathonSettings: MarathonSettings) => {
    setSettings(marathonSettings);
    startSession(marathonSettings);
    setSessionStartTime(new Date());
    setCurrentScreen('question');
    generateNextQuestion(marathonSettings, []);
  };

  const generateNextQuestion = (marathonSettings: MarathonSettings, currentAttempts: QuestionAttempt[]) => {
    let subject: 'math' | 'english';
    
    if (marathonSettings.subjects.includes('both')) {
      subject = Math.random() > 0.5 ? 'math' : 'english';
    } else {
      subject = marathonSettings.subjects[0] === 'math' ? 'math' : 'english';
    }

    // Adaptive learning logic
    if (marathonSettings.adaptiveLearning && weakTopics.length > 0 && Math.random() > 0.3) {
      // 70% chance to focus on weak topics when adaptive learning is on
      const weakTopic = weakTopics[Math.floor(Math.random() * weakTopics.length)];
      subject = weakTopic.subject;
    }

    const newQuestion = getRandomQuestion(subject);
    setCurrentQuestion(newQuestion);
    setQuestionStartTime(Date.now());
  };

  const handleAnswer = (answer: number | string, isCorrect: boolean, showAnswerUsed: boolean, hintsUsed: number) => {
    if (!session || !settings) return;

    const timeSpent = Date.now() - questionStartTime;
    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      subject: currentQuestion.subject,
      topic: 'General', // We'd need to add topic to Question interface
      difficulty: 'medium', // We'd need to add difficulty to Question interface
      isCorrect,
      timeSpent,
      hintsUsed,
      showAnswerUsed,
      flagged: flaggedQuestions.includes(currentQuestion.id),
      timestamp: new Date(),
    };

    recordAttempt(attempt);

    // Update streak
    if (isCorrect && !showAnswerUsed) {
      setCurrentStreak(prev => prev + 1);
    } else {
      setCurrentStreak(0);
    }

    // Generate next question after a brief delay
    setTimeout(() => {
      generateNextQuestion(settings, [...attempts, attempt]);
    }, 1500);
  };

  const handleEndMarathon = () => {
    const summary = endSession();
    setCurrentScreen('summary');
    return summary;
  };

  const handleFlag = () => {
    toggleFlag(currentQuestion.id);
  };

  const elapsedTime = sessionStartTime ? Date.now() - sessionStartTime.getTime() : 0;
  const averageTime = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / attempts.length / 1000)
    : 0;

  // Show mini report every 30 questions
  const shouldShowMiniReport = session && session.totalQuestions > 0 && session.totalQuestions % 30 === 0;

  if (currentScreen === 'settings') {
    return (
      <MarathonSettingsComponent
        onStart={handleStartMarathon}
        onBack={onBack}
      />
    );
  }

  if (currentScreen === 'summary') {
    return (
      <MarathonSummary
        session={session}
        attempts={attempts}
        weakTopics={weakTopics}
        onBack={onBack}
        onRestart={() => setCurrentScreen('settings')}
      />
    );
  }

  return (
    <div className={`min-h-screen ${settings?.darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={handleEndMarathon}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            End Marathon
          </Button>
          
          <h1 className={`text-2xl font-bold ${settings?.darkMode ? 'text-white' : 'text-gray-900'}`}>
            Marathon Mode
          </h1>
          
          <div className="text-right">
            <p className={`text-sm ${settings?.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {Math.floor(elapsedTime / 60000)}:{((elapsedTime % 60000) / 1000).toFixed(0).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Stats */}
        {session && (
          <MarathonStats
            totalQuestions={session.totalQuestions}
            correctAnswers={session.correctAnswers}
            incorrectAnswers={session.incorrectAnswers}
            currentStreak={currentStreak}
            averageTime={averageTime}
            timeGoal={session.timeGoalMinutes}
            elapsedTime={elapsedTime}
          />
        )}

        {/* Question */}
        <MarathonQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          onFlag={handleFlag}
          isFlagged={flaggedQuestions.includes(currentQuestion.id)}
          calculatorEnabled={settings?.calculatorEnabled || false}
          fontSize={settings?.fontSize || 'medium'}
          darkMode={settings?.darkMode || false}
        />
      </div>
    </div>
  );
};

export default Marathon;
