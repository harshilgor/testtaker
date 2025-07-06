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

        {/* Main Content Area - Split vertically */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Half - Question Only */}
          <div className="flex-1 overflow-y-auto bg-white">
            <QuizQuestionSection question={question} isMobile={true} />
          </div>

          {/* Bottom Half - Answer Options Only */}
          <div className="flex-1 bg-gray-50 overflow-y-auto">
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
        <div className="flex-shrink-0">
          <BottomNavigation
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
            onPrevious={onPrevious}
            onNext={onNext}
            nextLabel={currentQuestionIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
            showPrevious={!!onPrevious}
            loading={loading}
            isMobile={true}
          />
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
