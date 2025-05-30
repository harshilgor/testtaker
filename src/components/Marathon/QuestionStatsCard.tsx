
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuestionStats {
  math: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  english: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  total: number;
}

interface UserProgress {
  questionsAttempted: number;
  totalAvailable: number;
}

interface QuestionStatsCardProps {
  questionStats: QuestionStats;
  userProgress: UserProgress;
}

const QuestionStatsCard: React.FC<QuestionStatsCardProps> = ({
  questionStats,
  userProgress
}) => {
  return (
    <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-3">Available Questions</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">Math Questions:</p>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Easy:</span>
              <Badge variant="outline">{questionStats.math.easy}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Medium:</span>
              <Badge variant="outline">{questionStats.math.medium}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Hard:</span>
              <Badge variant="outline">{questionStats.math.hard}</Badge>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <Badge>{questionStats.math.total}</Badge>
            </div>
          </div>
        </div>
        <div>
          <p className="font-medium">English Questions:</p>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Easy:</span>
              <Badge variant="outline">{questionStats.english.easy}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Medium:</span>
              <Badge variant="outline">{questionStats.english.medium}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Hard:</span>
              <Badge variant="outline">{questionStats.english.hard}</Badge>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <Badge>{questionStats.english.total}</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-blue-200">
        <div className="flex justify-between items-center">
          <span className="font-medium">Your Progress:</span>
          <Badge variant="secondary">
            {userProgress.questionsAttempted} questions attempted
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default QuestionStatsCard;
