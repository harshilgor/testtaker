
import React from 'react';

interface QuizLayoutProps {
  topHeader: React.ReactNode;
  timer: React.ReactNode;
  questionPanel: React.ReactNode;
  answerPanel: React.ReactNode;
  bottomNavigation: React.ReactNode;
}

const QuizLayout: React.FC<QuizLayoutProps> = ({
  topHeader,
  timer,
  questionPanel,
  answerPanel,
  bottomNavigation
}) => {
  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Header */}
      <div className="flex-shrink-0">
        {topHeader}
      </div>

      {/* Timer */}
      <div className="flex-shrink-0">
        {timer}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Question Panel - Left Side */}
        <div className="w-1/2 border-r border-gray-200">
          {questionPanel}
        </div>

        {/* Answer Panel - Right Side */}
        <div className="w-1/2">
          {answerPanel}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        {bottomNavigation}
      </div>
    </div>
  );
};

export default QuizLayout;
