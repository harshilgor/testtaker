
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';

interface PerformanceOverviewProps {
  userName: string;
}

interface TopicPerformance {
  topic: string;
  accuracy: number;
  avgTime: number;
  attempts: number;
  category: 'best' | 'needs_work' | 'time_intensive' | 'quick';
}

type MetricType = 'best' | 'needs_work' | 'time_intensive' | 'quick';

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ userName }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('best');

  // Fetch user's question attempts for performance analysis
  const { data: questionAttempts = [] } = useQuery({
    queryKey: ['performance-analysis', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('topic, is_correct, time_spent, difficulty')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error fetching question attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Process data to get performance insights
  const getPerformanceInsights = (): {
    bestTopics: TopicPerformance[];
    needsWork: TopicPerformance[];
    timeIntensive: TopicPerformance[];
    quickTopics: TopicPerformance[];
    overallAvgTime: number;
  } => {
    const topicStats: { [key: string]: { correct: number; total: number; totalTime: number } } = {};

    // Calculate overall average time
    const validTimes = questionAttempts.filter(a => a.time_spent && a.time_spent > 0);
    const overallAvgTime = validTimes.length > 0 
      ? validTimes.reduce((sum, a) => sum + a.time_spent, 0) / validTimes.length 
      : 60;

    questionAttempts.forEach(attempt => {
      const topic = attempt.topic || 'Unknown Topic';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0, totalTime: 0 };
      }
      
      topicStats[topic].total++;
      if (attempt.is_correct) {
        topicStats[topic].correct++;
      }
      if (attempt.time_spent && attempt.time_spent > 0) {
        topicStats[topic].totalTime += attempt.time_spent;
      }
    });

    const topicPerformance: TopicPerformance[] = Object.entries(topicStats)
      .filter(([_, stats]) => stats.total >= 3) // Only include topics with at least 3 attempts
      .map(([topic, stats]) => ({
        topic,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        avgTime: stats.totalTime > 0 ? Math.round(stats.totalTime / stats.total) : overallAvgTime,
        attempts: stats.total,
        category: 'best' as const
      }));

    // Categorize topics
    const bestTopics = topicPerformance
      .filter(t => t.accuracy >= 80)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    const needsWork = topicPerformance
      .filter(t => t.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    const timeIntensive = topicPerformance
      .filter(t => t.avgTime > overallAvgTime * 1.2)
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    const quickTopics = topicPerformance
      .filter(t => t.avgTime < overallAvgTime * 0.8 && t.accuracy >= 70)
      .sort((a, b) => a.avgTime - b.avgTime)
      .slice(0, 5);

    return { bestTopics, needsWork, timeIntensive, quickTopics, overallAvgTime };
  };

  const insights = getPerformanceInsights();

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getMetricData = (metric: MetricType) => {
    switch (metric) {
      case 'best':
        return insights.bestTopics;
      case 'needs_work':
        return insights.needsWork;
      case 'time_intensive':
        return insights.timeIntensive;
      case 'quick':
        return insights.quickTopics;
    }
  };

  const getMetricTitle = (metric: MetricType) => {
    switch (metric) {
      case 'best':
        return 'Best Topics';
      case 'needs_work':
        return 'Needs Work';
      case 'time_intensive':
        return 'Time Intensive';
      case 'quick':
        return 'Quick Topics';
    }
  };

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case 'best':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'needs_work':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'time_intensive':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'quick':
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEmptyMessage = (metric: MetricType) => {
    switch (metric) {
      case 'best':
        return 'Keep practicing to see your best topics';
      case 'needs_work':
        return 'Great job! No weak areas detected';
      case 'time_intensive':
        return "You're managing time well across topics";
      case 'quick':
        return 'Practice more to find your quick topics';
    }
  };

  const renderTopicCard = (topic: TopicPerformance, index: number) => (
    <div key={topic.topic} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold">
          {index + 1}
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">{topic.topic}</div>
          <div className="text-xs text-gray-500">{topic.attempts} attempts</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-gray-900">{topic.accuracy}%</div>
        <div className="text-xs text-gray-500">{formatTime(topic.avgTime)}</div>
      </div>
    </div>
  );

  const currentData = getMetricData(selectedMetric);

  return (
    <Card className="bg-white h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Performance</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            View Advanced Insights
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Metric Selection Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedMetric === 'best' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('best')}
            className="flex items-center gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Best Topics
          </Button>
          <Button
            variant={selectedMetric === 'needs_work' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('needs_work')}
            className="flex items-center gap-1"
          >
            <TrendingDown className="h-3 w-3" />
            Needs Work
          </Button>
          <Button
            variant={selectedMetric === 'time_intensive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('time_intensive')}
            className="flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Time Intensive
          </Button>
          <Button
            variant={selectedMetric === 'quick' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('quick')}
            className="flex items-center gap-1"
          >
            <Zap className="h-3 w-3" />
            Quick Topics
          </Button>
        </div>

        {/* Selected Metric Content */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getMetricIcon(selectedMetric)}
            <h4 className="font-medium text-gray-900 text-sm">{getMetricTitle(selectedMetric)}</h4>
          </div>
          {currentData.length > 0 ? (
            <div className="space-y-3">
              {currentData.map((topic, index) => renderTopicCard(topic, index))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">{getEmptyMessage(selectedMetric)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverview;
