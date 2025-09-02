import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SetGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalType: string;
  currentGoals: { '7days': number; '1month': number; 'alltime': number };
  onSave: (goals: { '7days': number; '1month': number; 'alltime': number }) => void;
  userName: string;
}

const SetGoalDialog: React.FC<SetGoalDialogProps> = ({ open, onOpenChange, goalType, currentGoals, onSave, userName }) => {
  const [targets, setTargets] = useState(currentGoals || { '7days': 0, '1month': 0, 'alltime': 0 });

  useEffect(() => {
    if (currentGoals) {
      setTargets(currentGoals);
    }
  }, [currentGoals]);

  const handleChange = (key: '7days' | '1month' | 'alltime', value: string) => {
    const num = Math.max(0, parseInt(value || '0', 10));
    setTargets((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set your question goals</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm">7 Days</label>
            <Input type="number" min={0} value={targets['7days']} onChange={(e) => handleChange('7days', e.target.value)} />
          </div>
          <div>
            <label className="text-sm">1 Month</label>
            <Input type="number" min={0} value={targets['1month']} onChange={(e) => handleChange('1month', e.target.value)} />
          </div>
          <div>
            <label className="text-sm">All Time</label>
            <Input type="number" min={0} value={targets['alltime']} onChange={(e) => handleChange('alltime', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            onSave(targets);
            onOpenChange(false);
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetGoalDialog;
