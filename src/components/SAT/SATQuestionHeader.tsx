
import React from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';

interface SATQuestionHeaderProps {
  section: 'reading-writing' | 'math';
  topic: string;
  isFlagged: boolean;
  onFlag: () => void;
}

const SATQuestionHeader: React.FC<SATQuestionHeaderProps> = ({
  section,
  topic,
  isFlagged,
  onFlag
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          section === 'reading-writing' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {section === 'reading-writing' ? 'Reading & Writing' : 'Math'}
        </span>
        <span className="text-sm text-gray-600">{topic}</span>
      </div>
      
      <Button
        onClick={onFlag}
        variant="outline"
        size="sm"
        className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
      >
        <Flag className={`h-4 w-4 mr-2 ${isFlagged ? 'fill-yellow-400' : ''}`} />
        {isFlagged ? 'Flagged' : 'Flag'}
      </Button>
    </div>
  );
};

export default SATQuestionHeader;
