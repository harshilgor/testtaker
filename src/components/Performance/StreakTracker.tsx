
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { fire } from 'lucide-react';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[]; // Array of 7 booleans for Mon-Sun
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  longestStreak,
  weeklyActivity
}) => {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <fire className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Streaks</h3>
        </div>
        
        <div className="space-y-4">
          {/* Current Streak */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="text-2xl font-bold text-gray-900">{currentStreak} days</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Longest Streak</div>
              <div className="text-xl font-semibold text-gray-700">{longestStreak} days</div>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div>
            <div className="text-sm text-gray-600 mb-2">This Week</div>
            <div className="flex gap-2 justify-center">
              {dayLabels.map((day, index) => (
                <div
                  key={index}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-200 hover:scale-110
                    ${weeklyActivity[index] 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }
                  `}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Message */}
          {currentStreak > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
              <div className="text-sm text-orange-700">
                {currentStreak >= 7 
                  ? `Amazing! You've been consistent for ${currentStreak} days! 🎉`
                  : `Keep it up! ${7 - currentStreak} more days to reach a week streak!`
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
