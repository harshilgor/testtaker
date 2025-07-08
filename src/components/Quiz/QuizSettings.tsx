
import React from 'react';
import { Input } from '@/components/ui/input';
import QuizFeedbackPreference from './QuizFeedbackPreference';

interface QuizSettingsProps {
  questionCount: number;
  feedbackPreference: 'immediate' | 'end';
  onQuestionCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFeedbackPreferenceChange: (preference: 'immediate' | 'end') => void;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({
  questionCount,
  feedbackPreference,
  onQuestionCountChange,
  onFeedbackPreferenceChange
}) => {
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <>
      <QuizFeedbackPreference
        feedbackPreference={feedbackPreference}
        onPreferenceChange={onFeedbackPreferenceChange}
      />

      <div className="mb-8">
        <label htmlFor="questionCount" className="block text-lg font-semibold text-gray-900 mb-4">
          Number of Questions
        </label>
        <Input
          id="questionCount"
          type="number"
          min="1"
          max="100"
          value={questionCount}
          onChange={onQuestionCountChange}
          onFocus={handleInputFocus}
          placeholder="Enter number of questions (1-100)"
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-2">Enter any number between 1 and 100</p>
      </div>
    </>
  );
};

export default QuizSettings;
