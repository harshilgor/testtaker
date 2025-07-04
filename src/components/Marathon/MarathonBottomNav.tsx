
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface MarathonBottomNavProps {
  currentQuestionNumber: number;
  totalQuestions: number;
  showFeedback: boolean;
  selectedAnswer: string;
  onSubmit: () => void;
  onNext: () => void;
  onEndMarathon: () => void;
}

const MarathonBottomNav: React.FC<MarathonBottomNavProps> = ({
  currentQuestionNumber,
  totalQuestions,
  showFeedback,
  selectedAnswer,
  onSubmit,
  onNext,
  onEndMarathon
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-10">
      <div className="text-sm text-gray-600">
        Student Name
      </div>
      
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded flex items-center space-x-2"
        >
          <span>Question {currentQuestionNumber} of {totalQuestions}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex space-x-3">
        <Button
          onClick={onEndMarathon}
          variant="outline"
          className="px-4 py-2"
        >
          Exit Marathon
        </Button>

        {!showFeedback ? (
          <Button
            onClick={onSubmit}
            disabled={!selectedAnswer}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default MarathonBottomNav;
