
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CurrentSelectionCardProps {
  availableQuestions: number;
}

const CurrentSelectionCard: React.FC<CurrentSelectionCardProps> = ({
  availableQuestions
}) => {
  return (
    <Card className="p-4 mb-6 bg-green-50 border-green-200">
      <h3 className="font-semibold text-green-900 mb-2">Selected Configuration</h3>
      <div className="flex justify-between items-center">
        <span>Available for this session:</span>
        <Badge className="bg-green-600">
          {availableQuestions} questions
        </Badge>
      </div>
    </Card>
  );
};

export default CurrentSelectionCard;
