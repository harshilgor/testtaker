
import React from 'react';

interface QuizFeedbackPreferenceProps {
  feedbackPreference: 'immediate' | 'end';
  onPreferenceChange: (preference: 'immediate' | 'end') => void;
}

const QuizFeedbackPreference: React.FC<QuizFeedbackPreferenceProps> = ({
  feedbackPreference,
  onPreferenceChange
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="font-semibold text-blue-800 mb-4 text-lg">Choose Your Feedback Preference</h3>
      <div className="space-y-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="feedback"
            value="immediate"
            checked={feedbackPreference === 'immediate'}
            onChange={(e) => onPreferenceChange(e.target.value as 'immediate' | 'end')}
            className="mr-3 w-4 h-4"
          />
          <span className="text-blue-700">Show correct answer and explanation after each question</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="feedback"
            value="end"
            checked={feedbackPreference === 'end'}
            onChange={(e) => onPreferenceChange(e.target.value as 'immediate' | 'end')}
            className="mr-3 w-4 h-4"
          />
          <span className="text-blue-700">Show all answers and explanations after completing the quiz</span>
        </label>
      </div>
    </div>
  );
};

export default QuizFeedbackPreference;
