
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { X, ChevronDown } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface Question {
  id: string;
  content: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
}

interface ResponsiveSATInterfaceProps {
  question: Question;
  currentAnswer: number | undefined;
  markedForReview: boolean;
  eliminatedAnswers: Set<number>;
  eliminateMode: boolean;
  onAnswerSelect: (answerIndex: number) => void;
  onToggleMarkForReview: () => void;
  onEliminateAnswer: (answerIndex: number) => void;
  onToggleEliminateMode: (enabled: boolean) => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious?: () => void;
  onShowNavigator: () => void;
  onExitTest: () => void;
  timeRemaining?: number;
  userDisplayName: string;
}

const ResponsiveSATInterface: React.FC<ResponsiveSATInterfaceProps> = ({
  question,
  currentAnswer,
  markedForReview,
  eliminatedAnswers,
  eliminateMode,
  onAnswerSelect,
  onToggleMarkForReview,
  onEliminateAnswer,
  onToggleEliminateMode,
  currentQuestionIndex,
  totalQuestions,
  onNext,
  onPrevious,
  onShowNavigator,
  onExitTest,
  timeRemaining,
  userDisplayName
}) => {
  const { isMobile } = useResponsiveLayout();

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTopNavigation = () => (
    <div className="bg-slate-800 text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="bg-green-600 rounded px-3 py-1 text-sm font-medium">
          SAT
        </div>
        <span className="text-sm font-medium">
          {question.section === 'math' ? 'Math' : 'Reading and Writing'}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        {timeRemaining && (
          <div className="text-base font-mono">
            {formatTimeRemaining(timeRemaining)}
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="hidden sm:inline">Eliminate</span>
          <Switch
            checked={eliminateMode}
            onCheckedChange={onToggleEliminateMode}
            className="data-[state=checked]:bg-blue-600 scale-75 md:scale-100"
          />
        </div>
        
        <Button
          onClick={onExitTest}
          variant="outline"
          size="sm"
          className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800 text-xs px-3 py-1 min-h-[44px]"
        >
          Exit
        </Button>
      </div>
    </div>
  );

  const renderQuestionSection = () => (
    <div className={`${isMobile ? 'flex-1' : 'w-1/2'} overflow-y-auto p-4 md:p-8 ${isMobile ? '' : 'border-r border-gray-200'}`}>
      <div className="max-w-3xl mx-auto">
        {question.passage && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Passage</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {question.passage}
              </p>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {question.passage ? 'Question' : 'Question'}
          </h3>
          <p className="text-lg leading-relaxed text-gray-900">
            {question.content}
          </p>
        </div>
      </div>
    </div>
  );

  const renderAnswerSection = () => (
    <div className={`${isMobile ? 'bg-gray-50 border-t border-gray-200' : 'w-1/2 bg-white'} ${isMobile ? 'sticky bottom-16' : ''} p-4 md:p-6 ${isMobile ? 'max-h-[50vh] overflow-y-auto' : 'overflow-y-auto'}`}>
      <div className="max-w-2xl mx-auto">
        {!question.passage && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Question</h3>
            <p className="text-lg leading-relaxed text-gray-900">
              {question.content}
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="mark-review"
              checked={markedForReview}
              onCheckedChange={onToggleMarkForReview}
            />
            <label htmlFor="mark-review" className="text-sm text-gray-600 cursor-pointer">
              Mark for Review
            </label>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Choose the best answer.
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isEliminated = eliminatedAnswers.has(index);
              const optionLabel = String.fromCharCode(65 + index);
              const isSelected = currentAnswer === index;
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 min-h-[44px] ${
                    isEliminated ? 'opacity-50 bg-gray-100' : 'bg-white'
                  } ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="radio"
                      name="answer"
                      checked={isSelected}
                      onChange={() => onAnswerSelect(index)}
                      disabled={isEliminated}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <label className="cursor-pointer flex-1 flex items-center">
                      <span className="font-medium text-gray-700 mr-3 min-w-[20px]">
                        {optionLabel}
                      </span>
                      <span className={`${isEliminated ? 'line-through text-gray-400' : 'text-gray-900'} relative`}>
                        {option}
                        {isEliminated && (
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-0.5 bg-gray-400"></div>
                          </div>
                        )}
                      </span>
                    </label>
                  </div>
                  
                  {eliminateMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEliminateAnswer(index)}
                      className={`p-1 h-8 w-8 min-h-[44px] min-w-[44px] ${
                        isEliminated 
                          ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBottomNavigation = () => (
    <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky bottom-0 z-40">
      <div className="text-sm text-gray-600">
        {userDisplayName}
      </div>
      
      <div className="flex items-center">
        <Button
          onClick={onShowNavigator}
          variant="ghost"
          className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded flex items-center space-x-2 min-h-[44px]"
        >
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex space-x-3">
        {onPrevious && currentQuestionIndex > 0 && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="px-4 py-2 min-h-[44px]"
          >
            Previous
          </Button>
        )}
        
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded min-h-[44px]"
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {renderTopNavigation()}
        <div className="flex-1 flex flex-col pb-16">
          {renderQuestionSection()}
          {renderAnswerSection()}
        </div>
        {renderBottomNavigation()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {renderTopNavigation()}
      <div className="flex-1 flex">
        {renderQuestionSection()}
        {renderAnswerSection()}
      </div>
      {renderBottomNavigation()}
    </div>
  );
};

export default ResponsiveSATInterface;
