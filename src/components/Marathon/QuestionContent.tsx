
import React from 'react';
import QuestionImage from '../QuestionImage';

interface QuestionContentProps {
  questionText: string;
  imageUrl?: string | null;
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  questionText,
  imageUrl
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 leading-relaxed mb-4">
        {questionText}
      </h2>
      
      {imageUrl && (
        <QuestionImage imageUrl={imageUrl} alt="Question diagram" />
      )}
    </div>
  );
};

export default QuestionContent;
