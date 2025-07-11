
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizLayout from './Quiz/QuizLayout';
import QuizTopHeader from './Quiz/QuizTopHeader';
import QuizTimer from './Quiz/QuizTimer';
import QuizQuestionPanel from './Quiz/QuizQuestionPanel';
import QuizAnswerPanel from './Quiz/QuizAnswerPanel';
import QuizBottomNavigation from './Quiz/QuizBottomNavigation';
import QuizResultsView from './Quiz/QuizResultsView';
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
  const [isComplete, setIsComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeRemaining(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) {
      handleQuizComplete();
    }
  }, [timeRemaining]);

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
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    setLoading(true);
    
    try {
      const correctAnswers = answers.filter((answer, index) => 
        answer === questions[index].correctAnswer
      ).length;
      
      const scorePercentage = (correctAnswers / questions.length) * 100;
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      
      if (user) {
        await supabase.from('quiz_results').insert({
          user_id: user.id,
          subject: questions[0]?.subject || 'Mixed',
          topics: selectedTopics,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          score_percentage: scorePercentage,
          time_taken: timeElapsed
        });
      }
      
      setIsComplete(true);
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
    setIsComplete(false);
    setShowSummary(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = answers.filter(answer => answer !== null).length;
  const isSubmitted = submittedQuestions[currentQuestionIndex];
  const showFeedback = feedbackPreference === 'immediate' && isSubmitted;
  const isCorrect = answers[currentQuestionIndex] === currentQuestion.correctAnswer;
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);

  if (showSummary) {
    return (
      <QuizSummaryPage
        questions={questions}
        answers={answers}
        topics={topics}
        timeElapsed={timeElapsed}
        onRetakeQuiz={handleRetakeQuiz}
        onBackToDashboard={onBackToDashboard}
        userName={userName}
        subject={subject}
      />
    );
  }

  if (isComplete && !showSummary) {
    return (
      <QuizResultsView
        questions={questions}
        answers={answers}
        topics={topics}
        onBack={onBack}
        feedbackPreference={feedbackPreference}
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
        />
      }
    />
  );
};

export default QuizView;
