
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import QuizBottomNavigationGrid from './QuizBottomNavigationGrid';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

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

interface QuizBottomNavigationProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  flaggedQuestions: boolean[];
  onGoToQuestion: (index: number) => void;
  answeredCount: number;
  selectedTopics: string[];
  isNavigationOpen: boolean;
  onToggleNavigation: () => void;
  onSubmit: () => void;
  submittedQuestions: boolean[];
  onNext: () => void;
  onCompleteQuiz: () => void;
}

const QuizBottomNavigation: React.FC<QuizBottomNavigationProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onGoToQuestion,
  answeredCount,
  selectedTopics,
  isNavigationOpen,
  onToggleNavigation,
  onSubmit,
  submittedQuestions,
  onNext,
  onCompleteQuiz
}) => {
  const { isMobile } = useResponsiveLayout();
  const hasAnswered = answers[currentQuestionIndex] !== null;
  const isSubmitted = submittedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNavigationToggle = () => {
    onToggleNavigation();
    // Auto-scroll to bottom when navigation opens (for web view only)
    if (!isMobile && !isNavigationOpen) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleButtonClick = () => {
    console.log('Button clicked:', { isSubmitted, isLastQuestion, hasAnswered });
    if (!isSubmitted) {
      // First click: Submit the answer
      console.log('Submitting answer...');
      onSubmit();
    } else if (isLastQuestion) {
      // Last question, already submitted: Complete the quiz
      console.log('Completing quiz...');
      onCompleteQuiz();
    } else {
      // Not last question, already submitted: Go to next question
      console.log('Going to next question...');
      onNext();
    }
  };

  const getButtonText = () => {
    if (!isSubmitted) {
      return 'Submit';
    } else if (isLastQuestion) {
      return 'Complete Quiz';
    } else {
      return 'Next Question';
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex justify-between items-center">
        {/* Left side - Question Navigator button */}
        <button
          onClick={handleNavigationToggle}
          className={`text-sm font-medium bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between ${
            isMobile ? 'h-11' : ''
          }`}
        >
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <ChevronUp className="h-4 w-4 ml-2" />
        </button>
        
        {/* Right side - Submit/Next/Complete button */}
        <Button
          onClick={handleButtonClick}
          disabled={!hasAnswered}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center ${
            isMobile ? 'h-11' : ''
          }`}
        >
          {getButtonText()}
          {isSubmitted && !isLastQuestion && <ChevronUp className="h-4 w-4 ml-2 rotate-90" />}
        </Button>
      </div>

      {/* Navigation Grid */}
      {isNavigationOpen && (
        <QuizBottomNavigationGrid
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onGoToQuestion={onGoToQuestion}
          answeredCount={answeredCount}
          selectedTopics={selectedTopics}
        />
      )}
    </div>
  );
};

export default QuizBottomNavigation;
