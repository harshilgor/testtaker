import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { BottomNavigationProps } from '@/types/question';

interface UnifiedBottomNavigationProps extends BottomNavigationProps {
  hasAnswered?: boolean;
  isSubmitted?: boolean;
  isLastItem?: boolean;
  userDisplayName?: string;
  children?: React.ReactNode;
  isMobile?: boolean;
  variant?: 'quiz' | 'sat' | 'marathon';
}

const UnifiedBottomNavigation: React.FC<UnifiedBottomNavigationProps> = ({
  currentIndex,
  totalCount,
  onNext,
  onSubmit,
  onComplete,
  onToggleNavigation,
  hasAnswered = false,
  isSubmitted = false,
  isLastItem = false,
  showNavigation = false,
  disabled = false,
  children,
  isMobile = false,
  variant = 'quiz'
}) => {
  const paddingClass = isMobile ? 'px-4 py-3' : 'px-6 py-4';

  const handlePrimaryAction = () => {
    if (!isSubmitted && onSubmit) {
      onSubmit();
    } else if (isLastItem && onComplete) {
      onComplete();
    } else if (!isLastItem && onNext) {
      onNext();
    }
  };

  const getPrimaryButtonText = () => {
    if (!isSubmitted) {
      return 'Submit';
    } else if (isLastItem) {
      return variant === 'sat' ? 'Complete' : 'Submit Quiz';
    } else {
      return variant === 'sat' ? 'Next' : 'Next Question';
    }
  };

  const showPrimaryButton = variant !== 'sat' || isSubmitted;
  const isPrimaryDisabled = disabled || (!isSubmitted && !hasAnswered);

  return (
    <div className={`bg-white border-t border-gray-200 ${paddingClass} z-50`}>
      <div className="flex justify-between items-center">
        {/* Left side - Navigation button */}
        <button
          onClick={onToggleNavigation}
          className={`text-sm font-medium bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between ${
            isMobile ? 'h-11' : ''
          }`}
        >
          <span>Question {currentIndex + 1} of {totalCount}</span>
          {onToggleNavigation && <ChevronUp className="h-4 w-4 ml-2" />}
        </button>
        
        {/* Right side - Primary action button */}
        {showPrimaryButton && (
          <Button
            onClick={handlePrimaryAction}
            disabled={isPrimaryDisabled}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center ${
              isMobile ? 'h-11' : ''
            }`}
          >
            {getPrimaryButtonText()}
            {isSubmitted && !isLastItem && <ChevronUp className="h-4 w-4 ml-2 rotate-90" />}
          </Button>
        )}
      </div>

      {/* Extended content (like navigation grids) */}
      {showNavigation && children}
    </div>
  );
};

export default UnifiedBottomNavigation;