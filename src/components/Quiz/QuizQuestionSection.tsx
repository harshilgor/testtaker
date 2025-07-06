
import React from 'react';
import QuestionDisplay from '../shared/QuestionDisplay';

interface QuizQuestionSectionProps {
  question: any;
  isMobile: boolean;
}

const QuizQuestionSection: React.FC<QuizQuestionSectionProps> = ({
  question,
  isMobile
}) => {
  const imageUrl = question.hasImage && question.imageUrl ? question.imageUrl : undefined;

  return (
    <div className={`h-full p-4 md:p-8 ${isMobile ? 'bg-white' : 'w-1/2 overflow-y-auto border-r border-gray-200'}`}>
      <QuestionDisplay
        question={question.question}
        imageUrl={imageUrl}
        hasImage={question.hasImage}
        isMobile={isMobile}
        className="h-full"
      />
    </div>
  );
};

export default QuizQuestionSection;
