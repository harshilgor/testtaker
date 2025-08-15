
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ userName }) => {
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
      .slice(0, 3);

    const needsWork = topicPerformance
      .filter(t => t.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    const timeIntensive = topicPerformance
      .filter(t => t.avgTime > overallAvgTime * 1.2)
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 3);

    const quickTopics = topicPerformance
      .filter(t => t.avgTime < overallAvgTime * 0.8 && t.accuracy >= 70)
      .sort((a, b) => a.avgTime - b.avgTime)
      .slice(0, 3);

    return { bestTopics, needsWork, timeIntensive, quickTopics, overallAvgTime };
  };

  const insights = getPerformanceInsights();

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const renderTopicCard = (topic: TopicPerformance, index: number) => (
    <div key={topic.topic} className="flex items-center justify-between p-2 rounded border border-gray-100">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
          {index + 1}
        </div>
        <div>
          <div className="font-medium text-gray-900 text-xs">{topic.topic}</div>
          <div className="text-xs text-gray-500">{topic.attempts} attempts</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-gray-900">{topic.accuracy}%</div>
        <div className="text-xs text-gray-500">{formatTime(topic.avgTime)}</div>
      </div>
    </div>
  );

  const renderSection = (
    title: string, 
    topics: TopicPerformance[], 
    icon: React.ReactNode, 
    emptyMessage: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
      </div>
      {topics.length > 0 ? (
        <div className="space-y-2">
          {topics.map((topic, index) => renderTopicCard(topic, index))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );

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
        <div className="grid grid-cols-2 gap-4">
          {renderSection(
            "Best Topics",
            insights.bestTopics,
            <TrendingUp className="h-4 w-4 text-green-500" />,
            "Keep practicing to see your best topics"
          )}
          
          {renderSection(
            "Needs Work",
            insights.needsWork,
            <TrendingDown className="h-4 w-4 text-red-500" />,
            "Great job! No weak areas detected"
          )}
          
          {renderSection(
            "Time Intensive",
            insights.timeIntensive,
            <Clock className="h-4 w-4 text-orange-500" />,
            "You're managing time well across topics"
          )}
          
          {renderSection(
            "Quick Topics",
            insights.quickTopics,
            <Zap className="h-4 w-4 text-blue-500" />,
            "Practice more to find your quick topics"
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverview;
