// @ts-nocheck
import React, { useState } from 'react';
import { QuestionPanelProps, BaseQuestion } from '@/types/question';
import QuestionImage from '../QuestionImage';
import { Eye, EyeOff } from 'lucide-react';

interface TopNavBarProps {
  elapsedTime: number;
  onToggleTimerVisibility: () => void;
  isTimerVisible: boolean;
  onToggleEliminate: () => void;
  isEliminateMode: boolean;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  elapsedTime,
  onToggleTimerVisibility,
  isTimerVisible,
  onToggleEliminate,
  isEliminateMode
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
      {/* Left: Timer and Eye Icon */}
      <div className="flex items-center gap-3">
        {isTimerVisible && (
          <div className="flex items-center gap-2">
            {/* Stopwatch Icon */}
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-600 font-medium text-sm">{formatTime(elapsedTime)}</span>
          </div>
        )}
        <button
          onClick={onToggleTimerVisibility}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title={isTimerVisible ? "Hide timer" : "Show timer"}
        >
          {isTimerVisible ? (
            <Eye className="w-5 h-5 text-gray-600" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Right: Eliminate Button */}
      <button
        onClick={onToggleEliminate}
        className={`px-3 py-1.5 rounded-lg transition-all flex items-center justify-center ${
          isEliminateMode 
            ? 'flex-col gap-0.5 bg-purple-700 text-white border border-purple-500'
            : 'bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200'
        }`}
      >
        {/* Icon with conditional strike-through - only render when active */}
        {isEliminateMode && (
          <div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6" />
            </svg>
          </div>
        )}
        <span className={`text-xs font-medium leading-tight ${isEliminateMode ? 'text-white' : 'text-purple-700'}`}>Eliminate</span>
      </button>
    </div>
  );
};

// Unified question panel that works for Quiz, SAT, and Marathon
const UnifiedQuestionPanel = <T extends BaseQuestion>({ 
  question, 
  isMobile = false,
  isFlagged = false,
  onToggleFlag,
  showPrompt = true,
  elapsedTime,
  onToggleTimerVisibility,
  isTimerVisible,
  onToggleEliminate,
  isEliminateMode
}: QuestionPanelProps<T> & {
  elapsedTime?: number;
  onToggleTimerVisibility?: () => void;
  isTimerVisible?: boolean;
  onToggleEliminate?: () => void;
  isEliminateMode?: boolean;
}) => {
  if (!question) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading question...</div>
        </div>
      </div>
    );
  }

  const paddingClass = isMobile ? 'p-4' : 'p-8';
  const textSizeClass = 'text-base'; // Consistent font size for all text

  // Handle different question content formats
  const questionText = 'question' in question ? (question as any).question : question.content || '';
  const questionPrompt = 'question_prompt' in question ? (question as any).question_prompt : undefined;
  const passageText = question.content || question.question_text || '';

  // Generate image URL if hasImage is true but imageUrl is not provided
  const finalImageUrl = question.imageUrl || (question.hasImage && question.id ? 
    `https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png` : 
    null);

  return (
    <div className={`h-full ${isMobile ? 'p-2' : 'p-3'} flex flex-col`}>
      <div className="max-w-full mx-auto h-full flex flex-col">
        {/* Rounded Container with Curved Edges */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
          {/* Top Navigation Bar */}
          {(elapsedTime !== undefined || onToggleEliminate) && (
            <TopNavBar
              elapsedTime={elapsedTime || 0}
              onToggleTimerVisibility={onToggleTimerVisibility || (() => {})}
              isTimerVisible={isTimerVisible !== false}
              onToggleEliminate={onToggleEliminate || (() => {})}
              isEliminateMode={isEliminateMode || false}
            />
          )}
          {/* Question Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Passage Text (for Reading and Writing questions) */}
            {passageText && passageText !== questionText && (
              <div className={`${textSizeClass} leading-relaxed text-gray-700 p-4 bg-gray-50 rounded-lg mb-6`}>
                {passageText}
              </div>
            )}

            {/* Question Text */}
            <div className={`${textSizeClass} leading-relaxed text-gray-900 mb-6`}>
              {questionText}
            </div>

            {/* Question Prompt (fallback for other question types) */}
            {showPrompt && questionPrompt && questionPrompt !== questionText && (
              <div className={`${textSizeClass} leading-relaxed text-gray-600 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400 mb-6`}>
                {questionPrompt}
              </div>
            )}

            {/* Question Image */}
            {finalImageUrl && (
              <div className="mb-6">
                <QuestionImage 
                  imageUrl={finalImageUrl} 
                  alt="Question diagram" 
                  className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedQuestionPanel;