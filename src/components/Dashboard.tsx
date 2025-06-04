
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calculator, Trophy, BarChart3, Zap, Settings, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getUserTotalPoints } from '@/services/pointsService';

interface DashboardProps {
  userName: string;
  onQuizClick: () => void;
  onMockTestClick: () => void;
  onMarathonClick: () => void;
  onPerformanceClick: () => void;
  onLeaderboardClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  onQuizClick,
  onMockTestClick,
  onMarathonClick,
  onPerformanceClick,
  onLeaderboardClick
}) => {
  const [userPoints, setUserPoints] = useState(0);

  // Fetch user's total points
  const { data: totalPoints = 0 } = useQuery({
    queryKey: ['user-total-points'],
    queryFn: () => getUserTotalPoints(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    setUserPoints(totalPoints);
  }, [totalPoints]);

  const features = [
    {
      title: 'Create Quiz',
      description: 'Practice with targeted questions on specific topics',
      icon: BookOpen,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: onQuizClick
    },
    {
      title: 'Mock Test',
      description: 'Take full-length practice tests',
      icon: Calculator,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: onMockTestClick
    },
    {
      title: 'Marathon Mode',
      description: 'Unlimited practice with adaptive learning',
      icon: Zap,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: onMarathonClick
    },
    {
      title: 'Performance',
      description: 'View your progress and analytics',
      icon: BarChart3,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: onPerformanceClick
    },
    {
      title: 'Leaderboard',
      description: 'See how you rank against other students',
      icon: Trophy,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      onClick: onLeaderboardClick
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-lg text-gray-600">Ready to boost your SAT score today?</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{userPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Today's Goal</p>
                  <p className="text-2xl font-bold">50 Questions</p>
                </div>
                <Settings className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Current Streak</p>
                  <p className="text-2xl font-bold">7 Days</p>
                </div>
                <Zap className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Points</p>
                  <p className="text-2xl font-bold">{userPoints}</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={feature.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${feature.color} ${feature.hoverColor} p-3 rounded-lg transition-colors group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">🎯 Your SAT Success Journey</h2>
            <p className="text-lg opacity-90 mb-6">
              Every question you practice gets you closer to your dream score. 
              Stay consistent, stay motivated!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">1500+</div>
                <div className="text-sm opacity-75">Target Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold">Daily</div>
                <div className="text-sm opacity-75">Practice</div>
              </div>
              <div>
                <div className="text-3xl font-bold">Success</div>
                <div className="text-sm opacity-75">Guaranteed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
