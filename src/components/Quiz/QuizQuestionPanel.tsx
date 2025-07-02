
import React from 'react';

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
