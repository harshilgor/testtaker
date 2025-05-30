
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface MarathonEndConfirmationProps {
  isOpen: boolean;
  onContinue: () => void;
  onConfirmEnd: () => void;
}

const MarathonEndConfirmation: React.FC<MarathonEndConfirmationProps> = ({
  isOpen,
  onContinue,
  onConfirmEnd
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-md w-full mx-4 border-slate-200">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-slate-900">End Marathon Session?</h3>
          <p className="text-slate-600 mb-6">
            Are you sure you want to end your marathon session? Your progress will be saved.
          </p>
          <div className="flex space-x-4">
            <Button
              onClick={onContinue}
              variant="outline"
              className="flex-1 border-slate-300"
            >
              Continue
            </Button>
            <Button
              onClick={onConfirmEnd}
              variant="destructive"
              className="flex-1"
            >
              End Session
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarathonEndConfirmation;
