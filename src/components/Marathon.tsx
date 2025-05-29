
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
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [settings, setSettings] = useState<MarathonSettings | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  
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

  const handleStartMarathon = async (marathonSettings: MarathonSettings) => {
    setSettings(marathonSettings);
    startSession(marathonSettings);
    const startTime = new Date();
    setSessionStartTime(startTime);
    setCurrentScreen('question');
    await generateNextQuestion(marathonSettings, []);
  };

  const generateNextQuestion = async (marathonSettings: MarathonSettings, currentAttempts: QuestionAttempt[]) => {
    setIsLoadingQuestion(true);
    try {
      let subject: 'math' | 'english';
      
      if (marathonSettings.subjects.includes('both')) {
        subject = Math.random() > 0.5 ? 'math' : 'english';
      } else {
        subject = marathonSettings.subjects[0] === 'math' ? 'math' : 'english';
      }

      if (marathonSettings.adaptiveLearning && weakTopics.length > 0 && Math.random() > 0.3) {
        const weakTopic = weakTopics[Math.floor(Math.random() * weakTopics.length)];
        subject = weakTopic.subject;
      }

      const newQuestion = await getRandomQuestion(subject);
      setCurrentQuestion(newQuestion);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Error loading question:', error);
      // Fallback to a simple question if database fails
      setCurrentQuestion({
        id: `fallback-${Date.now()}`,
        question: subject === 'math' ? 'If 3x + 7 = 22, what is the value of x?' : 'Which sentence best supports the main idea?',
        options: subject === 'math' ? ['3', '5', '7', '15'] : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 1,
        explanation: subject === 'math' ? 'Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.' : 'This option best supports the main argument.',
        subject,
        topic: subject === 'math' ? 'Algebra' : 'Reading Comprehension',
        difficulty: 'medium',
        type: 'multiple-choice'
      });
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleAnswer = async (answer: number | string, isCorrect: boolean, showAnswerUsed: boolean, hintsUsed: number) => {
    if (!session || !settings || !currentQuestion) return;

    const timeSpent = Date.now() - questionStartTime;
    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      subject: currentQuestion.subject,
      topic: 'General',
      difficulty: 'medium',
      isCorrect,
      timeSpent,
      hintsUsed,
      showAnswerUsed,
      flagged: flaggedQuestions.includes(currentQuestion.id),
      timestamp: new Date(),
    };

    recordAttempt(attempt);

    if (isCorrect && !showAnswerUsed) {
      setCurrentStreak(prev => prev + 1);
    } else {
      setCurrentStreak(0);
    }

    // Generate next question
    await generateNextQuestion(settings, [...attempts, attempt]);
  };

  const handleEndMarathon = () => {
    const summary = endSession();
    setCurrentScreen('summary');
    return summary;
  };

  const handleFlag = () => {
    if (currentQuestion) {
      toggleFlag(currentQuestion.id);
    }
  };

  const averageTime = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / attempts.length / 1000)
    : 0;

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

  if (isLoadingQuestion || !currentQuestion) {
    return (
      <div className={`min-h-screen ${settings?.darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className={`text-lg ${settings?.darkMode ? 'text-white' : 'text-gray-900'}`}>
              Loading question...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${settings?.darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
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
          
          <div></div>
        </div>

        {session && sessionStartTime && (
          <MarathonStats
            totalQuestions={session.totalQuestions}
            correctAnswers={session.correctAnswers}
            incorrectAnswers={session.incorrectAnswers}
            currentStreak={currentStreak}
            averageTime={averageTime}
            timeGoal={session.timedMode ? session.timeGoalMinutes : undefined}
            sessionStartTime={sessionStartTime}
            showStreak={false}
          />
        )}

        <MarathonQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          onFlag={handleFlag}
          isFlagged={currentQuestion ? flaggedQuestions.includes(currentQuestion.id) : false}
          calculatorEnabled={settings?.calculatorEnabled || false}
          fontSize={settings?.fontSize || 'medium'}
          darkMode={settings?.darkMode || false}
        />
      </div>
    </div>
  );
};

export default Marathon;
