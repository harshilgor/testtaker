
import React from 'react';
import QuestionImage from '../QuestionImage';

interface QuestionDisplayProps {
  question: string;
  imageUrl?: string;
  hasImage?: boolean;
  isMobile?: boolean;
  className?: string;
  showImage?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  imageUrl,
  hasImage,
  isMobile,
  className = '',
  showImage = true
}) => {
  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      <h2 className={`${isMobile ? 'text-sm' : 'text-base md:text-lg'} font-medium text-gray-900 mb-2 md:mb-4`}>
        Question
      </h2>
      <div className={`${isMobile ? 'text-sm' : 'text-sm md:text-lg'} leading-relaxed text-gray-900 mb-3 md:mb-4`}>
        {question}
      </div>

      {showImage && hasImage && imageUrl && (
        <div className="mb-4 md:mb-6">
          <img 
            src={imageUrl} 
            alt="Question diagram" 
            className={`${isMobile ? 'max-w-full h-auto max-h-32' : 'max-w-full h-auto'} rounded-lg border border-gray-200`}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
