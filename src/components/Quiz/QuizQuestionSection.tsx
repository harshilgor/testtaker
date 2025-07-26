
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
  console.log('QuizQuestionSection - isMobile:', isMobile);
  console.log('QuizQuestionSection - question_prompt:', question.question_prompt);
  
  const imageUrl = question.hasImage && question.imageUrl ? question.imageUrl : undefined;

  if (isMobile) {
    return (
      <div className="h-full p-4 overflow-y-auto bg-white">
        <QuestionDisplay
          question={question.question}
          imageUrl={imageUrl}
          hasImage={question.hasImage}
          isMobile={true}
          className="h-full"
          showImage={false}
          questionPrompt={question.question_prompt}
        />
      </div>
    );
  }

  return (
    <div className="w-1/2 h-full p-8 overflow-y-auto border-r border-gray-200">
      <QuestionDisplay
        question={question.question}
        imageUrl={imageUrl}
        hasImage={question.hasImage}
        isMobile={false}
        className="h-full"
        showImage={false}
        questionPrompt={question.question_prompt}
      />
    </div>
  );
};

export default QuizQuestionSection;
