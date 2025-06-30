
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { X, Flag } from 'lucide-react';

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

interface SATQuestionNavigatorModalProps {
  showNavigator: boolean;
  currentSection: 'reading-writing' | 'math';
  currentModule: 1 | 2;
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
  if (!showNavigator) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Section {currentSection === 'reading-writing' ? '1' : '2'}, Module {currentModule}: {currentSection === 'reading-writing' ? 'Reading and Writing' : 'Math'} Questions
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-600"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300"></div>
            <span>Unanswered</span>
          </div>
          <div className="flex items-center space-x-2">
            <Flag className="h-4 w-4 text-red-500" />
            <span>For Review</span>
          </div>
        </div>
        
        <div className="grid grid-cols-10 gap-2 mb-6">
          {questions.map((_, index) => {
            const questionId = questions[index].id;
            const isAnswered = selectedAnswers[questionId] !== undefined;
            const isMarked = markedForReview.has(questionId);
            const isCurrent = currentQuestionIndex === index;
            
            return (
              <button
                key={index}
                onClick={() => onNavigateToQuestion(index)}
                className={`relative w-12 h-12 rounded border-2 text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isAnswered
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {index + 1}
                {isMarked && (
                  <Flag className="h-3 w-3 absolute -top-1 -right-1 text-red-500" />
                )}
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="px-6">
                Exit Practice Test
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exit Practice Test</AlertDialogTitle>
                <AlertDialogDescription>
                  What would you like to do with your current progress?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
                <Button onClick={onPauseTest} className="w-full">
                  Pause Test
                  <div className="text-xs text-gray-500 mt-1">Your progress will be saved and you can resume later</div>
                </Button>
                <Button onClick={onQuitTest} className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Quit Test
                  <div className="text-xs text-gray-200 mt-1">All current progress will be lost</div>
                </Button>
                <AlertDialogCancel className="w-full">Continue Test</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SATQuestionNavigatorModal;
