
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
}

const SATQuestionPanel: React.FC<SATQuestionPanelProps> = ({ question }) => {
  if (!question) {
    return (
      <div className="h-full overflow-y-auto p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-3xl">
        {question.passage && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Passage</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {question.passage}
              </p>
            </div>
          </div>
        )}
        
        {!question.passage && (
          <div className="mb-8">
            <p className="text-lg leading-relaxed text-gray-900">
              {question.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SATQuestionPanel;
