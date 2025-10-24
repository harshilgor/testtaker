import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, Brain, FileText } from 'lucide-react';

const SimpleRecentActivityWidget: React.FC = () => {
  const activities = [
    { type: 'marathon', title: 'Math Marathon', score: '91%', time: '1h ago', icon: Target, color: 'text-orange-500' },
    { type: 'quiz', title: 'Geometry Quiz', score: '88%', time: '3h ago', icon: Brain, color: 'text-purple-500' },
    { type: 'mocktest', title: 'SAT Mock Test', score: '1340 pts', time: '2d ago', icon: FileText, color: 'text-blue-500' },
    { type: 'quiz', title: 'Algebra Practice', score: '85%', time: '1d ago', icon: Brain, color: 'text-green-500' },
    { type: 'marathon', title: 'Reading Marathon', score: '92%', time: '2d ago', icon: Target, color: 'text-blue-500' },
    { type: 'quiz', title: 'Grammar Quiz', score: '78%', time: '3d ago', icon: Brain, color: 'text-purple-500' }
  ];

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-6 pt-6">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-6 pb-6">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-gray-700">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleRecentActivityWidget;
