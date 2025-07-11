
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizLayout from './Quiz/QuizLayout';
import QuizTopHeader from './Quiz/QuizTopHeader';
import QuizTimer from './Quiz/QuizTimer';
import QuizQuestionPanel from './Quiz/QuizQuestionPanel';
import QuizAnswerPanel from './Quiz/QuizAnswerPanel';
import QuizBottomNavigation from './Quiz/QuizBottomNavigation';
import QuizSummaryPage from './QuizSummaryPage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Subject } from '@/types/common';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  imageUrl?: string;
  hasImage?: boolean;
}

interface QuizViewProps {
  questions: Question[];
  selectedTopics: string[];
  feedbackPreference: 'immediate' | 'end';
  onBack: () => void;
  topics: string[];
  userName: string;
  subject: Subject;
  onBackToDashboard: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
  questions,
  selectedTopics,
  feedbackPreference,
  onBack,
  topics,
  userName,
  subject,
  onBackToDashboard
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [submittedQuestions, setSubmittedQuestions] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [showSummary, setShowSummary] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Track elapsed time
  useEffect(() => {
    if (!quizCompleted) {
      const timerId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [startTime, quizCompleted]);

  useEffect(() => {
    const timerId = setInterval(() => {
      if (!quizCompleted) {
        setTimeRemaining(prevTime => prevTime > 0 ? prevTime - 1 : 0);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [quizCompleted]);

  useEffect(() => {
    if (timeRemaining === 0 && !quizCompleted) {
      handleCompleteQuiz();
    }
  }, [timeRemaining, quizCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (submittedQuestions[currentQuestionIndex]) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleToggleFlag = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmit = () => {
    if (submittedQuestions[currentQuestionIndex]) return;
    
    const newSubmitted = [...submittedQuestions];
    newSubmitted[currentQuestionIndex] = true;
    setSubmittedQuestions(newSubmitted);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleCompleteQuiz = async () => {
    if (quizCompleted) return;
    
    setLoading(true);
    setQuizCompleted(true); // Stop the timer
    
    try {
      const correctAnswers = answers.filter((answer, index) => 
        answer === questions[index].correctAnswer
      ).length;
      
      const scorePercentage = (correctAnswers / questions.length) * 100;
      const finalElapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(finalElapsedTime);
      
      if (user) {
        await supabase.from('quiz_results').insert({
          user_id: user.id,
          subject: questions[0]?.subject || 'Mixed',
          topics: selectedTopics,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          score_percentage: scorePercentage,
          time_taken: finalElapsedTime
        });
      }
      
      // Show summary page
      setShowSummary(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = () => {
    // Reset all state
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setFlaggedQuestions(new Array(questions.length).fill(false));
    setSubmittedQuestions(new Array(questions.length).fill(false));
    setTimeRemaining(30 * 60);
    setShowSummary(false);
    setQuizCompleted(false);
    setElapsedTime(0);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = answers.filter(answer => answer !== null).length;
  const isSubmitted = submittedQuestions[currentQuestionIndex];
  const showFeedback = feedbackPreference === 'immediate' && isSubmitted;
  const isCorrect = answers[currentQuestionIndex] === currentQuestion.correctAnswer;

  if (showSummary) {
    return (
      <QuizSummaryPage
        questions={questions}
        answers={answers}
        topics={topics}
        timeElapsed={elapsedTime}
        onRetakeQuiz={handleRetakeQuiz}
        onBackToDashboard={onBackToDashboard}
        userName={userName}
        subject={subject}
      />
    );
  }

  return (
    <QuizLayout
      topHeader={
        <QuizTopHeader
          topics={topics}
          time={timeRemaining}
          onBack={onBack}
        />
      }
      timer={
        <QuizTimer
          onTimeUpdate={(time) => {
            // Timer logic handled by useEffect above
          }}
        />
      }
      questionPanel={
        <QuizQuestionPanel
          question={currentQuestion}
          isFlagged={flaggedQuestions[currentQuestionIndex]}
          onToggleFlag={handleToggleFlag}
        />
      }
      answerPanel={
        <QuizAnswerPanel
          question={currentQuestion}
          selectedAnswer={answers[currentQuestionIndex]}
          onAnswerSelect={handleAnswerSelect}
          isFlagged={flaggedQuestions[currentQuestionIndex]}
          onToggleFlag={handleToggleFlag}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          feedbackPreference={feedbackPreference}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
          onNext={handleNext}
          loading={loading}
          isSubmitted={isSubmitted}
        />
      }
      bottomNavigation={
        <QuizBottomNavigation
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onGoToQuestion={setCurrentQuestionIndex}
          answeredCount={answeredCount}
          selectedTopics={selectedTopics}
          isNavigationOpen={isNavigationOpen}
          onToggleNavigation={() => setIsNavigationOpen(!isNavigationOpen)}
          onSubmit={handleSubmit}
          submittedQuestions={submittedQuestions}
          onNext={handleNext}
          onCompleteQuiz={handleCompleteQuiz}
        />
      }
    />
  );
};

export default QuizView;
