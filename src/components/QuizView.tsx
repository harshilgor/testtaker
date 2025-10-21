
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizLayout from './Quiz/QuizLayout';
import QuizTopHeader from './Quiz/QuizTopHeader';
import QuizTimer from './Quiz/QuizTimer';
import QuizQuestionPanel from './Quiz/QuizQuestionPanel';
import QuizAnswerPanel from './Quiz/QuizAnswerPanel';
import QuizBottomNavigation from './Quiz/QuizBottomNavigation';
import QuizSidebar from './Quiz/QuizSidebar';
import QuizSummaryPage from './QuizSummaryPage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Subject } from '@/types/common';
import { QuizQuestion } from '@/types/question';
import { useQueryClient } from '@tanstack/react-query';

interface QuizViewProps {
  questions: QuizQuestion[];
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
  const queryClient = useQueryClient();
  
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
  const [questionStartTimes, setQuestionStartTimes] = useState<number[]>(
    () => new Array(questions.length).fill(Date.now())
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [answerCorrectness, setAnswerCorrectness] = useState<(boolean | null)[]>(new Array(questions.length).fill(null));

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
    
    // Check if answer is correct
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestionIndex];
    const isCorrect = selectedAnswer !== null && selectedAnswer === currentQuestion.correctAnswer;
    
