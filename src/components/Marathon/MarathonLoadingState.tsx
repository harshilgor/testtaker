
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MarathonLoadingStateProps {
  message?: string;
}

const MarathonLoadingState: React.FC<MarathonLoadingStateProps> = ({
  message = "Loading next question..."
}) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Card className="p-8 border-slate-200">
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarathonLoadingState;
