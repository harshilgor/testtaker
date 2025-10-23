import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Clock, BookOpen } from 'lucide-react';

const SimpleStatsWidget: React.FC = () => {
  const stats = [
    { label: 'Questions Solved', value: '1,247', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Accuracy', value: '78.5%', icon: Target, color: 'text-green-600' },
    { label: 'Study Time', value: '24.5h', icon: Clock, color: 'text-purple-600' },
    { label: 'Streak', value: '12 days', icon: TrendingUp, color: 'text-orange-600' }
  ];

  return (
    <Card className="h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Your Stats</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleStatsWidget;
