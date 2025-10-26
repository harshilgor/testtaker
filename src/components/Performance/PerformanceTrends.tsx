
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Target, Clock, Activity, Lightbulb, Zap, AlertCircle, BarChart3 } from 'lucide-react';

interface PerformanceTrendsProps {
  userName: string;
}

interface TrendData {
  date: string;
  accuracy: number;
  timePerQuestion: number;
  questionsSolved: number;
  studyTime: number;
}

interface Insight {
  type: 'improvement' | 'decline' | 'milestone' | 'warning' | 'tip';
  message: string;
  value?: string;
  icon: React.ReactNode;
}

const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ userName }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Math' | 'Reading and Writing'>('All');
  const [activeView, setActiveView] = useState<'accuracy' | 'time' | 'volume'>('accuracy');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const [showComparison, setShowComparison] = useState(false);

  // Fetch all performance data
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

  const { data: attempts = [] } = useQuery({
    queryKey: ['attempts-trends', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('created_at, time_spent, subject, is_correct')
        .eq('user_id', user.user.id)
        .gte('created_at', since.toISOString());

      if (error) {
        console.error('Error fetching attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Calculate trend data
  const trendData = useMemo(() => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '14d' ? 14 : 30;
    const data: TrendData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      
      // Filter data for this date
      const dayAttempts = attempts.filter((a: any) => 
        new Date(a.created_at).toISOString().slice(0, 10) === dateStr
      );
      
      const dayQuizzes = dbQuizResults.filter((q: any) => 
        new Date(q.created_at).toISOString().slice(0, 10) === dateStr
      );
      
      const dayMarathons = marathonSessions.filter((m: any) => 
        new Date(m.created_at).toISOString().slice(0, 10) === dateStr
      );

      // Calculate metrics
      const totalQuestions = dayAttempts.length + 
        dayQuizzes.reduce((sum: number, q: any) => sum + (q.total_questions || 0), 0) +
        dayMarathons.reduce((sum: number, m: any) => sum + (m.total_questions || 0), 0);
      
      const correctAnswers = dayAttempts.filter((a: any) => a.is_correct).length +
        dayQuizzes.reduce((sum: number, q: any) => sum + (q.correct_answers || 0), 0) +
        dayMarathons.reduce((sum: number, m: any) => sum + (m.correct_answers || 0), 0);
      
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      const totalTime = dayAttempts.reduce((sum: number, a: any) => sum + (a.time_spent || 0), 0);
      const avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;
      
      const studyTime = totalQuestions * 1.5; // Estimate study time

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: Math.round(accuracy),
        timePerQuestion: Math.round(avgTimePerQuestion),
        questionsSolved: totalQuestions,
        studyTime: Math.round(studyTime)
      });
    }
    
    return data;
  }, [attempts, dbQuizResults, marathonSessions, selectedTimeRange]);

  // Get chart configuration
  const getChartConfig = () => {
    switch (activeView) {
      case 'accuracy':
        return {
          dataKey: 'accuracy',
          color: '#3b82f6',
          label: 'Accuracy (%)',
          domain: [0, 100]
        };
      case 'time':
        return {
          dataKey: 'timePerQuestion',
          color: '#10b981',
          label: 'Time per Question (sec)',
          domain: [0, 'dataMax + 30' as any]
        };
      case 'volume':
        return {
          dataKey: 'questionsSolved',
          color: '#8b5cf6',
          label: 'Questions Solved',
          domain: [0, 'dataMax + 5' as any]
        };
      default:
        return {
          dataKey: 'accuracy',
          color: '#3b82f6',
          label: 'Accuracy (%)',
          domain: [0, 100]
        };
    }
  };

  const chartConfig = getChartConfig();

  // Generate comparison data for average 1500 scorer
  const comparisonData = useMemo(() => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '14d' ? 14 : 30;
    const data: TrendData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic data for average 1500 scorer
      let accuracy, timePerQuestion, questionsSolved, studyTime;
      
      switch (activeView) {
        case 'accuracy':
          // 1500 scorer typically has 85-95% accuracy
          accuracy = 85 + Math.random() * 10;
          timePerQuestion = 45 + Math.random() * 15;
          questionsSolved = 15 + Math.random() * 10;
          studyTime = questionsSolved * 1.5;
          break;
        case 'time':
          // 1500 scorer is efficient with time
          accuracy = 85 + Math.random() * 10;
          timePerQuestion = 35 + Math.random() * 10;
          questionsSolved = 15 + Math.random() * 10;
          studyTime = questionsSolved * 1.5;
          break;
        case 'volume':
          // 1500 scorer studies consistently
          accuracy = 85 + Math.random() * 10;
          timePerQuestion = 45 + Math.random() * 15;
          questionsSolved = 20 + Math.random() * 15;
          studyTime = questionsSolved * 1.5;
          break;
        default:
          accuracy = 85 + Math.random() * 10;
          timePerQuestion = 45 + Math.random() * 15;
          questionsSolved = 15 + Math.random() * 10;
          studyTime = questionsSolved * 1.5;
      }

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: Math.round(accuracy),
        timePerQuestion: Math.round(timePerQuestion),
        questionsSolved: Math.round(questionsSolved),
        studyTime: Math.round(studyTime)
      });
    }
    
    return data;
  }, [selectedTimeRange, activeView]);

  // Combine user data with comparison data
  const chartData = useMemo(() => {
    if (!showComparison) return trendData;
    
    return trendData.map((userData, index) => {
      const comparisonPoint = comparisonData[index];
      if (!comparisonPoint) return userData;
      
      return {
        ...userData,
        [`${chartConfig.dataKey}_comparison`]: comparisonPoint[chartConfig.dataKey as keyof TrendData]
      };
    });
  }, [trendData, comparisonData, showComparison, chartConfig.dataKey]);

  return (
    <Card className="bg-white border-0 shadow-sm h-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <p className="text-sm text-gray-500">Track your progress over time</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Compare Button */}
            <Button
              variant={showComparison ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2 text-xs"
            >
              <BarChart3 className="w-4 h-4" />
              Compare
            </Button>
            
            {/* Time Range Selector */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['7d', '14d', '30d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                  className="text-xs px-3 py-1 h-7"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'accuracy', label: 'Accuracy', icon: <Target className="w-4 h-4" /> },
            { key: 'time', label: 'Time', icon: <Clock className="w-4 h-4" /> },
            { key: 'volume', label: 'Volume', icon: <Activity className="w-4 h-4" /> }
          ].map((view) => (
            <Button
              key={view.key}
              variant={activeView === view.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(view.key as any)}
              className="flex items-center gap-2 text-sm"
            >
              {view.icon}
              {view.label}
            </Button>
          ))}
        </div>

        {/* Chart View */}
        <div>
          {/* Chart */}
          <div className="h-80 w-full mb-4">
                         <ChartContainer config={{ 
               [chartConfig.dataKey]: { label: chartConfig.label, color: chartConfig.color },
               ...(showComparison && { [`${chartConfig.dataKey}_comparison`]: { label: 'Avg 1500 Scorer', color: '#f59e0b' } })
             }} className="h-full w-full">
               <LineChart 
                 data={chartData} 
                 margin={{ left: 16, right: 16, top: 8, bottom: 28 }}
               >
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickMargin={12}
                />
                <YAxis 
                  domain={chartConfig.domain}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  label={{ 
                    value: chartConfig.label, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px', fill: '#6B7280' }
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                
                {/* User's performance line */}
                <Line 
                  type="monotone" 
                  dataKey={chartConfig.dataKey} 
                  stroke={chartConfig.color}
                  strokeWidth={3}
                  dot={{ fill: chartConfig.color, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: chartConfig.color, strokeWidth: 2 }}
                  name="Your Performance"
                />
                
                {/* Comparison line (if enabled) */}
                {showComparison && (
                  <Line 
                    type="monotone" 
                    dataKey={`${chartConfig.dataKey}_comparison`}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }}
                    name="Avg 1500 Scorer"
                  />
                )}
              </LineChart>
            </ChartContainer>
          </div>

          {/* Legend */}
          {showComparison && (
            <div className="flex items-center justify-center gap-6 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-gray-600">Your Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-amber-500 border-dashed"></div>
                <span className="text-gray-600">Avg 1500 Scorer</span>
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="flex gap-1">
            {(['All', 'Math', 'Reading and Writing'] as const).map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="text-xs px-3 py-1 h-7"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrends;
