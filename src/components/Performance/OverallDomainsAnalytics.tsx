import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface OverallDomainsAnalyticsProps {
  subject: 'all' | 'math' | 'reading_writing';
}

interface DomainData {
  domain: string;
  correct: number;
  total: number;
  accuracy: number;
}

const OverallDomainsAnalytics: React.FC<OverallDomainsAnalyticsProps> = ({ subject }) => {
  const { questionAttempts } = useData();

  const analyticsData = useMemo(() => {
    if (!questionAttempts || !Array.isArray(questionAttempts) || questionAttempts.length === 0) {
      return {
        domainData: [],
        overallAccuracy: 0,
        totalQuestions: 0
      };
    }

    // Filter attempts by selected subject
    const filteredAttempts = questionAttempts.filter(attempt => {
      if (subject === 'all') return true;
      
      const testField = attempt.test || attempt.assessment || '';
      if (subject === 'math') {
        return testField.toLowerCase().includes('math');
      } else if (subject === 'reading_writing') {
        return testField.toLowerCase().includes('reading') || testField.toLowerCase().includes('writing');
      }
      return true;
    });

    if (filteredAttempts.length === 0) {
      return {
        domainData: [],
        overallAccuracy: 0,
        totalQuestions: 0
      };
    }

    // Calculate overall accuracy
    const correctAnswers = filteredAttempts.filter(attempt => attempt.is_correct).length;
    const overallAccuracy = (correctAnswers / filteredAttempts.length) * 100;

    // Group by domain
    const domainStats = filteredAttempts.reduce((acc, attempt) => {
      const domain = attempt.domain || attempt.category || 'Unknown';
      
      if (!acc[domain]) {
        acc[domain] = { correct: 0, total: 0 };
      }
      
      acc[domain].total++;
      if (attempt.is_correct) {
        acc[domain].correct++;
      }
      
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const domainData: DomainData[] = Object.entries(domainStats).map(([domain, stats]) => ({
      domain,
      correct: stats.correct,
      total: stats.total,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    }));

    return {
      domainData,
      overallAccuracy,
      totalQuestions: filteredAttempts.length
    };
  }, [questionAttempts, subject]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-600';
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 70) return 'bg-green-400';
    if (accuracy >= 60) return 'bg-yellow-400';
    return 'bg-pink-300';
  };

  const getTextColor = (accuracy: number) => {
    if (accuracy >= 60) return 'text-gray-900';
    return 'text-red-600';
  };

  const getSubjectTitle = () => {
    if (subject === 'math') return 'Math Domains';
    if (subject === 'reading_writing') return 'Reading and Writing Domains';
    return 'Overall Domains';
  };

  const getSubjectAccuracyLabel = () => {
    if (subject === 'math') return 'Your Math Accuracy';
    if (subject === 'reading_writing') return 'Your R&W Accuracy';
    return 'Your Overall Accuracy';
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          {getSubjectTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Accuracy */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            {getSubjectAccuracyLabel()}
          </div>
          <div className="text-2xl font-bold text-red-600">
            Overall: {analyticsData.overallAccuracy.toFixed(0)}%
          </div>
        </div>

        {/* Domain Breakdown */}
        <div className="space-y-4">
          {analyticsData.domainData.map((item) => (
            <div key={item.domain} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{item.domain}</span>
                <span className={`text-sm font-medium ${getTextColor(item.accuracy)}`}>
                  {item.accuracy.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getAccuracyColor(item.accuracy)}`}
                  style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {analyticsData.domainData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No domain data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverallDomainsAnalytics;
