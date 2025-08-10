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

  // Fetch question attempts (for study time) from Supabase - last 30 days
  const { data: attempts = [] } = useQuery({
    queryKey: ['attempts-last-30', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [] as Array<{ created_at: string; time_spent: number; subject: string }>

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('created_at, time_spent, subject')
        .eq('user_id', user.user.id)
        .gte('created_at', since.toISOString());

      if (error) {
        console.error('Error fetching attempts:', error);
        return [] as Array<{ created_at: string; time_spent: number; subject: string }>
      }

      return (data || []) as Array<{ created_at: string; time_spent: number; subject: string }>
    },
    enabled: !!userName,
    staleTime: 60_000,
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
        { topic: 'Grammar', score: 69 },
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
    return accuracyData.map(item => {
      const value = activeFilter === 'All' ? item.accuracy : 
             activeFilter === 'Math' ? item.mathAccuracy : 
             item.verbalAccuracy
      const benchmark = Math.min(95, Math.round(value + 8))
      return { ...item, value, benchmark }
    })
  }, [accuracyData, activeFilter]);

  const yAxisDomain = useMemo(() => {
    if (getFilteredData.length === 0) return [0, 100];
    
    const minValue = Math.min(...getFilteredData.map(item => item.value));
    const maxValue = Math.max(...getFilteredData.map(item => item.value));
    
    // Add some padding to the range
    const padding = (maxValue - minValue) * 0.1 || 10;
    const min = Math.max(0, Math.floor(minValue - padding));
    const max = Math.min(100, Math.ceil(maxValue + padding));
    
    return [min, max];
  }, [getFilteredData]);

  // Study time data (minutes per day) for last 30 days, filtered by subject
  const getStudyFilteredData = useMemo(() => {
    // Build date keys for last 30 days
    const days: { key: string; label: string }[] = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      days.push({ key, label })
    }

    const totals = new Map<string, { math: number; verbal: number; all: number }>()
    days.forEach(({ key }) => totals.set(key, { math: 0, verbal: 0, all: 0 }))

    attempts.forEach((a: any) => {
      if (!a?.created_at) return
      const key = new Date(a.created_at).toISOString().slice(0, 10)
      if (!totals.has(key)) return
      const minutes = Math.max(0, Number(a.time_spent || 0) / 60)
      const subj = String(a.subject || '').toLowerCase()
      const isMath = subj.includes('math')
      const isVerbal = subj.includes('reading') || subj.includes('writing') || subj.includes('verbal') || subj.includes('rw')
      const bucket = totals.get(key)!
      if (isMath) bucket.math += minutes
      else if (isVerbal) bucket.verbal += minutes
      else {
        // Unknown subject, count towards all
        bucket.all += minutes
      }
      bucket.all += minutes
    })

    const series = days.map(({ key, label }) => {
      const t = totals.get(key)!
      const base = activeFilter === 'All' ? t.all : activeFilter === 'Math' ? t.math : t.verbal
      const value = Math.round(base)
      const benchmark = Math.round(value * 1.3 + 5)
      return { date: label, value, benchmark }
    })

    return series
  }, [attempts, activeFilter])

  const yStudyDomain = useMemo(() => {
    if (getStudyFilteredData.length === 0) return [0, 60]
    const minValue = Math.min(...getStudyFilteredData.map(d => d.value))
    const maxValue = Math.max(...getStudyFilteredData.map(d => d.value))
    const padding = (maxValue - minValue) * 0.1 || 5
    const min = Math.max(0, Math.floor(minValue - padding))
    const max = Math.ceil(maxValue + padding)
    return [min, max]
  }, [getStudyFilteredData]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Accuracy Trend Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-700">Accuracy Trend (Last 14 Days)</h3>
              <div className="flex space-x-2">
                {(['All', 'Math', 'Verbal'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    className={`px-4 py-2 text-xs rounded-full ${
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
            
            <div className="h-56 w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={getFilteredData} margin={{ left: 16, right: 16, top: 8, bottom: 28 }}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    tickMargin={12}
                  />
                  <YAxis 
                    domain={yAxisDomain}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
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
                  <Line 
                    type="monotone" 
                    dataKey="benchmark" 
                    stroke="hsl(var(--chart-4))"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          {/* Topic Proficiency Section */}
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-700">Topic Proficiency</h3>
            </div>
            
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={topicProficiency} margin={{ top: 30, right: 50, bottom: 30, left: 50 }}>
                  <PolarGrid 
                    gridType="polygon"
                    stroke="#E5E7EB"
                    strokeWidth={1}
                    radialLines={true}
                  />
                  <PolarAngleAxis 
                    dataKey="topic"
                    tick={{ fontSize: 13, fill: '#6B7280' }}
                    className="text-xs"
                  />
                  <PolarRadiusAxis 
                    domain={[0, 100]}
                    angle={90}
                    tick={false}
                    axisLine={false}
                    tickFormatter={() => ''}
                  />
                  <Radar
                    name="Proficiency"
                    dataKey="score"
                    stroke="#374151"
                    fill="#374151"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    dot={{ fill: '#374151', strokeWidth: 0, r: 4 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrends;