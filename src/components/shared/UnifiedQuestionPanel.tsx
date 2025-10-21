import React from 'react';
import { QuestionPanelProps, BaseQuestion } from '@/types/question';
import QuestionImage from '../QuestionImage';

// Unified question panel that works for Quiz, SAT, and Marathon
const UnifiedQuestionPanel = <T extends BaseQuestion>({ 
  question, 
  isMobile = false,
  isFlagged = false,
  onToggleFlag,
  showPrompt = true
}: QuestionPanelProps<T>) => {
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
  const textSizeClass = isMobile ? 'text-sm' : 'text-lg';
  const headerSizeClass = isMobile ? 'text-sm' : 'text-lg';

  // Handle different question content formats
  const questionText = 'question' in question ? (question as any).question : question.content || '';
  const questionPrompt = 'question_prompt' in question ? (question as any).question_prompt : undefined;
  const passageText = question.content || question.question_text || '';

  // Generate image URL if hasImage is true but imageUrl is not provided
  const finalImageUrl = question.imageUrl || (question.hasImage && question.id ? 
    `https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png` : 
    null);

  return (
    <div className={`h-full bg-gray-50 overflow-y-auto ${isMobile ? 'p-2' : 'p-3'}`}>
      <div className="max-w-full mx-auto">
        {/* Rounded Container with Curved Edges */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
          {/* Question Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className={`${headerSizeClass} font-semibold text-gray-900`}>Question</h2>
              
              {/* Flag button */}
              {onToggleFlag && (
                <button
                  onClick={onToggleFlag}
                  className={`text-lg ${isFlagged ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-opacity`}
                  aria-label={isFlagged ? 'Remove flag' : 'Flag question'}
                >
                  🚩
                </button>
              )}
            </div>
          </div>
          
          {/* Question Content */}
          <div className="p-6">
            {/* Passage Text (for Reading and Writing questions) */}
            {passageText && passageText !== questionText && (
              <div className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed text-gray-700 p-4 bg-gray-50 rounded-lg border-l-4 border-green-400 mb-6`}>
                {passageText}
              </div>
            )}

            {/* Question Text */}
            <div className={`${textSizeClass} leading-relaxed text-gray-900 mb-6`}>
              {questionText}
            </div>

            {/* Question Prompt (fallback for other question types) */}
            {showPrompt && questionPrompt && questionPrompt !== questionText && (
              <div className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed text-gray-600 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400 mb-6`}>
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