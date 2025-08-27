
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface MarathonCompletionStateProps {
  sessionStats: { used: number; total: number };
  onBack: () => void;
  onEndMarathon: () => void;
}

const MarathonCompletionState: React.FC<MarathonCompletionStateProps> = ({
  sessionStats,
  onBack,
  onEndMarathon
}) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Card className="p-8 border-slate-200">
        <CardContent className="text-center">
          <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Congratulations! 🎉
          </h2>
          <p className="text-slate-600 mb-4">
            You've completed all available questions in your current filter settings.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Solved {sessionStats.used} out of {sessionStats.total} total questions
          </p>
          <div className="space-x-4">
            <Button onClick={onBack} variant="outline" className="border-slate-300">
              Back to Settings
            </Button>
            <Button onClick={onEndMarathon} className="bg-blue-600 hover:bg-blue-700">
              View Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarathonCompletionState;
