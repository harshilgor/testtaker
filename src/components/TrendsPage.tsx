import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Target, 
  Brain, 
  FileText, 
  BookOpen,
  PenTool,
  Clock,
  Award,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface TrendsPageProps {
  userName: string;
  onBack: () => void;
}

interface DailyActivity {
  date: string;
  sessions: ActivitySession[];
  totalQuestions: number;
  averageAccuracy: number;
  totalTimeMinutes: number;
}

interface ActivitySession {
  id: string;
  type: 'marathon' | 'quiz' | 'mocktest' | 'reading' | 'writing';
  title: string;
  questions: number;
  accuracy: number;
  score?: number;
  topics: string[];
  timeSpent?: number;
}

interface SmartInsight {
  type: 'achievement' | 'error_pattern' | 'recommendation';
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TrendsPage: React.FC<TrendsPageProps> = ({ userName, onBack }) => {
  // Fetch all user data
  const { data: marathonSessions = [] } = useQuery({
    queryKey: ['trends-marathon-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: quizSessions = [] } = useQuery({
    queryKey: ['trends-quiz-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: mockTestSessions = [] } = useQuery({
    queryKey: ['trends-mocktest-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: questionAttempts = [] } = useQuery({
    queryKey: ['trends-question-attempts', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      return data || [];
    },
    enabled: !!userName,
  });

  // Process data into daily activities
  const getDailyActivities = (): DailyActivity[] => {
    const dailyMap = new Map<string, DailyActivity>();

    // Process marathon sessions
    marathonSessions.forEach(session => {
      const date = new Date(session.created_at).toDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          sessions: [],
          totalQuestions: 0,
          averageAccuracy: 0,
          totalTimeMinutes: 0
        });
      }
      
      const activity = dailyMap.get(date)!;
      activity.sessions.push({
        id: session.id,
        type: 'marathon',
        title: 'Reading Practice',
        questions: session.total_questions || 0,
        accuracy: session.total_questions > 0 ? 
          Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 0,
        topics: session.subjects || [],
        timeSpent: 45 // Estimate
      });
    });

    // Process quiz sessions
    quizSessions.forEach(session => {
      const date = new Date(session.created_at).toDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          sessions: [],
          totalQuestions: 0,
          averageAccuracy: 0,
          totalTimeMinutes: 0
        });
      }
      
      const activity = dailyMap.get(date)!;
      const sessionType = session.subject === 'math' ? 'quiz' : 'writing';
      activity.sessions.push({
        id: session.id,
        type: sessionType,
        title: session.subject === 'math' ? 'Math Quiz' : 'Writing Review',
        questions: session.total_questions || 0,
        accuracy: Math.round(session.score_percentage || 0),
        topics: session.topics || [],
        timeSpent: Math.round((session.time_taken || 0) / 60)
      });
    });

    // Process mock test sessions
    mockTestSessions.forEach(session => {
      const date = new Date(session.completed_at).toDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          sessions: [],
          totalQuestions: 0,
          averageAccuracy: 0,
          totalTimeMinutes: 0
        });
      }
      
      const activity = dailyMap.get(date)!;
      activity.sessions.push({
        id: session.id,
        type: 'mocktest',
        title: 'Full Practice Test',
        questions: 154,
        accuracy: Math.round((session.total_score / 1600) * 100),
        score: session.total_score,
        topics: ['Math', 'Reading', 'Writing'],
        timeSpent: Math.round((session.time_taken || 0) / 60)
      });
    });

    // Calculate daily totals
    dailyMap.forEach(activity => {
      activity.totalQuestions = activity.sessions.reduce((sum, s) => sum + s.questions, 0);
      activity.averageAccuracy = activity.sessions.length > 0 
        ? Math.round(activity.sessions.reduce((sum, s) => sum + s.accuracy, 0) / activity.sessions.length)
        : 0;
      activity.totalTimeMinutes = activity.sessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
    });

    return Array.from(dailyMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const dailyActivities = getDailyActivities();

  // Generate smart insights
  const getSmartInsights = (): SmartInsight[] => {
    const insights: SmartInsight[] = [];

    // Achievement detection
    const recentAccuracies = dailyActivities.slice(0, 3).map(d => d.averageAccuracy);
    if (recentAccuracies.every(acc => acc >= 80)) {
      insights.push({
        type: 'achievement',
        title: 'Consistency Champion!',
        description: 'You\'ve maintained 80%+ accuracy for 3 days straight. Keep up the excellent work!',
        icon: <Award className="h-4 w-4 text-yellow-500" />
      });
    }

    // Error pattern detection
    const mathAttempts = questionAttempts.filter(q => q.subject === 'math');
    const mathAccuracy = mathAttempts.length > 0 
      ? (mathAttempts.filter(q => q.is_correct).length / mathAttempts.length) * 100
      : 0;
    
    if (mathAccuracy < 60 && mathAttempts.length > 10) {
      insights.push({
        type: 'error_pattern',
        title: 'Math Improvement Opportunity',
        description: 'Focus on algebra and geometry concepts. Practice word problems daily.',
        icon: <AlertTriangle className="h-4 w-4 text-orange-500" />
      });
    }

    // General recommendation
    insights.push({
      type: 'recommendation',
      title: 'Performance Trending Up',
      description: 'Your accuracy has improved by 15% this week. Consider taking a practice test.',
      icon: <TrendingUp className="h-4 w-4 text-green-500" />
    });

    return insights;
  };

  const smartInsights = getSmartInsights();

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'marathon':
      case 'reading': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'quiz': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'mocktest': return <FileText className="h-4 w-4 text-green-500" />;
      case 'writing': return <PenTool className="h-4 w-4 text-orange-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadgeColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-700';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Trends</h1>
            <p className="text-gray-600">Track your progress and identify patterns</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Smart Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smartInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                    {insight.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Timeline */}
        <div className="space-y-6">
          {dailyActivities.map((day, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{formatRelativeDate(day.date)}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {day.totalQuestions} questions • {day.totalTimeMinutes} minutes
                    </p>
                  </div>
                  <Badge className={`${getAccuracyBadgeColor(day.averageAccuracy)}`}>
                    {day.averageAccuracy}% accuracy
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {day.sessions.map((session, sessionIndex) => (
                    <div key={sessionIndex} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50">
                          {getSessionIcon(session.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{session.title}</h4>
                            {session.score && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                {session.score}/1600
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{session.questions} questions</span>
                            {session.timeSpent && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.timeSpent}m
                              </span>
                            )}
                            <div className="flex gap-1">
                              {session.topics.slice(0, 2).map((topic, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                              {session.topics.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{session.topics.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getAccuracyColor(session.accuracy)}`}>
                          {session.accuracy}%
                        </div>
                        <div className="text-xs text-gray-500">accuracy</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Detailed Analytics Button */}
        <div className="flex justify-end mt-8">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {/* Navigate to detailed analytics */}}
          >
            View Detailed Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrendsPage;