
import React from 'react';
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

interface QuizQuestionPanelProps {
  question: Question;
}

const QuizQuestionPanel: React.FC<QuizQuestionPanelProps> = ({ question }) => {
  const { isMobile } = useResponsiveLayout();
  
  console.log('QuizQuestionPanel - isMobile:', isMobile);

  if (isMobile) {
    return (
      <div className="h-full p-4 bg-white overflow-y-auto">
        <div className="max-w-full">
          {/* Question Header */}
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-900 mb-2">Question</h2>
            <div className="text-sm leading-relaxed text-gray-900">
              {question.question}
            </div>
          </div>

          {/* Conditional Question Image - Only show if hasImage is true */}
          {question.hasImage && question.imageUrl && (
            <div className="mb-4">
              <img 
                src={question.imageUrl} 
                alt="Question diagram" 
                className="max-w-full h-auto max-h-32 rounded-lg border border-gray-200"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-full p-8 bg-white overflow-y-auto">
      <div className="max-w-3xl">
        {/* Question Header */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Question</h2>
          <div className="text-lg leading-relaxed text-gray-900">
            {question.question}
          </div>
        </div>

        {/* Conditional Question Image - Only show if hasImage is true */}
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
};

export default QuizQuestionPanel;
