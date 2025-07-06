
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BottomNavigationProps {
  currentQuestion?: number;
  totalQuestions?: number;
  onPrevious?: () => void;
  onNext: () => void;
  nextLabel?: string;
  showPrevious?: boolean;
  loading?: boolean;
  isMobile?: boolean;
  customContent?: React.ReactNode;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  nextLabel = 'Next',
  showPrevious = true,
  loading = false,
  isMobile = false,
  customContent
}) => {
  return (
    <div className="bg-black text-white px-3 md:px-6 py-2 md:py-4 flex items-center justify-between sticky bottom-0 z-40">
      {currentQuestion && totalQuestions ? (
        <div className={`${isMobile ? 'text-sm' : 'text-sm md:text-base'} text-white font-medium`}>
          Question {currentQuestion} of {totalQuestions}
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          {customContent}
        </div>
      )}
      
      <div className="flex space-x-2 md:space-x-3">
        {showPrevious && onPrevious && currentQuestion && currentQuestion > 1 && (
          <Button
            onClick={onPrevious}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className={`${isMobile ? 'px-2 py-1 text-xs min-h-[32px]' : 'px-4 py-2 min-h-[44px]'} bg-transparent border-white text-white hover:bg-white hover:text-black`}
          >
            <ArrowLeft className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
            {!isMobile && 'Previous'}
          </Button>
        )}
        
        <Button
          onClick={onNext}
          className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'px-3 py-1 text-xs min-h-[32px]' : 'px-6 py-2 min-h-[44px]'}`}
          disabled={loading}
        >
          {nextLabel}
          <ArrowRight className={`${isMobile ? 'h-3 w-3 ml-1' : 'h-4 w-4 ml-2'}`} />
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;
