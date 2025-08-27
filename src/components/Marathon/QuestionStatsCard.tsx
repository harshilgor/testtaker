
import React from 'react';
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Math Questions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h4 className="font-semibold text-gray-900">Math Questions</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Easy</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {questionStats.math.easy}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Medium</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {questionStats.math.medium}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Hard</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {questionStats.math.hard}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg border-2 border-blue-200">
              <span className="text-sm font-semibold text-blue-900">Total</span>
              <Badge className="bg-blue-600 text-white">
                {questionStats.math.total}
              </Badge>
            </div>
          </div>
        </div>

        {/* English Questions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <h4 className="font-semibold text-gray-900">English Questions</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Easy</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {questionStats.english.easy}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Medium</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {questionStats.english.medium}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Hard</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {questionStats.english.hard}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-100 rounded-lg border-2 border-purple-200">
              <span className="text-sm font-semibold text-purple-900">Total</span>
              <Badge className="bg-purple-600 text-white">
                {questionStats.english.total}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-gray-900">Your Progress</span>
          </div>
          <Badge variant="outline" className="bg-white">
            {userProgress.questionsAttempted} questions attempted
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default QuestionStatsCard;
