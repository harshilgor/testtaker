import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, Brain, FileText } from 'lucide-react';

const SimpleRecentActivityWidget: React.FC = () => {
  const activities = [
    { type: 'marathon', title: 'Math Marathon', score: '85%', time: '2h ago', icon: Target, color: 'text-orange-500' },
    { type: 'quiz', title: 'Algebra Quiz', score: '92%', time: '4h ago', icon: Brain, color: 'text-purple-500' },
    { type: 'mocktest', title: 'SAT Mock Test', score: '1280 pts', time: '1d ago', icon: FileText, color: 'text-blue-500' }
  ];

  return (
    <Card className="h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className={`h-3 w-3 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {activity.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      {activity.score}
                    </span>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleRecentActivityWidget;
