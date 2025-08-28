
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
  const { data: questionAttempts = [], isLoading } = useQuery({
    queryKey: ['performance-analysis', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      console.log('Fetching question attempts for performance analysis...');

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('topic, is_correct, time_spent, difficulty, subject, question_id')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error fetching question attempts:', error);
        return [];
      }

      console.log(`Found ${data?.length || 0} question attempts for performance analysis`);
      
      // Get unique question IDs to fetch skill information
      const questionIds = [...new Set(data?.map(attempt => attempt.question_id).filter(Boolean))].map(Number).filter(id => !isNaN(id));
      
      if (questionIds.length > 0) {
        console.log('Fetching skill data for', questionIds.length, 'questions');
        
        // Fetch skill information for these questions
        const { data: questionDetails, error: skillError } = await supabase
          .from('question_bank')
          .select('id, skill, domain, test, assessment')
          .in('id', questionIds);

        if (skillError) {
          console.error('Error fetching skill data:', skillError);
        } else {
          console.log('Found skill data for', questionDetails?.length || 0, 'questions');
          
          // Create a map of question ID to skill info
          const skillMap = new Map();
          questionDetails?.forEach(q => {
            skillMap.set(q.id, { skill: q.skill, domain: q.domain, test: q.test, assessment: q.assessment });
          });
          
          // Enhance question attempts with skill information
          const enhancedData = data?.map(attempt => {
            const skillInfo = skillMap.get(attempt.question_id);
            return {
              ...attempt,
              skill: skillInfo?.skill || attempt.topic || attempt.subject || 'General Practice',
              domain: skillInfo?.domain || 'General',
              skillTopic: skillInfo?.skill || attempt.topic || attempt.subject || 'General Practice'
            };
          }) || [];
          
          console.log('Enhanced data with skills:', enhancedData);
          return enhancedData;
        }
      }
      
      // Fallback if no question IDs or skill lookup fails
      return data?.map(attempt => ({
        ...attempt,
        skill: attempt.topic || attempt.subject || 'General Practice',
        domain: 'General',
        skillTopic: attempt.topic || attempt.subject || 'General Practice'
      })) || [];
    },
    enabled: !!userName,
  });

  // Also fetch from marathon sessions for additional data
  const { data: marathonSessions = [] } = useQuery({
    queryKey: ['marathon-sessions-performance', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching marathon sessions:', error);
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
    console.log('Processing performance insights with', questionAttempts.length, 'attempts');
    
    // Merge DB attempts with local quiz results for robustness
    const combinedAttempts: any[] = [...questionAttempts];
    try {
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const localQuizzes = (stored || []).filter((r: any) => r.userName === userName);
      localQuizzes.forEach((r: any) => {
        (r.questions || []).forEach((q: any, i: number) => {
          const isCorrect = r.answers?.[i] === q?.correctAnswer;
          combinedAttempts.push({
            topic: q?.topic || q?.skill || 'General Practice',
            subject: r.subject || 'Mixed',
            is_correct: !!isCorrect,
            time_spent: q?.timeSpent || 0,
            difficulty: q?.difficulty || 'medium',
            question_id: q?.id ? Number(q.id) : undefined,
            skill: q?.topic || q?.skill || 'General Practice'
          });
        });
      });
    } catch (e) {
      console.warn('Failed to merge local quiz attempts', e);
    }

    const topicStats: { [key: string]: { correct: number; total: number; totalTime: number } } = {};

    // Calculate overall average time from attempts with valid time data
    const validTimes = combinedAttempts.filter((a: any) => a.time_spent && a.time_spent > 0);
    const overallAvgTime = validTimes.length > 0 
      ? validTimes.reduce((sum: number, a: any) => sum + a.time_spent, 0) / validTimes.length 
      : 45; // Default 45 seconds

    // Process attempts - prioritize skill over topic/subject for better categorization
    combinedAttempts.forEach((attempt: any) => {
      const skillName = (attempt as any).skill || attempt.topic || attempt.subject || 'General Practice';
      if (!topicStats[skillName]) {
        topicStats[skillName] = { correct: 0, total: 0, totalTime: 0 };
      }
      
      topicStats[skillName].total++;
      if (attempt.is_correct) {
        topicStats[skillName].correct++;
      }
      if (attempt.time_spent && attempt.time_spent > 0) {
        topicStats[skillName].totalTime += attempt.time_spent;
      } else {
        // Use estimated time based on difficulty if no time recorded
        const estimatedTime = attempt.difficulty === 'hard' ? 60 : 
                             attempt.difficulty === 'easy' ? 30 : 45;
        topicStats[skillName].totalTime += estimatedTime;
      }
    });

    console.log('Topic stats:', topicStats);

    const topicPerformance: TopicPerformance[] = Object.entries(topicStats)
      .filter(([_, stats]) => stats.total >= 1) // Include topics with at least 1 attempt
      .map(([topic, stats]) => ({
        topic,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        avgTime: stats.totalTime > 0 ? Math.round(stats.totalTime / stats.total) : overallAvgTime,
        attempts: stats.total,
        category: 'best' as const
      }));

    console.log('Topic performance:', topicPerformance);

  // Categorize topics - showing exactly top 5 as requested
  const bestTopics = topicPerformance
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  const needsWork = topicPerformance
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const timeIntensive = topicPerformance
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 5);

  const quickTopics = topicPerformance
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

  const currentData = getMetricData(selectedMetric);

  const getEmptyMessage = (metric: MetricType) => {
    if (isLoading) return 'Loading your performance data...';
    
    const combinedAttempts = questionAttempts.length;
    console.log('Empty message check - attempts:', combinedAttempts, 'current data:', currentData.length);
    
    // Also check localStorage for backwards compatibility
    let hasLocalData = false;
    try {
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const localQuizzes = (stored || []).filter((r: any) => r.userName === userName);
      hasLocalData = localQuizzes.some((r: any) => r.questions && r.questions.length > 0);
    } catch (e) {
      console.warn('Failed to check local quiz data', e);
    }
    
    const hasAnyData = combinedAttempts > 0 || hasLocalData;
    
    switch (metric) {
      case 'best':
        return !hasAnyData ? 'Start practicing to see your best topics!' : 'Keep practicing to improve your performance!';
      case 'needs_work':
        return !hasAnyData ? 'Start practicing to identify areas for improvement!' : 'Great job! All topics are performing well!';
      case 'time_intensive':
        return !hasAnyData ? 'Start practicing to see time analysis!' : "You're managing time well across all topics!";
      case 'quick':
        return !hasAnyData ? 'Start practicing to find your quick topics!' : 'Practice more to identify your fastest topics!';
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
          <div className="text-xs text-gray-500">{topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-gray-900">{topic.accuracy}%</div>
        <div className="text-xs text-gray-500">{formatTime(topic.avgTime)}</div>
      </div>
    </div>
  );


  if (isLoading) {
    return (
      <Card className="bg-white h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Loading your performance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Performance</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700 text-xs"
            onClick={() => window.location.href = '/advanced-insights'}
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
