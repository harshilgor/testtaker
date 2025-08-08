import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOptimizedStreak } from '@/hooks/useOptimizedStreak';
import { ChevronDown, ChevronUp, Bug, RefreshCw } from 'lucide-react';

interface StreakDebugPanelProps {
  userName: string;
}

const StreakDebugPanel: React.FC<StreakDebugPanelProps> = ({ userName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { streakData, debugInfo, isLoading, refetch } = useOptimizedStreak(userName);

  if (!debugInfo && !isLoading) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium text-blue-800">
              Streak Debug Info
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3 text-xs">
            {/* Current Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="font-medium text-blue-800 mb-1">Current Streak</div>
                <Badge variant="secondary" className="text-xs">
                  {streakData?.current_streak || 0} days
                </Badge>
              </div>
              <div>
                <div className="font-medium text-blue-800 mb-1">Questions Today</div>
                <Badge 
                  variant={streakData?.questionsToday >= 5 ? "default" : "outline"}
                  className="text-xs"
                >
                  {streakData?.questionsToday || 0} / 5
                </Badge>
              </div>
            </div>

            {/* Activity Sources */}
            {debugInfo && (
              <div>
                <div className="font-medium text-blue-800 mb-2">Today's Activity Sources</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-blue-600">Quizzes</div>
                    <div className="font-mono">{debugInfo.activitySources.quizzes}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600">Marathon</div>
                    <div className="font-mono">{debugInfo.activitySources.marathons}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600">Mock Tests</div>
                    <div className="font-mono">{debugInfo.activitySources.mockTests}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Calculation Details */}
            {debugInfo && (
              <div>
                <div className="font-medium text-blue-800 mb-2">Calculation Details</div>
                <div className="space-y-1 font-mono text-xs bg-white rounded p-2 border">
                  <div>User ID: {debugInfo.userId?.slice(0, 8)}...</div>
                  <div>Date: {debugInfo.todayDate}</div>
                  <div className="flex justify-between">
                    <span>Calculated Streak:</span>
                    <span className="font-bold">{debugInfo.calculatedStreak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DB Streak:</span>
                    <span>{debugInfo.dbStreak}</span>
                  </div>
                  {debugInfo.calculatedStreak !== debugInfo.dbStreak && (
                    <div className="text-orange-600 text-xs mt-1">
                      ⚠️ Streak mismatch detected
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Daily Activity */}
            {streakData?.dailyActivity && (
              <div>
                <div className="font-medium text-blue-800 mb-2">Last 7 Days Activity</div>
                <div className="grid grid-cols-7 gap-1">
                  {streakData.dailyActivity.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-blue-600 mb-1">
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div 
                        className={`w-6 h-6 rounded text-xs flex items-center justify-center font-mono ${
                          day.hasActivity 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {day.questionCount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default StreakDebugPanel;