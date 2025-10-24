import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const TestWidget: React.FC = () => {
  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Test Widget</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        <div className="text-center py-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          </div>
          <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
            42
          </div>
          <div className="text-xs lg:text-sm text-gray-600">
            Test Data
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestWidget;
