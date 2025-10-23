import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Calendar, Trophy } from 'lucide-react';

const SimpleProgressWidget: React.FC = () => {
  const progressData = [
    { label: 'Weekly Goal', current: 32, target: 50, progress: 64, color: 'bg-blue-500' },
    { label: 'Monthly Goal', current: 147, target: 200, progress: 73.5, color: 'bg-green-500' },
    { label: 'SAT Score Goal', current: 1250, target: 1400, progress: 89.3, color: 'bg-purple-500' }
  ];

  return (
    <Card className="h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Progress</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {progressData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm text-gray-600">
                  {item.current} / {item.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                  style={{ width: `${Math.min(item.progress, 100)}%` }}
                ></div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  {item.progress.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleProgressWidget;
