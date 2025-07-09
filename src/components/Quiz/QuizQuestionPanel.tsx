
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
  isFlagged?: boolean;
  onToggleFlag?: () => void;
}

const QuizQuestionPanel: React.FC<QuizQuestionPanelProps> = ({ 
  question, 
  isFlagged = false, 
  onToggleFlag 
}) => {
  const { isMobile } = useResponsiveLayout();
  
  console.log('QuizQuestionPanel - isMobile:', isMobile);

  if (isMobile) {
    return (
      <div className="h-full p-4 bg-white overflow-y-auto">
        <div className="max-w-full">
          {/* Question Header */}
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-900 mb-2">Question</h2>
            <div className="text-sm leading-relaxed text-gray-900 mb-3">
              {question.question}
            </div>
            
            {/* Flag button moved below question text */}
            {onToggleFlag && (
              <button
                onClick={onToggleFlag}
                className={`text-lg ${isFlagged ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-opacity`}
              >
                🚩
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout - keep existing functionality
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

      </div>
    </div>
  );
};

export default QuizQuestionPanel;
