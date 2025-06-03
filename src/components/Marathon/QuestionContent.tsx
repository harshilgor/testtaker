
import React from 'react';
import QuestionImage from '../QuestionImage';

interface QuestionContentProps {
  questionText: string;
  imageUrl?: string | null;
  hasImage?: boolean;
  questionId?: string;
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  questionText,
  imageUrl,
  hasImage,
  questionId
}) => {
  // Generate image URL if hasImage is true but imageUrl is not provided
  const finalImageUrl = imageUrl || (hasImage && questionId ? 
    `https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${questionId}.png` : 
    null);

  return (
    <div className="mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed mb-4">
        {questionText}
      </h2>
      
      {finalImageUrl && (
        <QuestionImage 
          imageUrl={finalImageUrl} 
          alt="Question diagram" 
          className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl"
        />
      )}
    </div>
  );
};

export default QuestionContent;
