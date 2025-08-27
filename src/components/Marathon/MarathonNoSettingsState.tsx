
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MarathonNoSettingsStateProps {
  onBack: () => void;
}

const MarathonNoSettingsState: React.FC<MarathonNoSettingsStateProps> = ({
  onBack
}) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Card className="p-8 border-slate-200">
        <CardContent>
          <p className="text-center text-slate-600">Please configure your marathon settings first.</p>
          <Button onClick={onBack} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
            Back to Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarathonNoSettingsState;
