
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowRight } from 'lucide-react';

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
    <div className="bg-black text-white px-3 md:px-6 py-2 md:py-4 flex items-center justify-between sticky bottom-0 z-40">
      <div className="text-sm text-white font-medium">
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
      
      <div className="flex space-x-2 md:space-x-3">
        <Button
          onClick={onEndMarathon}
          variant="outline"
          className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm min-h-[32px] md:min-h-[44px] bg-transparent border-white text-white hover:bg-white hover:text-black"
        >
          Exit Marathon
        </Button>

        {!showFeedback ? (
          <Button
            onClick={onSubmit}
            disabled={!selectedAnswer}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-1 md:py-2 text-xs md:text-sm min-h-[32px] md:min-h-[44px]"
          >
            Submit
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-1 md:py-2 text-xs md:text-sm min-h-[32px] md:min-h-[44px]"
          >
            Next
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MarathonBottomNav;
