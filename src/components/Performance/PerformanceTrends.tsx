import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceTrendsProps {
  userName: string;
}

const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ userName }) => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Math' | 'Verbal'>('All');

  // Fetch quiz results and marathon sessions for accuracy trends
  const { data: quizResults = [] } = useQuery({
    queryKey: ['quiz-results-trends', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching quiz results:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: marathonSessions = [] } = useQuery({
    queryKey: ['marathon-sessions-trends', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching marathon sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Generate accuracy trend data for last 14 days
  const accuracyTrendData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split('T')[0];
    });

    return last14Days.map(date => {
      const dayQuizzes = quizResults.filter(quiz => 
        quiz.created_at.split('T')[0] === date &&
        (selectedFilter === 'All' || 
         (selectedFilter === 'Math' && quiz.subject === 'math') ||
         (selectedFilter === 'Verbal' && quiz.subject === 'english'))
      );

      const dayMarathons = marathonSessions.filter(marathon => 
        marathon.created_at.split('T')[0] === date &&
        (selectedFilter === 'All' || 
         (selectedFilter === 'Math' && marathon.subjects?.includes('math')) ||
         (selectedFilter === 'Verbal' && marathon.subjects?.includes('english')))
      );

      const totalCorrect = dayQuizzes.reduce((sum, quiz) => sum + (quiz.correct_answers || 0), 0) +
                          dayMarathons.reduce((sum, marathon) => sum + (marathon.correct_answers || 0), 0);
      
      const totalQuestions = dayQuizzes.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0) +
                            dayMarathons.reduce((sum, marathon) => sum + (marathon.total_questions || 0), 0);

      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy
      };
    });
  }, [quizResults, marathonSessions, selectedFilter]);

  // Calculate topic proficiency based on performance data
  const topicProficiencyData = useMemo(() => {
    // Mock calculation - in real app would analyze performance by specific topics
    const mathQuizzes = quizResults.filter(q => q.subject === 'math');
    const englishQuizzes = quizResults.filter(q => q.subject === 'english');
    const mathMarathons = marathonSessions.filter(m => m.subjects?.includes('math'));
    const englishMarathons = marathonSessions.filter(m => m.subjects?.includes('english'));

    const calculateAccuracy = (correct: number, total: number) => 
      total > 0 ? Math.round((correct / total) * 100) : 50;

    const mathCorrect = mathQuizzes.reduce((sum, q) => sum + (q.correct_answers || 0), 0) +
                       mathMarathons.reduce((sum, m) => sum + (m.correct_answers || 0), 0);
    const mathTotal = mathQuizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0) +
                     mathMarathons.reduce((sum, m) => sum + (m.total_questions || 0), 0);

    const englishCorrect = englishQuizzes.reduce((sum, q) => sum + (q.correct_answers || 0), 0) +
                          englishMarathons.reduce((sum, m) => sum + (m.correct_answers || 0), 0);
    const englishTotal = englishQuizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0) +
                        englishMarathons.reduce((sum, m) => sum + (m.total_questions || 0), 0);

    const mathAccuracy = calculateAccuracy(mathCorrect, mathTotal);
    const englishAccuracy = calculateAccuracy(englishCorrect, englishTotal);

    return [
      { subject: 'Reading', value: Math.min(100, englishAccuracy + 5) },
      { subject: 'Writing', value: Math.max(30, englishAccuracy - 8) },
      { subject: 'Grammar', value: Math.min(100, englishAccuracy + 2) },
      { subject: 'Math', value: mathAccuracy }
    ];
  }, [quizResults, marathonSessions]);

  const chartConfig = {
    accuracy: {
      label: "Accuracy %",
      color: "hsl(var(--chart-1))",
    },
  };

  const radarConfig = {
    value: {
      label: "Proficiency",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Accuracy Trend Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Accuracy Trend (Last 14 Days)</h3>
            <div className="flex space-x-1">
              {(['All', 'Math', 'Verbal'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "ghost"}
                  size="sm"
                  className={`px-3 py-1 text-xs rounded-full ${
                    selectedFilter === filter
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="h-48">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyTrendData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Topic Proficiency Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Topic Proficiency</h3>
          </div>
          
          <div className="h-64">
            <ChartContainer config={radarConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={topicProficiencyData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                  />
                  <Radar
                    name="Proficiency"
                    dataKey="value"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div className="mt-4">
            <Button 
              variant="ghost" 
              className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
            >
              View Details →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrends;