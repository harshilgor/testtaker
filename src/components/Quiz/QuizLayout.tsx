
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      {topHeader}

      {/* Timer Component */}
      {timer}

      {/* Main Content Area */}
      <div className="flex-1 pb-20">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Question Content */}
          <ResizablePanel defaultSize={50} minSize={30}>
            {questionPanel}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Answer Options */}
          <ResizablePanel defaultSize={50} minSize={30}>
            {answerPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom Navigation */}
      {bottomNavigation}
    </div>
  );
};

export default QuizLayout;
