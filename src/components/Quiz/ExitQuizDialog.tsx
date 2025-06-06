
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ExitQuizDialogProps {
  isOpen: boolean;
  onExit: () => void;
  onContinue: () => void;
}

const ExitQuizDialog: React.FC<ExitQuizDialogProps> = ({
  isOpen,
  onExit,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Exit Quiz?</h3>
        </div>
        <p className="text-gray-600 mb-6">
          If you exit now, you will lose all your progress and answers. Are you sure you want to exit?
        </p>
        <div className="flex space-x-3">
          <Button
            onClick={onExit}
            variant="destructive"
            className="flex-1"
          >
            Exit Quiz
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Continue Exam
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExitQuizDialog;
