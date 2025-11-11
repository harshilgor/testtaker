
import React, { useMemo } from 'react';
import QuestionImage from '../QuestionImage';

interface QuestionDisplayProps {
  question: string;
  imageUrl?: string;
  hasImage?: boolean;
  imageAltText?: string;
  isMobile?: boolean;
  className?: string;
  showImage?: boolean;
  questionPrompt?: string;
}

const sanitizeMathText = (input?: string): string => {
  if (!input) return '';

  return input
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1/$2)')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\lt/g, '<')
    .replace(/\\gt/g, '>')
    .replace(/\\left|\\right|\\!/g, '')
    .replace(/\^{\s*([^}]+)\s*}/g, '^$1')
    .replace(/_\{\s*([^}]+)\s*}/g, '_$1')
    .replace(/\\sqrt{([^}]+)}/g, '√($1)')
    .replace(/\\pi/g, 'π')
    .replace(/\$/g, '')
    .replace(/[{}]/g, '')
    .trim();
};

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  imageUrl,
  hasImage,
  imageAltText,
  isMobile,
  className = '',
  showImage = true,
  questionPrompt
}) => {
  console.log('QuestionDisplay - questionPrompt:', questionPrompt);

  const formattedQuestion = useMemo(() => sanitizeMathText(question), [question]);
  const formattedPrompt = useMemo(() => sanitizeMathText(questionPrompt), [questionPrompt]);

  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      <h2 className={`${isMobile ? 'text-sm' : 'text-base md:text-lg'} font-medium text-gray-900 mb-2 md:mb-4`}>
        Question
      </h2>
      <div className={`${isMobile ? 'text-sm' : 'text-sm md:text-lg'} leading-relaxed text-gray-900 mb-3 md:mb-4`}>
        {formattedQuestion}
      </div>

      {/* Question Prompt Display */}
      {questionPrompt && (
        <div className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed text-gray-600 p-${isMobile ? '3' : '4'} bg-gray-50 rounded-${isMobile ? 'md' : 'lg'} border-l-4 border-blue-${isMobile ? '400' : '500'} mb-3 md:mb-4`}>
          {formattedPrompt}
        </div>
      )}

      {showImage && hasImage && imageUrl && (
        <div className="mb-4 md:mb-6">
          <img 
            src={imageUrl} 
            alt={imageAltText || 'Question diagram'} 
            className={`${isMobile ? 'max-w-full h-auto max-h-32' : 'max-w-full h-auto'} rounded-lg border border-gray-200`}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
