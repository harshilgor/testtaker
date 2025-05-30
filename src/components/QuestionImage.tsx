
import React from 'react';

interface QuestionImageProps {
  imageUrl: string;
  alt?: string;
  className?: string;
}

const QuestionImage: React.FC<QuestionImageProps> = ({
  imageUrl,
  alt = "Question image",
  className = ""
}) => {
  return (
    <div className={`my-4 ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="max-w-full h-auto rounded-lg border shadow-sm"
        style={{ maxHeight: '400px' }}
      />
    </div>
  );
};

export default QuestionImage;
