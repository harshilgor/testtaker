import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { TrendingUp, TrendingDown, Clock, Zap, Info, Calculator, BookOpen } from 'lucide-react';

interface PerformanceOverviewOptimizedProps {
  userName: string;
}

interface TopicPerformance {
  topic: string;
  attempts: number;
  accuracy: number;
  avgTime: number;
  category: 'best' | 'needs_work' | 'time_intensive' | 'quick';
}

type MetricType = 'best' | 'needs_work' | 'time_intensive' | 'quick';
type SubjectType = 'all' | 'math' | 'reading_and_writing';

const PerformanceOverviewOptimized: React.FC<PerformanceOverviewOptimizedProps> = ({ userName }) => {
  const { questionAttempts, marathonSessions, loading: dataLoading } = useData();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('best');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('all');
  const [tooltipStates, setTooltipStates] = useState<Record<string, boolean>>({});

  // Process data to get performance insights - now instant!
  const performanceData = useMemo(() => {
    // Safety check to ensure data is available
    if (!questionAttempts || !Array.isArray(questionAttempts) || questionAttempts.length === 0) {
      console.log('No question attempts data available');
      return {
        bestTopics: [],
        needsWork: [],
        timeIntensive: [],
        quickTopics: []
      };
    }

    // Debug: Log sample question attempts to understand data structure
    console.log('Sample question attempts:', questionAttempts.slice(0, 3).map(attempt => ({
      topic: attempt.topic,
      subject: attempt.subject,
      skill: attempt.skill,
      domain: attempt.domain,
      is_correct: attempt.is_correct,
      time_spent: attempt.time_spent,
      // @ts-expect-error - Properties may not exist
      test: attempt.test,
      assessment: attempt.assessment
    })));

    // Filter attempts by selected subject
    const filteredAttempts = questionAttempts.filter(attempt => {
      if (selectedSubject === 'all') return true;
      
      // Map database test field to our subject types
      // @ts-expect-error - Properties may not exist on QuestionAttempt type
      const testField = attempt.test || attempt.assessment || '';
      if (selectedSubject === 'math') {
        return testField.toLowerCase().includes('math');
      } else if (selectedSubject === 'reading_and_writing') {
        return testField.toLowerCase().includes('reading') || testField.toLowerCase().includes('writing');
      }
      return true;
    });

    // Group by topic/skill with better topic mapping
    const topicStats = filteredAttempts.reduce((acc, attempt) => {
      // Try multiple fields to get the topic
      let topic = attempt.topic || attempt.subject || attempt.skill || attempt.domain;
      
      // If topic is still undefined/null, try to extract from other fields
      if (!topic) {
        // Check if there's a test field that might contain topic info
        // @ts-expect-error - Properties may not exist on QuestionAttempt type
        const testField = attempt.test || attempt.assessment || '';
        if (testField.toLowerCase().includes('algebra')) topic = 'Algebra';
        else if (testField.toLowerCase().includes('geometry')) topic = 'Geometry';
        else if (testField.toLowerCase().includes('reading')) topic = 'Reading Comprehension';
        else if (testField.toLowerCase().includes('writing')) topic = 'Writing and Language';
        else topic = 'General Practice';
      }
      
      // Normalize topic names
      if (topic.toLowerCase() === 'general') topic = 'General Practice';
      if (topic.toLowerCase() === 'math') topic = 'Mathematics';
      if (topic.toLowerCase() === 'english') topic = 'Reading and Writing';
      
      if (!acc[topic]) {
        acc[topic] = {
          attempts: 0,
          correct: 0,
          totalTime: 0,
          times: []
        };
      }
      
      acc[topic].attempts++;
      if (attempt.is_correct) acc[topic].correct++;
      acc[topic].totalTime += attempt.time_spent || 0;
      acc[topic].times.push(attempt.time_spent || 0);
      
      return acc;
    }, {} as Record<string, { attempts: number; correct: number; totalTime: number; times: number[] }>);

    // Convert to TopicPerformance array
    const allTopics: TopicPerformance[] = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      attempts: stats.attempts,
      accuracy: stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0,
      avgTime: stats.attempts > 0 ? stats.totalTime / stats.attempts : 0,
      category: 'best' as const // Will be categorized below
    }));

    // Filter topics with at least 1 attempt for meaningful analysis
    const significantTopics = allTopics.filter(topic => topic.attempts >= 1);
    
    if (significantTopics.length === 0) {
      return {
        bestTopics: [],
        needsWork: [],
        timeIntensive: [],
        quickTopics: []
      };
    }

    // Calculate averages for comparison
    const avgAccuracy = significantTopics.reduce((sum, topic) => sum + topic.accuracy, 0) / significantTopics.length;
    const avgTime = significantTopics.reduce((sum, topic) => sum + topic.avgTime, 0) / significantTopics.length;

    // Enhanced debug logging (avoid referencing variables before initialization)
    console.log('Performance Analysis Debug:', {
      totalTopics: allTopics.length,
      significantTopicsCount: significantTopics.length,
      avgAccuracy: avgAccuracy.toFixed(2),
      avgTime: avgTime.toFixed(2),
      allTopics: allTopics.map(t => ({ topic: t.topic, attempts: t.attempts, accuracy: t.accuracy.toFixed(2) })),
      topTopics: significantTopics.slice(0, 5).map(t => ({ topic: t.topic, attempts: t.attempts, accuracy: t.accuracy.toFixed(2) }))
    });

    // More flexible categorization - ensure we always show top 5 topics
    const bestTopics = significantTopics
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    const needsWork = significantTopics
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    const timeIntensive = significantTopics
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    const quickTopics = significantTopics
      .filter(topic => topic.avgTime < avgTime && topic.accuracy > avgAccuracy)
      .sort((a, b) => a.avgTime - b.avgTime)
      .slice(0, 5);

    // Always return the top 5 topics for each category
    const finalBestTopics = bestTopics;
    const finalNeedsWork = needsWork;

    return {
      bestTopics: finalBestTopics,
      needsWork: finalNeedsWork,
      timeIntensive,
      quickTopics
    };
  }, [questionAttempts, selectedSubject]);

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'best':
        return performanceData.bestTopics;
      case 'needs_work':
        return performanceData.needsWork;
      case 'time_intensive':
        return performanceData.timeIntensive;
      case 'quick':
        return performanceData.quickTopics;
      default:
        return [];
    }
  };

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case 'best':
        return TrendingUp;
      case 'needs_work':
        return TrendingDown;
      case 'time_intensive':
        return Clock;
      case 'quick':
        return Zap;
      default:
        return Info;
    }
  };

  const getMetricTitle = (metric: MetricType) => {
    const baseTitle = (() => {
      switch (metric) {
        case 'best':
          return 'Best Performing Topics';
        case 'needs_work':
          return 'Topics Needing Work';
        case 'time_intensive':
          return 'Time-Intensive Topics';
        case 'quick':
          return 'Quick Topics';
        default:
          return 'Performance Overview';
      }
    })();

    // Add subject indicator if not showing all subjects
    if (selectedSubject === 'math') {
      return `${baseTitle} - Math`;
    } else if (selectedSubject === 'reading_and_writing') {
      return `${baseTitle} - Reading & Writing`;
    }
    
    return baseTitle;
  };

  const getEmptyMessage = (metric: MetricType) => {
    const baseMessage = questionAttempts.length === 0 
      ? 'Start practicing to see your performance insights!' 
      : 'Complete at least 3 questions per topic to see detailed analysis.';
    
    return baseMessage;
  };

  // Utility: Get metric base label (no subject)
  const getMetricBaseLabel = (metric: MetricType) => {
    switch(metric) {
      case 'best': return 'Best';
      case 'needs_work': return 'Needs Work';
      case 'time_intensive': return 'Time-Intensive';
      case 'quick': return 'Quick';
      default: return '';
    }
  };

  const renderTopicCard = (topic: TopicPerformance, index: number) => {
    const showTooltip = tooltipStates[topic.topic] || false;
    const setShowTooltip = (show: boolean) => {
      setTooltipStates(prev => ({ ...prev, [topic.topic]: show }));
    };

    return (
      <div
        key={topic.topic}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm truncate pr-2">
            {topic.topic}
          </h4>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            #{index + 1}
          </span>
        </div>
        {/* Horizontal row for performance metrics */}
        <div className="flex items-center gap-4 text-sm mt-2 mb-1">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Accuracy:</span>
            <span className="font-medium text-gray-900">{topic.accuracy.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Avg Time:</span>
            <span className="font-medium text-gray-900">{topic.avgTime.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Attempts:</span>
            <span className="font-medium text-gray-900">{topic.attempts}</span>
          </div>
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
            {topic.topic} - {topic.attempts} attempts
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  };

  const metrics: MetricType[] = ['best', 'needs_work', 'time_intensive', 'quick'];
  const currentData = getMetricData();
  const Icon = getMetricIcon(selectedMetric);

  return (
    <div className="space-y-6">
      {/* Main Performance Overview Card */}
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon className="h-5 w-5 text-blue-600" />
              {getMetricTitle(selectedMetric)}
            </CardTitle>
          </div>
          
          {/* Subject Selection - Minimalistic */}
          <div className="flex flex-wrap gap-1 mt-4">
            {[['all', Info, 'All Subjects'], ['math', Calculator, 'Math'], ['reading_and_writing', BookOpen, 'Reading and Writing']].map(([val, IconComp, label]) => (
              <Button
                key={val}
                variant={selectedSubject === val ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setSelectedSubject(val as SubjectType)}
                className={`rounded-full p-1 px-2 text-[0.88rem] h-7 w-auto min-w-0 flex items-center justify-center transition-colors ${selectedSubject === val ? 'bg-blue-100 text-blue-700 border border-blue-600' : 'text-gray-600 hover:bg-gray-100 border-0'}`}
                title={label}
              >
                <IconComp className="h-4 w-4 mr-0.5" />
                {selectedSubject === val && <span className="ml-1.5 pr-1 font-medium" style={{letterSpacing:'-0.5px'}}>{label}</span>}
              </Button>
            ))}
          </div>
          {/* Metric Selection - Minimalistic */}
          <div className="flex flex-wrap gap-1 mt-3">
            {metrics.map((metric) => {
              const MetricIcon = getMetricIcon(metric);
              const label = getMetricBaseLabel(metric);
              return (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setSelectedMetric(metric)}
                  className={`rounded-full p-1 px-2 text-[0.88rem] h-7 w-auto min-w-0 flex items-center justify-center transition-colors ${selectedMetric === metric ? 'bg-blue-100 text-blue-700 border border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  title={label}
                >
                  <MetricIcon className="h-4 w-4 mr-0.5" />
                  {selectedMetric === metric && <span className="ml-1.5 pr-1 font-medium" style={{letterSpacing:'-0.5px'}}>{label}</span>}
                </Button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          {dataLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">{getEmptyMessage(selectedMetric)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {currentData.map((topic, index) => renderTopicCard(topic, index))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default PerformanceOverviewOptimized;

// Also export as the original name for compatibility
export { PerformanceOverviewOptimized as PerformanceOverview };
