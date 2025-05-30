
import React, { useState, useEffect } from 'react';
import { Question, getQuestionsBySubject, getQuestionsByTopics, questionService } from '../data/questions';
import Calculator from './Calculator';
import { recordQuestionAttempt, getUserTotalPoints } from '@/services/pointsService';
import QuizHeader from './Quiz/QuizHeader';
import QuizProgress from './Quiz/QuizProgress';
import QuestionNavigator from './Quiz/QuestionNavigator';
import QuizSummary from './Quiz/QuizSummary';
import QuizContent from './Quiz/QuizContent';

interface QuizViewProps {
  subject: string;
  topics: string[];
  numQuestions: number;
  onBack: () => void;
  onComplete: (results: any) => void;
  userName: string;
  mode?: 'quiz' | 'marathon';
}

const QuizView: React.FC<QuizViewProps> = ({
  subject,
  topics,
  numQuestions,
  onBack,
  onComplete,
  userName,
  mode = 'quiz'
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [finalTimeSpent, setFinalTimeSpent] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [sessionId] = useState(() => `${mode}-${Date.now()}-${Math.random()}`);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  
  // Marathon mode specific states
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState('');

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let loadedQuestions;
        if (topics.length > 0) {
          loadedQuestions = await getQuestionsByTopics(
            subject === 'math' ? 'math' : 'english',
            topics,
            numQuestions
          );
        } else {
          loadedQuestions = await getQuestionsBySubject(
            subject === 'math' ? 'math' : 'english',
            numQuestions
          );
        }
        
        setQuestions(loadedQuestions);
        setAnswers(new Array(loadedQuestions.length).fill(null));
        setFlaggedQuestions(new Array(loadedQuestions.length).fill(false));
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    loadQuestions();
    loadUserPoints();
  }, [subject, numQuestions, topics]);

  const loadUserPoints = async () => {
    const points = await getUserTotalPoints();
    setTotalPoints(points);
  };

  useEffect(() => {
    if (showSummary || finalTimeSpent !== null) return;
    
    const timer = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, showSummary, finalTimeSpent]);

  // Reset marathon states when question changes
  useEffect(() => {
    if (mode === 'marathon') {
      setShowAnswer(false);
      setShowExplanation(false);
      setHintsUsed(0);
      setHintText('');
    }
  }, [currentQuestionIndex, mode]);

  const handleAnswerSelect = async (answerIndex: number) => {
    if (mode === 'marathon' && showAnswer) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const isCorrect = answerIndex === currentQuestion.correctAnswer;
      
      try {
        const points = await recordQuestionAttempt({
          question_id: currentQuestion.id,
          session_id: sessionId,
          session_type: mode === 'marathon' ? 'marathon' : 'quiz',
          is_correct: isCorrect,
          difficulty: currentQuestion.difficulty || 'medium',
          subject: currentQuestion.subject,
          topic: currentQuestion.topic || 'general',
          time_spent: Math.floor((Date.now() - startTime) / 1000)
        });

        setSessionPoints(prev => prev + points);
        await loadUserPoints();
      } catch (error) {
        console.error('Error recording answer:', error);
      }

      questionService.trackQuestionUsage(currentQuestion.id, mode === 'marathon' ? 'marathon' : 'quiz');
    }
  };

  const handleFlag = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const getHint = () => {
    const hints = [
      "Think about what type of problem this is and what approach you should use.",
      "Break down the problem step by step. What information are you given?",
      "Consider the key concepts or formulas that might apply to this question."
    ];
    
    if (hintsUsed < hints.length) {
      setHintText(hints[hintsUsed]);
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (mode === 'marathon') {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } else {
      goToQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1));
    }
  };

  const handleSubmit = async () => {
    const finalTime = Date.now() - startTime;
    setFinalTimeSpent(finalTime);
    
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / questions.length) * 100);

    const results = {
      score,
      questions,
      answers,
      subject,
      topics,
      date: new Date().toISOString(),
      userName,
      timeSpent: Math.floor(finalTime / 1000),
      correctAnswers,
      totalQuestions: questions.length,
      mode,
      pointsEarned: sessionPoints
    };

    setQuizResults(results);
    setShowSummary(true);

    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    existingResults.push(results);
    localStorage.setItem('quizResults', JSON.stringify(existingResults));
  };

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length;
  };

  const displayTime = finalTimeSpent !== null ? finalTimeSpent : timeSpent;

  if (showSummary && quizResults) {
    return (
      <QuizSummary
        mode={mode}
        userName={userName}
        quizResults={quizResults}
        sessionPoints={sessionPoints}
        onComplete={onComplete}
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = getAnsweredCount();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <QuizHeader
          onBack={onBack}
          mode={mode}
          totalPoints={totalPoints}
          sessionPoints={sessionPoints}
          displayTime={displayTime}
        />

        {mode === 'quiz' && (
          <QuizProgress
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answeredCount={answeredCount}
          />
        )}

        <div className={mode === 'quiz' ? 'grid grid-cols-1 lg:grid-cols-4 gap-6' : ''}>
          {mode === 'quiz' && (
            <QuestionNavigator
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              onGoToQuestion={goToQuestion}
            />
          )}

          <QuizContent
            mode={mode}
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            showAnswer={showAnswer}
            showExplanation={showExplanation}
            hintText={hintText}
            hintsUsed={hintsUsed}
            isLastQuestion={isLastQuestion}
            calculatorOpen={calculatorOpen}
            onAnswerSelect={handleAnswerSelect}
            onFlag={handleFlag}
            onToggleCalculator={() => setCalculatorOpen(!calculatorOpen)}
            onGetHint={getHint}
            onShowAnswer={handleShowAnswer}
            onPrevious={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <Calculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  );
};

export default QuizView;
