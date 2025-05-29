
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface MockTestResult {
  score: number;
  questions: any[];
  answers: (number | null)[];
  date: string;
  userName: string;
}

interface MockTestHistorySectionProps {
  mockTestResults: MockTestResult[];
  onViewResult: (result: MockTestResult) => void;
}

const MockTestHistorySection: React.FC<MockTestHistorySectionProps> = ({
  mockTestResults,
  onViewResult
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Test History</CardTitle>
      </CardHeader>
      <CardContent>
        {mockTestResults.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No mock tests completed yet</p>
        ) : (
          <div className="space-y-4">
            {mockTestResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium">SAT Mock Test</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(result.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold ${
                    result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {result.score}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewResult(result)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MockTestHistorySection;
