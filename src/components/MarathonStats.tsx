
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, Zap } from 'lucide-react';

interface MarathonStatsProps {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  averageTime: number;
  timeGoal?: number;
  elapsedTime: number;
}

const MarathonStats: React.FC<MarathonStatsProps> = ({
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  currentStreak,
  averageTime,
  timeGoal,
  elapsedTime
}) => {
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const progressPercent = timeGoal ? Math.min((elapsedTime / (timeGoal * 60 * 1000)) * 100, 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Questions</p>
            <p className="text-xl font-bold">{totalQuestions}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-xl font-bold">{accuracy}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <div>
            <p className="text-sm text-gray-600">Streak</p>
            <p className="text-xl font-bold">{currentStreak}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">Avg Time</p>
            <p className="text-xl font-bold">{averageTime}s</p>
          </div>
        </div>
      </Card>

      {timeGoal && (
        <Card className="p-4 col-span-2 lg:col-span-4">
          <div className="mb-2">
            <div className="flex justify-between text-sm">
              <span>Time Progress</span>
              <span>{Math.floor(elapsedTime / 60000)}m / {timeGoal}m</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </Card>
      )}
    </div>
  );
};

export default MarathonStats;
