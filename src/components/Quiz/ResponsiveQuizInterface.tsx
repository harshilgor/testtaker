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

  const topicsDisplay = isMobile 
    ? `Topics: ${topics[0]}${topics.length > 1 ? '...' : ''}`
    : `Topics: ${topics.join(', ')}`;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Sticky Top Navigation */}
        <TopNavigation
          mode="QUIZ"
          modeColor="bg-blue-600"
          title={topicsDisplay}
          timeElapsed={timeElapsed}
          onExit={onExitQuiz}
          isMobile={true}
        />

        {/* Main Content - Split vertically like Marathon Mode */}
        <div className="flex-1 flex flex-col pb-16">
          {/* Question Section - Top Half */}
          <div className="flex-1 overflow-y-auto">
            <QuizQuestionSection question={question} isMobile={true} />
          </div>

          {/* Answer Section - Bottom Half */}
          <div className="flex-1 overflow-y-auto">
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

        {/* Sticky Bottom Navigation - Same as Marathon Mode */}
        <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky bottom-0 z-40">
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
    );
  }

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
