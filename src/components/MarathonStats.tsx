
import React, { useState, useEffect } from 'react';
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
  sessionStartTime: Date;
}

const MarathonStats: React.FC<MarathonStatsProps> = ({
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  currentStreak,
  averageTime,
  timeGoal,
  sessionStartTime
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const elapsedTime = currentTime.getTime() - sessionStartTime.getTime();
  const progressPercent = timeGoal ? Math.min((elapsedTime / (timeGoal * 60 * 1000)) * 100, 100) : 0;
  
  const formatElapsedTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div className="lg:col-span-2">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="text-lg font-bold">{totalQuestions}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-lg font-bold">{accuracy}%</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Streak</p>
                  <p className="text-lg font-bold">{currentStreak}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-purple-600" />
              <div className="text-right">
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-xl font-bold text-purple-600">{formatElapsedTime(elapsedTime)}</p>
              </div>
            </div>
          </div>

          {timeGoal && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Time Progress</span>
                <span>{Math.floor(elapsedTime / 60000)}m / {timeGoal}m</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MarathonStats;
