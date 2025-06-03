
import React from 'react';
import QuestionImage from './QuestionImage';

interface QuestionWithImageProps {
  question: {
    id: string;
    question_text?: string;
    question?: string;
    image_url?: string;
    metadata?: any;
  };
  children: React.ReactNode;
}

const QuestionWithImage: React.FC<QuestionWithImageProps> = ({ question, children }) => {
  // Check for image URL in multiple possible locations
  const imageUrl = question.image_url || 
                   (question.metadata && question.metadata.image_url) ||
                   null;

  return (
    <div className="space-y-4">
      {imageUrl && (
        <QuestionImage 
          imageUrl={imageUrl}
          alt={`Graph or diagram for question ${question.id}`}
          className="mb-6"
        />
      )}
      {children}
    </div>
  );
};

export default QuestionWithImage;
