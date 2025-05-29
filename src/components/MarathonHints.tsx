
import React from 'react';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface MarathonHintsProps {
  hintText: string;
}

const MarathonHints: React.FC<MarathonHintsProps> = ({ hintText }) => {
  if (!hintText) return null;

  return (
    <Card className="mb-6 p-4 bg-yellow-50 border-yellow-200">
      <div className="flex items-start space-x-2">
        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
        <p className="text-yellow-800">{hintText}</p>
      </div>
    </Card>
  );
};

export default MarathonHints;
