import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface OverallDifficultyAnalyticsProps {
  subject: 'all' | 'math' | 'reading_writing';
}

interface DifficultyData {
  difficulty: string;
  correct: number;
  total: number;
  accuracy: number;
}

const OverallDifficultyAnalytics: React.FC<OverallDifficultyAnalyticsProps> = ({ subject }) => {
  const { questionAttempts } = useData();

  const analyticsData = useMemo(() => {
    if (!questionAttempts || !Array.isArray(questionAttempts) || questionAttempts.length === 0) {
      return {
        difficultyData: [],
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
        difficultyData: [],
        overallAccuracy: 0,
        totalQuestions: 0
      };
    }

    // Calculate overall accuracy
    const correctAnswers = filteredAttempts.filter(attempt => attempt.is_correct).length;
    const overallAccuracy = (correctAnswers / filteredAttempts.length) * 100;

    // Group by difficulty
    const difficultyStats = filteredAttempts.reduce((acc, attempt) => {
      const difficulty = attempt.difficulty || 'Medium';
      
      if (!acc[difficulty]) {
        acc[difficulty] = { correct: 0, total: 0 };
      }
      
      acc[difficulty].total++;
      if (attempt.is_correct) {
        acc[difficulty].correct++;
      }
      
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const difficultyData: DifficultyData[] = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty,
      correct: stats.correct,
      total: stats.total,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    }));

    return {
      difficultyData,
      overallAccuracy,
      totalQuestions: filteredAttempts.length
    };
  }, [questionAttempts, subject]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-600';
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 70) return 'bg-yellow-400';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-pink-300';
  };

  const getTextColor = (accuracy: number) => {
    if (accuracy >= 60) return 'text-gray-900';
    return 'text-red-600';
  };

  const getSubjectTitle = () => {
    if (subject === 'math') return 'Math Difficulty';
    if (subject === 'reading_writing') return 'Reading and Writing Difficulty';
    return 'Overall Difficulty';
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
        {/* Legend */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-pink-300 rounded"></div>
              <span>0%-59%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>60%-69%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>70%-79%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>80%-89%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>90%-100%</span>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {analyticsData.overallAccuracy.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">
            {analyticsData.totalQuestions} questions attempted
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="space-y-4">
          {analyticsData.difficultyData.map((item) => (
            <div key={item.difficulty} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 capitalize">{item.difficulty}</span>
                <span className="text-sm text-gray-600">
                  {item.correct} Correct • {item.total} Total
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getAccuracyColor(item.accuracy)}`}
                  style={{ width: `${Math.min(item.accuracy, 100)}%` }}
                ></div>
              </div>
              <div className={`text-sm font-medium ${getTextColor(item.accuracy)}`}>
                {item.accuracy.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        {analyticsData.difficultyData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No difficulty data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverallDifficultyAnalytics;
