
import React, { useState, useEffect } from 'react';
import QuizTimer from './Quiz/QuizTimer';
import QuizResultsView from './Quiz/QuizResultsView';
import QuizLayout from './Quiz/QuizLayout';
import QuizTopHeader from './Quiz/QuizTopHeader';
import QuizQuestionPanel from './Quiz/QuizQuestionPanel';
import QuizAnswerPanel from './Quiz/QuizAnswerPanel';
import QuizBottomNavigation from './Quiz/QuizBottomNavigation';
import { calculatePoints } from '@/services/pointsService';
import { supabase } from '@/integrations/supabase/client';

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
  onBack: () => void;
  subject: string;
  topics: string[];
  userName: string;
  feedbackPreference: 'immediate' | 'end';
}

const QuizView: React.FC<QuizViewProps> = ({ 
  questions, 
  onBack, 
  subject, 
  topics, 
  userName, 
  feedbackPreference 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [submittedQuestions, setSubmittedQuestions] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [time, setTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    // Don't allow answer changes if already submitted
    if (submittedQuestions[currentQuestionIndex]) {
      return;
    }
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitAnswer = () => {
    if (answers[currentQuestionIndex] === null) {
      return;
    }
    
    const newSubmitted = [...submittedQuestions];
    newSubmitted[currentQuestionIndex] = true;
    setSubmittedQuestions(newSubmitted);
    
    // Show feedback immediately after submission
    setShowFeedback(true);
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    // Show feedback if the question was already submitted
    setShowFeedback(submittedQuestions[index]);
    setIsNavigationOpen(false);
  };

  const handleToggleFlag = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    
    try {
      const correctAnswers = answers.reduce((count, answer, index) => {
        return answer === questions[index].correctAnswer ? count + 1 : count;
      }, 0);

      const totalScore = answers.reduce((score, answer, index) => {
        if (answer === questions[index].correctAnswer) {
          return score + calculatePoints(questions[index].difficulty, true);
        }
        return score;
      }, 0);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('quiz_results').insert({
          user_id: user.id,
          subject: subject,
          topics: topics,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          score_percentage: Math.round((correctAnswers / questions.length) * 100),
          time_taken: time
        });
      }

      const quizResult = {
        score: Math.round((correctAnswers / questions.length) * 100),
        questions: questions,
        answers: answers,
        subject: subject,
        topics: topics,
        date: new Date().toLocaleDateString(),
        userName: userName,
        totalScore: totalScore,
        correctAnswers: correctAnswers,
        totalQuestions: questions.length
      };

      const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      storedResults.push(quizResult);
      localStorage.setItem('quizResults', JSON.stringify(storedResults));
      
      setShowResults(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  if (showResults) {
    return (
      <QuizResultsView
        questions={questions}
        answers={answers}
        feedbackPreference={feedbackPreference}
        onBack={onBack}
        userName={userName}
        subject={subject}
        topics={topics}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Saving your results...</div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];
  const isFlagged = flaggedQuestions[currentQuestionIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <QuizLayout
      topHeader={
        <QuizTopHeader
          topics={topics}
          time={time}
          onBack={onBack}
        />
      }
      timer={<QuizTimer onTimeUpdate={setTime} />}
      questionPanel={
        <QuizQuestionPanel question={currentQuestion} />
      }
      answerPanel={
        <QuizAnswerPanel
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          isFlagged={isFlagged}
          onToggleFlag={handleToggleFlag}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          feedbackPreference={feedbackPreference}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
          onNext={handleNext}
          loading={loading}
          isSubmitted={submittedQuestions[currentQuestionIndex]}
        />
      }
      bottomNavigation={
        <QuizBottomNavigation
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onGoToQuestion={handleGoToQuestion}
          answeredCount={answeredCount}
          selectedTopics={topics}
          isNavigationOpen={isNavigationOpen}
          onToggleNavigation={() => setIsNavigationOpen(!isNavigationOpen)}
          onSubmit={handleSubmitAnswer}
          submittedQuestions={submittedQuestions}
        />
      }
    />
  );
};

export default QuizView;
