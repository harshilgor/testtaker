
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingDown, BookOpen } from 'lucide-react';

interface PerformanceOverviewProps {
  userName: string;
}

interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  difficulty: string;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ userName }) => {
  // Fetch user's question attempts to analyze weakest topics
  const { data: questionAttempts = [] } = useQuery({
    queryKey: ['topic-performance', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('topic, difficulty, is_correct')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error fetching question attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Process data to find weakest topics
  const getWeakestTopics = (): TopicPerformance[] => {
    const topicStats: { [key: string]: { correct: number; total: number; difficulties: string[] } } = {};

    questionAttempts.forEach(attempt => {
      const topic = attempt.topic || 'Unknown Topic';
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0, difficulties: [] };
      }
      
      topicStats[topic].total++;
      if (attempt.is_correct) {
        topicStats[topic].correct++;
      }
      if (attempt.difficulty) {
        topicStats[topic].difficulties.push(attempt.difficulty);
      }
    });

    const topicPerformance: TopicPerformance[] = Object.entries(topicStats)
      .filter(([_, stats]) => stats.total >= 3) // Only include topics with at least 3 attempts
      .map(([topic, stats]) => ({
        topic,
        correct: stats.correct,
        total: stats.total,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        difficulty: stats.difficulties.length > 0 ? 
          stats.difficulties.sort()[Math.floor(stats.difficulties.length / 2)] : 'medium'
      }))
      .sort((a, b) => a.accuracy - b.accuracy) // Sort by accuracy (lowest first)
      .slice(0, 5); // Take top 5 weakest topics

    return topicPerformance;
  };

  const weakestTopics = getWeakestTopics();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Your Weakest Topics</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            View Advanced Trends
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {weakestTopics.length > 0 ? (
          <div className="space-y-4">
            {weakestTopics.map((topic, index) => (
              <div key={topic.topic} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{topic.topic}</div>
                    <div className="text-xs text-gray-500">
                      {topic.correct}/{topic.total} correct
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${getDifficultyColor(topic.difficulty)}`}>
                    {topic.difficulty}
                  </Badge>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{topic.accuracy}%</div>
                    <div className="text-xs text-gray-500">accuracy</div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 text-sm mb-1">Recommendation</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Focus on practicing your weakest topics. Consider using Quiz mode to target specific areas 
                    or Marathon mode with custom difficulty settings to improve these skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No Data Available</h3>
            <p className="text-sm text-gray-500">
              Complete more questions to see your performance analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceOverview;
