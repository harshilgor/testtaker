import React, { useState, useEffect } from 'react';
import { questionService, DatabaseQuestion } from '@/services/questionService';
import { supabase } from '@/integrations/supabase/client';
import Calculator from './Calculator';
import { recordQuestionAttempt, getUserTotalPoints } from '@/services/pointsService';
import QuizHeader from './Quiz/QuizHeader';
import QuizProgress from './Quiz/QuizProgress';
import QuestionNavigator from './Quiz/QuestionNavigator';
import QuizSummary from './Quiz/QuizSummary';
import QuizContent from './Quiz/QuizContent';
import QuizDetailedResults from './Quiz/QuizDetailedResults';
import ExitQuizDialog from './Quiz/ExitQuizDialog';
import { useQuestionSession } from '@/hooks/useQuestionSession';
import FeedbackModal from './FeedbackModal';

interface QuizViewProps {
  subject: string;
  topics: string[];
  numQuestions: number;
  feedbackPreference: 'immediate' | 'end';
  onBack: () => void;
  onComplete: (results: any) => void;
  userName: string;
  mode?: 'quiz' | 'marathon';
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: 'math' | 'english';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rationales?: {
    correct: string;
    incorrect: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
    };
  };
}

const QuizView: React.FC<QuizViewProps> = ({
  subject,
  topics,
  numQuestions,
  feedbackPreference,
  onBack,
  onComplete,
  userName,
  mode = 'quiz'
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [finalTimeSpent, setFinalTimeSpent] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [sessionId] = useState(() => `quiz-${Date.now()}-${Math.random()}`);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  
  // Marathon mode specific states (keeping for compatibility)
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState('');

  const { initializeSession } = useQuestionSession();

  // Load questions and initialize session
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        console.log('Loading questions for subject:', subject, 'topics:', topics);
        
        try {
          await initializeSession(sessionId, 'quiz');
        } catch (sessionError) {
          console.error('Failed to initialize session:', sessionError);
        }
        
        const section = subject === 'math' ? 'math' : 'reading-writing';
        let dbQuestions: DatabaseQuestion[] = [];
        
        try {
          if (topics.length > 0 && !topics.includes('wrong-questions')) {
            for (const topic of topics) {
              const { data: topicQuestions, error: topicError } = await supabase
                .from('question_bank')
                .select('*')
                .eq('section', section)
                .eq('skill', topic)
                .not('question_text', 'is', null)
                .limit(Math.ceil(numQuestions / topics.length));

              if (!topicError && topicQuestions) {
                const converted = topicQuestions.map(q => ({
                  ...q,
                  id: q.id?.toString() || '',
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  metadata: {}
                }));
                dbQuestions.push(...converted);
              }
            }
          }
          
          if (dbQuestions.length === 0) {
            const { data: fallbackQuestions, error } = await supabase
              .from('question_bank')
              .select('*')
              .eq('section', section)
              .not('question_text', 'is', null)
              .limit(numQuestions);

            if (!error && fallbackQuestions) {
              dbQuestions = fallbackQuestions.map(q => ({
                ...q,
                id: q.id?.toString() || '',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                metadata: {}
              }));
            }
          }
        } catch (error) {
          console.error('Failed to load questions:', error);
        }
        
        const convertedQuestions = dbQuestions.map(q => {
          const converted = questionService.convertToLegacyFormat(q);
          return {
            ...converted,
            subject: converted.subject as 'math' | 'english'
          };
        }).slice(0, numQuestions);
        
        setQuestions(convertedQuestions);
        setAnswers(new Array(convertedQuestions.length).fill(null));
        setFlaggedQuestions(new Array(convertedQuestions.length).fill(false));
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
        setAnswers([]);
        setFlaggedQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
    loadUserPoints();
  }, [subject, numQuestions, topics, sessionId, initializeSession]);

  const loadUserPoints = async () => {
    try {
      const points = await getUserTotalPoints();
      setTotalPoints(points);
    } catch (error) {
      console.error('Error loading user points:', error);
      setTotalPoints(0);
    }
  };

  // Timer effect
  useEffect(() => {
    if (showSummary || finalTimeSpent !== null) return;
    
    const timer = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, showSummary, finalTimeSpent]);

  const getPointsForDifficulty = (difficulty: string): number => {
    switch (difficulty) {
      case 'easy': return 5;
      case 'medium': return 10;
      case 'hard': return 15;
      default: return 10;
    }
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    const newAnsweredQuestions = new Set(answeredQuestions);
    const wasAlreadyAnswered = newAnsweredQuestions.has(currentQuestionIndex);
    newAnsweredQuestions.add(currentQuestionIndex);
    setAnsweredQuestions(newAnsweredQuestions);

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !wasAlreadyAnswered) {
      const isCorrect = answerIndex === currentQuestion.correctAnswer;
      
      try {
        console.log('Recording quiz answer for question:', currentQuestion.id, 'correct:', isCorrect);
        
        const points = await recordQuestionAttempt({
          question_id: currentQuestion.id.toString(),
          session_id: sessionId,
          session_type: 'quiz',
          is_correct: isCorrect,
          difficulty: currentQuestion.difficulty || 'medium',
          subject: currentQuestion.subject,
          topic: currentQuestion.topic || 'general',
          time_spent: Math.floor((Date.now() - startTime) / 1000)
        });

        console.log('Quiz answer recorded, points earned:', points);
        
        if (isCorrect) {
          const earnedPoints = getPointsForDifficulty(currentQuestion.difficulty);
          setSessionPoints(prev => prev + earnedPoints);
          console.log('Points earned for correct answer:', earnedPoints);
        }
        
        await loadUserPoints();
      } catch (error) {
        console.error('Error recording answer:', error);
      }

      try {
        await questionService.trackQuestionUsage(currentQuestion.id, 'quiz', sessionId);
      } catch (error) {
        console.error('Error tracking question usage:', error);
      }

      // Show immediate feedback if preference is set to immediate
      if (feedbackPreference === 'immediate') {
        const selectedOptionLetter = String.fromCharCode(65 + answerIndex);
        const correctOptionLetter = String.fromCharCode(65 + currentQuestion.correctAnswer);
        
        setCurrentFeedback({
          isCorrect,
          selectedAnswer: selectedOptionLetter,
          correctAnswer: correctOptionLetter,
          correctRationale: currentQuestion.rationales?.correct || currentQuestion.explanation,
          incorrectRationale: currentQuestion.rationales?.incorrect?.[selectedOptionLetter as keyof typeof currentQuestion.rationales.incorrect],
          allIncorrectRationales: currentQuestion.rationales?.incorrect || {}
        });
        setShowFeedbackModal(true);
      }
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

  const handleNext = () => {
    goToQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1));
  };

  const handleFeedbackNext = () => {
    setShowFeedbackModal(false);
    setCurrentFeedback(null);
    handleNext();
  };

  const handleExitQuiz = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    onBack();
  };

  const handleContinueQuiz = () => {
    setShowExitDialog(false);
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
      mode: 'quiz',
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

  if (showDetailedResults && quizResults) {
    return (
      <QuizDetailedResults
        questions={questions}
        answers={answers}
        onBack={() => setShowDetailedResults(false)}
        onComplete={onComplete}
        quizResults={quizResults}
      />
    );
  }

  if (showSummary && quizResults) {
    return (
      <QuizSummary
        mode="quiz"
        userName={userName}
        quizResults={quizResults}
        sessionPoints={sessionPoints}
        onComplete={onComplete}
        onViewDetailed={feedbackPreference === 'end' ? () => setShowDetailedResults(true) : undefined}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No questions available for the selected criteria.</p>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
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
          onBack={handleExitQuiz}
          mode="quiz"
          totalPoints={totalPoints}
          sessionPoints={sessionPoints}
          displayTime={displayTime}
          backButtonText="Exit Quiz"
        />

        <QuizProgress
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          answeredCount={answeredCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <QuestionNavigator
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            onGoToQuestion={goToQuestion}
          />

          <QuizContent
            mode="quiz"
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
            feedbackPreference={feedbackPreference}
            onAnswerSelect={handleAnswerSelect}
            onFlag={handleFlag}
            onToggleCalculator={() => setCalculatorOpen(!calculatorOpen)}
            onGetHint={() => {}}
            onShowAnswer={() => {}}
            onPrevious={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
            onNext={handleNext}
            onSubmit={handleSubmit}
            hideExplanation={feedbackPreference === 'immediate'}
          />
        </div>
      </div>

      <Calculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />

      <ExitQuizDialog
        isOpen={showExitDialog}
        onExit={handleConfirmExit}
        onContinue={handleContinueQuiz}
      />

      {showFeedbackModal && currentFeedback && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          isCorrect={currentFeedback.isCorrect}
          selectedAnswer={currentFeedback.selectedAnswer}
          correctAnswer={currentFeedback.correctAnswer}
          correctRationale={currentFeedback.correctRationale}
          incorrectRationale={currentFeedback.incorrectRationale}
          allIncorrectRationales={currentFeedback.allIncorrectRationales}
          onNext={handleFeedbackNext}
        />
      )}
    </div>
  );
};

export default QuizView;
