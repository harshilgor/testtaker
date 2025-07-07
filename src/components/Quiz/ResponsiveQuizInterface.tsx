
import React from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import TopNavigation from '../shared/TopNavigation';
import BottomNavigation from '../shared/BottomNavigation';
import QuizQuestionSection from './QuizQuestionSection';
import QuizAnswerSection from './QuizAnswerSection';

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

  // Debug logging
  console.log('Quiz Mode - isMobile:', isMobile);
  console.log('Quiz Mode - window.innerWidth:', window.innerWidth);
  console.log('Quiz Mode - Rendering mobile layout:', isMobile);

  const topicsDisplay = isMobile 
    ? `Topics: ${topics[0]}${topics.length > 1 ? '...' : ''}`
    : `Topics: ${topics.join(', ')}`;

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
              selectedAnswer={selectedAnswer}
              onAnswerSelect={onAnswerSelect}
              isFlagged={isFlagged}
              onToggleFlag={onToggleFlag}
              feedbackPreference={feedbackPreference}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
              isMobile={true}
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
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm min-h-[44px]"
                disabled={loading}
              >
                {currentQuestionIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
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
          selectedAnswer={selectedAnswer}
          onAnswerSelect={onAnswerSelect}
          isFlagged={isFlagged}
          onToggleFlag={onToggleFlag}
          feedbackPreference={feedbackPreference}
          showFeedback={showFeedback}
          isCorrect={isCorrect}
          isMobile={false}
        />
      </div>
      <BottomNavigation
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onPrevious={onPrevious}
        onNext={onNext}
        nextLabel={currentQuestionIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
        showPrevious={!!onPrevious}
        loading={loading}
        isMobile={false}
      />
    </div>
  );
};

export default ResponsiveQuizInterface;
