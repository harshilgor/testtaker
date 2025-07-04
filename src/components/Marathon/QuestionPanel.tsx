
import React from 'react';
import { DatabaseQuestion } from '@/services/questionService';
import QuestionImage from '../QuestionImage';

interface QuestionPanelProps {
  question: DatabaseQuestion;
  isMathQuestion: boolean;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  isMathQuestion
}) => {
  return (
    <div className="w-1/2 bg-white p-8 overflow-y-auto border-r border-gray-200">
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {isMathQuestion ? 'Question' : 'Passage'}
          </h2>
          
          {/* Question content in gray box for passages */}
          {!isMathQuestion ? (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {question.question_text}
              </p>
            </div>
          ) : (
            <div className="text-lg leading-relaxed text-gray-900 mb-6">
              {question.question_text}
            </div>
          )}

          {/* Question image if exists */}
          {question.image && (
            <QuestionImage 
              imageUrl={`https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${question.id}.png`}
              alt="Question diagram" 
              className="max-w-full mb-6"
            />
          )}
        </div>

        {/* Question section for reading passages */}
        {!isMathQuestion && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Question</h3>
            <p className="text-lg leading-relaxed text-gray-900">
              {/* This would be a separate question field in a real implementation */}
              Based on the passage, what can be inferred about Mrs. Spring Fragrance's situation?
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
