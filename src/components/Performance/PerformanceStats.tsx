
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Award, Clock } from 'lucide-react';

interface PerformanceStatsProps {
  marathonStats: {
    totalQuestions: number;
    correctAnswers: number;
    averageAccuracy: number;
    totalSessions: number;
  };
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ marathonStats }) => {
  return (
    <Card className="mb-6 md:mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
          <span>Your Marathon Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </div>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{marathonStats.totalQuestions}</p>
            <p className="text-xs md:text-sm text-gray-600">Questions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{marathonStats.correctAnswers}</p>
            <p className="text-xs md:text-sm text-gray-600">Correct</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{marathonStats.averageAccuracy}%</p>
            <p className="text-xs md:text-sm text-gray-600">Accuracy</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
            </div>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{marathonStats.totalSessions}</p>
            <p className="text-xs md:text-sm text-gray-600">Sessions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceStats;
