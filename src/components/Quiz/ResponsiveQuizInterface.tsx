
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import QuestionImage from '../QuestionImage';

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTopNavigation = () => (
    <div className="bg-slate-800 text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 rounded px-3 py-1 text-sm font-medium">
          QUIZ
        </div>
        <span className="text-sm font-medium hidden md:inline">
          Topics: {topics.join(', ')}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-base font-mono">
          {formatTime(timeElapsed)}
        </div>
        
        <Button
          onClick={onExitQuiz}
          variant="outline"
          size="sm"
          className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800 text-xs px-3 py-1 min-h-[44px]"
        >
          Exit Quiz
        </Button>
      </div>
    </div>
  );

  const renderQuestionSection = () => (
    <div className={`${isMobile ? 'flex-1' : 'w-1/2'} overflow-y-auto p-4 md:p-8 ${isMobile ? '' : 'border-r border-gray-200'}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Question</h2>
        <div className="text-base md:text-lg leading-relaxed text-gray-900 mb-4">
          {question.question}
        </div>

        {question.hasImage && question.imageUrl && (
          <div className="mb-6">
            <img 
              src={question.imageUrl} 
              alt="Question diagram" 
              className="max-w-full h-auto rounded-lg border border-gray-200"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderAnswerSection = () => (
    <div className={`${isMobile ? 'bg-gray-50 border-t border-gray-200' : 'w-1/2 bg-white'} ${isMobile ? 'sticky bottom-16' : ''} p-4 md:p-6 ${isMobile ? 'max-h-[50vh] overflow-y-auto' : 'overflow-y-auto'}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Question</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mark-review"
                checked={isFlagged}
                onCheckedChange={onToggleFlag}
              />
              <label htmlFor="mark-review" className="text-sm text-gray-600 cursor-pointer">
                Mark for Review
              </label>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-4">Choose the best answer.</p>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === question.correctAnswer;
              const shouldShowCorrect = feedbackPreference === 'immediate' && showFeedback;
              
              return (
                <button
                  key={index}
                  onClick={() => onAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all min-h-[44px] ${
                    isSelected
                      ? shouldShowCorrect
                        ? isCorrectAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : shouldShowCorrect && isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      isSelected
                        ? shouldShowCorrect
                          ? isCorrectAnswer
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-red-500 bg-red-500 text-white'
                          : 'border-blue-500 bg-blue-500 text-white'
                        : shouldShowCorrect && isCorrectAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && feedbackPreference === 'immediate' && (
          <div className={`p-4 rounded-lg mb-6 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBottomNavigation = () => (
    <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky bottom-0 z-40">
      <div className="text-sm text-gray-600">
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </div>
      
      <div className="flex space-x-3">
        {onPrevious && currentQuestionIndex > 0 && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="px-4 py-2 min-h-[44px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
        )}
        
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 min-h-[44px]"
          disabled={loading}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {renderTopNavigation()}
        <div className="flex-1 flex flex-col pb-16">
          {renderQuestionSection()}
          {renderAnswerSection()}
        </div>
        {renderBottomNavigation()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {renderTopNavigation()}
      <div className="flex-1 flex">
        {renderQuestionSection()}
        {renderAnswerSection()}
      </div>
      {renderBottomNavigation()}
    </div>
  );
};

export default ResponsiveQuizInterface;
