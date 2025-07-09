
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
}

interface SATQuestionNavigatorModalProps {
  showNavigator: boolean;
  currentSection: 'reading-writing' | 'math';
  currentModule: number;
  currentQuestionIndex: number;
  questions: Question[];
  selectedAnswers: { [key: string]: number };
  markedForReview: Set<string>;
  onClose: () => void;
  onNavigateToQuestion: (index: number) => void;
  onPauseTest: () => void;
  onQuitTest: () => void;
}

const SATQuestionNavigatorModal: React.FC<SATQuestionNavigatorModalProps> = ({
  showNavigator,
  currentSection,
  currentModule,
  currentQuestionIndex,
  questions,
  selectedAnswers,
  markedForReview,
  onClose,
  onNavigateToQuestion,
  onPauseTest,
  onQuitTest
}) => {
  const sectionTitle = currentSection === 'reading-writing' ? 'Reading and Writing' : 'Math';

  return (
    <Dialog open={showNavigator} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Section {currentModule === 1 ? '1' : '2'}, Module {currentModule}: {sectionTitle} Questions
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm text-gray-600">Current</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-sm">
                2
              </div>
              <span className="text-sm text-gray-600">Unanswered</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 border border-green-300 rounded flex items-center justify-center text-sm">
                3
              </div>
              <span className="text-sm text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 border-2 border-yellow-400 rounded flex items-center justify-center text-sm">
                4
              </div>
              <span className="text-sm text-gray-600">For Review</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-3">
            {questions.map((question, index) => {
              const isAnswered = selectedAnswers[question.id] !== undefined;
              const isFlagged = markedForReview.has(question.id);
              const isCurrent = index === currentQuestionIndex;

              let buttonClass = "w-10 h-10 text-sm font-medium rounded border-2 transition-colors ";
              
              if (isCurrent) {
                buttonClass += "bg-blue-600 text-white border-blue-600";
              } else if (isFlagged) {
                buttonClass += "bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200";
              } else if (isAnswered) {
                buttonClass += "bg-green-100 border-green-300 text-green-800 hover:bg-green-200";
              } else {
                buttonClass += "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
              }

              return (
                <button
                  key={question.id}
                  onClick={() => {
                    onNavigateToQuestion(index);
                    onClose();
                  }}
                  className={buttonClass}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onPauseTest}
                variant="outline"
                className="w-full"
              >
                Pause Test
              </Button>
              <Button
                onClick={onQuitTest}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                Exit Practice Test
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SATQuestionNavigatorModal;
