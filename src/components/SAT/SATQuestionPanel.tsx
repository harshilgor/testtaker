
import React from 'react';

interface Question {
  id: string;
  content: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
}

interface SATQuestionPanelProps {
  question: Question | null;
  isMobile?: boolean;
}

const SATQuestionPanel: React.FC<SATQuestionPanelProps> = ({ question, isMobile = false }) => {
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

  return (
    <div className={`h-full overflow-y-auto ${paddingClass}`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Question
          </h3>
          <p className="text-base md:text-lg leading-relaxed text-gray-900">
            {question.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SATQuestionPanel;
