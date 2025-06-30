
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronDown, CheckCircle } from 'lucide-react';

interface SATBottomNavigationProps {
  userDisplayName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  onShowNavigator: () => void;
  onNextQuestion: () => void;
  onModuleComplete: () => void;
  onPauseTest: () => void;
  onQuitTest: () => void;
}

const SATBottomNavigation: React.FC<SATBottomNavigationProps> = ({
  userDisplayName,
  currentQuestionIndex,
  totalQuestions,
  isLastQuestion,
  onShowNavigator,
  onNextQuestion,
  onModuleComplete,
  onPauseTest,
  onQuitTest
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-10">
      <div className="text-sm text-gray-600">
        {userDisplayName}
      </div>
      
      <div className="flex items-center">
        <Button
          onClick={onShowNavigator}
          variant="ghost"
          className="bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded flex items-center space-x-2"
        >
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex space-x-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="px-4 py-2">
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
              <AlertDialogAction onClick={onPauseTest} className="w-full">
                Pause Test
                <div className="text-xs text-gray-500 mt-1">Your progress will be saved and you can resume later</div>
              </AlertDialogAction>
              <AlertDialogAction 
                onClick={onQuitTest}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Quit Test
                <div className="text-xs text-gray-200 mt-1">All current progress will be lost</div>
              </AlertDialogAction>
              <AlertDialogCancel className="w-full">Continue Test</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLastQuestion ? (
          <Button
            onClick={onModuleComplete}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 px-6 py-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Complete Module</span>
          </Button>
        ) : (
          <Button
            onClick={onNextQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default SATBottomNavigation;