    // Update answer correctness
    const newCorrectness = [...answerCorrectness];
    newCorrectness[currentQuestionIndex] = isCorrect;
    setAnswerCorrectness(newCorrectness);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Track question start time for the new question
      const newStartTimes = [...questionStartTimes];
      newStartTimes[currentQuestionIndex + 1] = Date.now();
      setQuestionStartTimes(newStartTimes);
    }
  };

  const handleCompleteQuiz = async () => {
    console.log('handleCompleteQuiz called');
    if (quizCompleted) {
      console.log('Quiz already completed, returning');
      return;
    }
    
    console.log('Setting loading and completed states...');
    setLoading(true);
    setQuizCompleted(true); // Stop the timer
    
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    
    const scorePercentage = (correctAnswers / questions.length) * 100;
    const finalElapsedTime = Math.floor((Date.now() - startTime) / 1000);
    setElapsedTime(finalElapsedTime);
    
    const sessionId = `quiz-${Date.now()}`;
    
    // Normalize subject values
    const subjectValue = subject === 'math' ? 'Math' : subject === 'english' ? 'English' : 'Mixed';
    const subjectForAttempt = subject === 'math' ? 'math' : subject === 'english' ? 'english' : 'mixed';
    const topicsToUse = (topics && topics.length > 0) ? topics : selectedTopics;
    
    // Try to save to Supabase if user is authenticated
    if (user) {
      try {
        console.log('Saving quiz results to Supabase...');
        
        // Record quiz results
        const { error: quizError } = await supabase.from('quiz_results').insert({
          user_id: user.id,
          subject: subjectValue,
          topics: topicsToUse,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          score_percentage: scorePercentage,
          time_taken: finalElapsedTime
        });

        if (quizError) {
          console.error('Error saving quiz results:', quizError);
          // Don't throw error, continue to save locally
        } else {
          console.log('Quiz results saved successfully');
          // Clear localStorage cache to prevent duplicates
          try {
            const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
            const filtered = stored.filter((r: any) => 
              !(r.userName === userName && 
                r.questions?.length === questions.length && 
                Math.abs(new Date(r.date).getTime() - new Date().getTime()) < 60000) // Within 1 minute
            );
            localStorage.setItem('quizResults', JSON.stringify(filtered));
            console.log('Cleared duplicate localStorage entries');
          } catch (e) {
            console.warn('Failed to clear localStorage cache:', e);
          }
          // Dispatch event to refresh question counts
          window.dispatchEvent(new CustomEvent('quiz-completed'));
        }

        // Record individual question attempts for performance tracking
        const questionAttempts = questions.map((question, index) => {
          const timeSpent = Math.max(1, Math.floor((Date.now() - questionStartTimes[index]) / 1000));
          const userAnswer = answers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          
          return {
            user_id: user.id,
            question_id: question.id.toString(), // Now properly saved as text
            session_id: sessionId,
            session_type: 'quiz',
            subject: subjectForAttempt,
            topic: question.topic,
            difficulty: question.difficulty,
            is_correct: isCorrect,
            time_spent: timeSpent,
            points_earned: isCorrect ? (question.difficulty === 'hard' ? 9 : question.difficulty === 'medium' ? 6 : 3) : 0
          };
        });

        console.log('Saving question attempts...', questionAttempts);
        const { error: attemptsError } = await supabase
          .from('question_attempts_v2')
          .insert(questionAttempts);

        if (attemptsError) {
          console.error('Error saving question attempts:', attemptsError);
          // Don't throw error, continue to save locally
        } else {
          console.log('Question attempts saved successfully');
        }

        // Invalidate React Query cache for immediate UI updates
        console.log('Invalidating React Query cache...');
        queryClient.invalidateQueries({ queryKey: ['recent-quiz-sessions', userName] });
        queryClient.invalidateQueries({ queryKey: ['all-quiz-sessions', userName] });
        queryClient.invalidateQueries({ queryKey: ['recent-sessions', userName] });
        queryClient.invalidateQueries({ queryKey: ['quiz-results-performance', userName] });
        queryClient.invalidateQueries({ queryKey: ['performance-analysis', userName] });
        queryClient.invalidateQueries({ queryKey: ['all-attempts', userName] });
        queryClient.invalidateQueries({ queryKey: ['difficulty-breakdown', userName] });
        queryClient.invalidateQueries({ queryKey: ['marathon-sessions-performance', userName] });
        queryClient.invalidateQueries({ queryKey: ['user-mistakes', userName] });
        
        // Clear recent sessions cache to force refresh
        try {
          localStorage.removeItem(`recent-sessions-cache-${userName}`);
          console.log('Cleared recent sessions cache');
        } catch (e) {
          console.warn('Failed to clear recent sessions cache:', e);
        }
        queryClient.invalidateQueries({ queryKey: ['question-details'] });
        
      } catch (error) {
        console.error('Supabase save error (will continue with local save):', error);
        // Don't show error toast or throw - we'll save locally instead
      }
    }

    // Always persist a lightweight local copy for instant UI updates
    try {
      console.log('Saving local quiz result...');
      const localEntry = {
        id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `local-${Date.now()}`,
        userName,
        subject: subjectValue,
        topics: topicsToUse,
        questions: questions.map((q, i) => ({
          id: q.id,
          correctAnswer: q.correctAnswer,
          topic: q.topic,
          subject: subjectForAttempt,
          difficulty: q.difficulty,
          timeSpent: Math.max(1, Math.floor((Date.now() - questionStartTimes[i]) / 1000)),
        })),
        answers,
        date: new Date().toISOString(),
      };
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      stored.push(localEntry);
      localStorage.setItem('quizResults', JSON.stringify(stored));
      console.log('Local quiz result saved');
    } catch (e) {
      console.warn('Failed to save local quiz result', e);
    }
    
    // Always show summary page regardless of save status
    setLoading(false);
    setShowSummary(true);
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
    setQuestionStartTimes(new Array(questions.length).fill(Date.now()));
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
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <QuizSidebar
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        onGoToQuestion={setCurrentQuestionIndex}
        onBack={onBack}
        subject={subject}
        topics={topics}
        timeRemaining={timeRemaining}
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        answerCorrectness={answerCorrectness}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <QuizTopHeader
          topics={topics}
          time={0}
          onBack={() => {}}
          difficulty={currentQuestion.difficulty}
        />
        
        {/* Main Quiz Content */}
        <div className="flex-1 flex p-2">
          {/* Question Panel */}
          <div className="w-1/2 border-r border-gray-200 pr-1">
            <QuizQuestionPanel
              question={currentQuestion}
              isFlagged={flaggedQuestions[currentQuestionIndex]}
              onToggleFlag={handleToggleFlag}
            />
          </div>
          
          {/* Answer Panel */}
          <div className="w-1/2 pl-1">
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
          </div>
        </div>
        
        {/* Bottom Navigation - New Design */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-center items-center space-x-4">
            {/* Submit Answer Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || submittedQuestions.includes(currentQuestionIndex)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
            
            {/* New Question Button */}
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <span>New Question</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizView;
