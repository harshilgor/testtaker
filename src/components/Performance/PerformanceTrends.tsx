import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceTrendsProps {
  userName: string;
}

interface AccuracyData {
  date: string;
  accuracy: number;
  mathAccuracy: number;
  verbalAccuracy: number;
}

interface TopicProficiencyData {
  topic: string;
  score: number;
}

const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ userName }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Math' | 'Verbal'>('All');
  const [accuracyData, setAccuracyData] = useState<AccuracyData[]>([]);
  const [topicProficiency, setTopicProficiency] = useState<TopicProficiencyData[]>([]);

  // Fetch quiz results from Supabase
  const { data: dbQuizResults = [] } = useQuery({
    queryKey: ['quiz-results-trends', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz results:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch marathon sessions from Supabase
  const { data: marathonSessions = [] } = useQuery({
    queryKey: ['marathon-sessions-trends', userName],
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

  useEffect(() => {
    // Generate accuracy trend data for the last 14 days
    const generateAccuracyData = () => {
      const last14Days = [];
      const today = new Date();
      
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Mock data - in a real app, you would calculate actual accuracy from quiz/marathon results
        const baseAccuracy = 60 + Math.random() * 30; // 60-90% range
        const mathAccuracy = Math.max(30, baseAccuracy + (Math.random() - 0.5) * 20);
        const verbalAccuracy = Math.max(30, baseAccuracy + (Math.random() - 0.5) * 20);
        
        last14Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          accuracy: Math.round((mathAccuracy + verbalAccuracy) / 2),
          mathAccuracy: Math.round(mathAccuracy),
          verbalAccuracy: Math.round(verbalAccuracy)
        });
      }
      
      setAccuracyData(last14Days);
    };

    // Generate topic proficiency data
    const generateTopicProficiency = () => {
      // In a real app, calculate these based on actual quiz results
      const topics = [
        { topic: 'Reading', score: 75 },
        { topic: 'Writing', score: 82 },
        { topic: 'Grammar', score: 68 },
        { topic: 'Math', score: 78 }
      ];
      
      setTopicProficiency(topics);
    };

    generateAccuracyData();
    generateTopicProficiency();
  }, [dbQuizResults, marathonSessions]);

  // Chart configuration
  const chartConfig = {
    accuracy: {
      label: "Accuracy",
      color: "hsl(var(--chart-1))",
    },
    mathAccuracy: {
      label: "Math",
      color: "hsl(var(--chart-2))",
    },
    verbalAccuracy: {
      label: "Verbal",
      color: "hsl(var(--chart-3))",
    },
  };

  const getFilteredData = useMemo(() => {
    return accuracyData.map(item => ({
      ...item,
      value: activeFilter === 'All' ? item.accuracy : 
             activeFilter === 'Math' ? item.mathAccuracy : 
             item.verbalAccuracy
    }));
  }, [accuracyData, activeFilter]);

  const handleViewDetails = () => {
    // Navigate to detailed performance view
    console.log('View Details clicked');
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accuracy Trend Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Accuracy Trend (Last 14 Days)</h3>
            <div className="flex space-x-1">
              {(['All', 'Math', 'Verbal'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeFilter === filter 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="h-32">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getFilteredData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 4, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
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
            <button 
              onClick={handleViewDetails}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <span>View Details</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="h-40 flex items-center justify-center">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={topicProficiency}>
                  <PolarGrid 
                    gridType="polygon"
                    stroke="#E5E7EB"
                    strokeWidth={1}
                  />
                  <PolarAngleAxis 
                    dataKey="topic"
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                  />
                  <PolarRadiusAxis 
                    domain={[0, 100]}
                    angle={90}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Proficiency"
                    dataKey="score"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrends;