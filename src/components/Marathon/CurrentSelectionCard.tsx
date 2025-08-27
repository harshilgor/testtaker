
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CurrentSelectionCardProps {
  availableQuestions: number;
}

const CurrentSelectionCard: React.FC<CurrentSelectionCardProps> = ({
  availableQuestions
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center p-6 bg-white/60 rounded-xl border border-green-200">
        <div className="text-3xl font-bold text-green-700 mb-2">
          {availableQuestions}
        </div>
        <div className="text-sm text-green-600 font-medium">
          questions available
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-green-700">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Ready for this session</span>
      </div>
    </div>
  );
};

export default CurrentSelectionCard;
