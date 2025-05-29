
import React from 'react';
import { Card } from '@/components/ui/card';
import { Question } from '../data/questions';

interface MarathonExplanationProps {
  question: Question;
  showExplanation: boolean;
}

const MarathonExplanation: React.FC<MarathonExplanationProps> = ({
  question,
  showExplanation
}) => {
  if (!showExplanation) return null;

  return (
    <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-2">Explanation:</h3>
      <p className="text-blue-800">{question.explanation}</p>
    </Card>
  );
};

export default MarathonExplanation;
