
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { DatabaseQuestion } from '@/services/questionService';

interface QuestionInfoTooltipProps {
  question: DatabaseQuestion;
}

const QuestionInfoTooltip: React.FC<QuestionInfoTooltipProps> = ({ question }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getDomainText = () => {
    if (question.section === 'Math') {
      return question.domain || 'Math';
    }
    return 'Reading and Writing';
  };

  const getTopicText = () => {
    return question.skill || question.domain || 'General';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="p-2 hover:bg-slate-700 rounded-full transition-colors"
        aria-label="Question information"
      >
        <Info className="h-4 w-4 text-white" />
      </button>
      
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg z-50 min-w-48">
          <div className="text-center">
            <div className="font-medium mb-1">{getDomainText()}</div>
            <div className="text-slate-300">{getTopicText()}</div>
          </div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default QuestionInfoTooltip;
