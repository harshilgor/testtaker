
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
        className="w-full h-auto rounded-lg border shadow-sm"
        style={{ maxHeight: '300px', maxWidth: '100%' }}
        onError={(e) => {
          console.log('Image failed to load:', imageUrl);
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
};

export default QuestionImage;
