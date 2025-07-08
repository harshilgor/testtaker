
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

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
  const { isMobile } = useResponsiveLayout();

  console.log('QuizLayout - isMobile:', isMobile);
  console.log('QuizLayout - Rendering layout for:', isMobile ? 'MOBILE' : 'DESKTOP');

  // Mobile Layout - Vertical Resizable with draggable divider
  if (isMobile) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        {/* Sticky Top Header */}
        <div className="flex-shrink-0">
          {topHeader}
          {timer}
        </div>

        {/* Main Content - Vertical Resizable */}
        <div className="flex-1 flex flex-col min-h-0 pb-20">
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Question Panel - Top */}
            <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
              <div className="h-full bg-white border-b border-gray-200 overflow-hidden">
                {questionPanel}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Answer Panel - Bottom */}
            <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
              <div className="h-full bg-white overflow-hidden">
                {answerPanel}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Sticky Bottom Navigation */}
        <div className="flex-shrink-0">
          {bottomNavigation}
        </div>
      </div>
    );
  }

  // Desktop Layout - Horizontal Resizable
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
