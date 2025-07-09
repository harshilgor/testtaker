
import React, { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import TopNavigation from '../shared/TopNavigation';
import BottomNavigation from '../shared/BottomNavigation';
import QuizQuestionSection from './QuizQuestionSection';
import QuizAnswerSection from './QuizAnswerSection';
import QuizSummary from './QuizSummary';

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
  difficulty: string;
  imageUrl?: string;
  hasImage?: boolean;
}

interface ResponsiveQuizInterfaceProps {
  question: Question;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  feedbackPreference: 'immediate' | 'end';
  showFeedback: boolean;
  isCorrect: boolean;
  onNext: () => void;
  onPrevious?: () => void;
  loading: boolean;
  topics: string[];
  timeElapsed: number;
  onExitQuiz: () => void;
}

const ResponsiveQuizInterface: React.FC<ResponsiveQuizInterfaceProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  isFlagged,
  onToggleFlag,
  currentQuestionIndex,
  totalQuestions,
  feedbackPreference,
  showFeedback,
  isCorrect,
  onNext,
  onPrevious,
  loading,
  topics,
  timeElapsed,
  onExitQuiz
}) => {
  const { isMobile } = useResponsiveLayout();
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Debug logging
  console.log('Quiz Mode - isMobile:', isMobile);
  console.log('Quiz Mode - window.innerWidth:', window.innerWidth);
  console.log('Quiz Mode - Rendering mobile layout:', isMobile);

  const topicsDisplay = isMobile 
    ? `Topics: ${topics[0]}${topics.length > 1 ? '...' : ''}`
    : `Topics: ${topics.join(', ')}`;

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Create sets for QuizAnswerSection props
  const answeredQuestions = new Set<string>();
  const flaggedQuestions = new Set<string>();
  
  if (selectedAnswer !== null) {
    answeredQuestions.add(question.id);
  }
  
  if (isFlagged) {
    flaggedQuestions.add(question.id);
  }

  const handleSubmitQuiz = () => {
    // Calculate final score
    let finalCorrectAnswers = correctAnswers;
    if (showFeedback && isCorrect) {
      finalCorrectAnswers++;
    }
    setCorrectAnswers(finalCorrectAnswers);
    setQuizCompleted(true);
  };

  const handleRetakeQuiz = () => {
    setQuizCompleted(false);
    setCorrectAnswers(0);
    // Reset quiz state and go back to first question
    window.location.reload();
  };

  const calculatePoints = () => {
    return correctAnswers * 10; // 10 points per correct answer
  };

  if (quizCompleted) {
    return (
      <QuizSummary
        totalQuestions={totalQuestions}
        correctAnswers={correctAnswers}
        totalPoints={calculatePoints()}
        onRetakeQuiz={handleRetakeQuiz}
        onBackToHome={onExitQuiz}
        selectedTopics={topics}
        timeElapsed={timeElapsed}
      />
    );
  }

  // Mobile Layout
  if (isMobile) {
    console.log('Quiz Mode - Using MOBILE layout');
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        {/* Sticky Top Navigation */}
        <div className="flex-shrink-0">
          <TopNavigation
            mode="QUIZ"
            modeColor="bg-blue-600"
            title={topicsDisplay}
            timeElapsed={timeElapsed}
            onExit={onExitQuiz}
            isMobile={true}
          />
        </div>

        {/* Main Content - Vertical Split (50/50) */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Question Section - Top Half */}
          <div className="flex-1 bg-white border-b border-gray-200 overflow-hidden">
            <QuizQuestionSection question={question} isMobile={true} />
          </div>

          {/* Answer Section - Bottom Half */}
          <div className="flex-1 bg-white overflow-hidden">
            <QuizAnswerSection
              question={question}
              currentAnswer={selectedAnswer}
              answeredQuestions={answeredQuestions}
              flaggedQuestions={flaggedQuestions}
              feedbackPreference={feedbackPreference}
              onAnswerChange={onAnswerSelect}
              onToggleFlag={onToggleFlag}
              onSubmitAnswer={() => {}}
              showRationale={showFeedback}
              onShowRationale={() => {}}
              isSubmitted={showFeedback}
            />
          </div>
        </div>

        {/* Sticky Bottom Navigation */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
            <div className="flex space-x-3">
              {onPrevious && currentQuestionIndex > 0 && (
                <button
                  onClick={onPrevious}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 min-h-[44px]"
                  disabled={loading}
                >
                  Previous
                </button>
              )}
              <button
                onClick={isLastQuestion ? handleSubmitQuiz : onNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm min-h-[44px]"
                disabled={loading}
              >
                {isLastQuestion ? 'Submit Quiz' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  console.log('Quiz Mode - Using DESKTOP layout');
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavigation
        mode="QUIZ"
        modeColor="bg-blue-600"
        title={topicsDisplay}
        timeElapsed={timeElapsed}
        onExit={onExitQuiz}
        isMobile={false}
      />
      <div className="flex-1 flex">
        <QuizQuestionSection question={question} isMobile={false} />
        <QuizAnswerSection
          question={question}
          currentAnswer={selectedAnswer}
          answeredQuestions={answeredQuestions}
          flaggedQuestions={flaggedQuestions}
          feedbackPreference={feedbackPreference}
          onAnswerChange={onAnswerSelect}
          onToggleFlag={onToggleFlag}
          onSubmitAnswer={() => {}}
          showRationale={showFeedback}
          onShowRationale={() => {}}
          isSubmitted={showFeedback}
        />
      </div>
      <BottomNavigation
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onPrevious={onPrevious}
        onNext={isLastQuestion ? handleSubmitQuiz : onNext}
        nextLabel={isLastQuestion ? 'Submit Quiz' : 'Next'}
        showPrevious={!!onPrevious}
        loading={loading}
        isMobile={false}
      />
    </div>
  );
};

export default ResponsiveQuizInterface;
