import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SATGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialGoal?: number;
  onSave: (goal: number) => void;
}

const SATGoalDialog: React.FC<SATGoalDialogProps> = ({
  open,
  onOpenChange,
  initialGoal = 1400,
  onSave
}) => {
  const [targetScore, setTargetScore] = useState(initialGoal);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Validate target score
    setIsValid(targetScore >= 400 && targetScore <= 1600 && targetScore % 10 === 0);
  }, [targetScore]);

  const handleSave = () => {
    if (isValid) {
      onSave(targetScore);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your SAT Score Goal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Target Score Input */}
          <div className="space-y-2">
            <Label htmlFor="target-score">Target SAT Score</Label>
            <div className="relative">
              <Input
                id="target-score"
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value) || 1400)}
                min="400"
                max="1600"
                step="10"
                className="pr-20"
                placeholder="1400"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                / 1600
              </div>
            </div>
            {!isValid && (
              <p className="text-sm text-red-600">
                Score must be between 400-1600 and divisible by 10
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="flex-1"
            >
              Set Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SATGoalDialog;