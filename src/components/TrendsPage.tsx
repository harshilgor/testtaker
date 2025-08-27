import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AIInsights from '@/components/Performance/AIInsights';
import { 
  ArrowLeft, 
  Target, 
  Brain, 
  FileText, 
  Clock,
  Calendar
} from 'lucide-react';

type TimeFilter = 'daily' | 'monthly' | 'all-time';

interface TrendsPageProps {
  userName: string;
  onBack: () => void;
}

interface SessionActivity {
  id: string;
  type: 'marathon' | 'quiz' | 'mocktest';
  title: string;
  questions: number;
  accuracy: number;
  score?: number;
  topics: string[];
  icon: React.ReactNode;
  time: string;
  timestamp: string;
}

interface DayGroup {
  date: string;
  displayDate: string;
  sessions: SessionActivity[];
  dayStats: {
    totalQuestions: number;
    overallAccuracy: number;
    studyTime: string;
    sessionsCount: number;
  };
}

// Monthly aggregated group used when the "Monthly" filter is active
interface MonthGroup {
  date: string; // YYYY-MM key
  displayDate: string; // e.g., August 2025
  sessions: SessionActivity[]; // kept for type compatibility; not used for listing in monthly view
  dayStats: {
    totalQuestions: number;
    overallAccuracy: number;
    studyTime: string;
    sessionsCount: number;
  };
  counts: {
    quizzes: number;
    marathons: number;
    mocktests: number;
  };
}

const TrendsPage: React.FC<TrendsPageProps> = ({ userName, onBack }) => {
  const queryClient = useQueryClient();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('daily');

  // Set up real-time listeners for all session types
  useEffect(() => {
    if (!userName) return;

    const channel = supabase
      .channel('trends-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marathon_sessions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-marathon-sessions', userName] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_results'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-quiz-sessions', userName] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mock_test_results'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-mocktest-sessions', userName] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userName, queryClient]);

  // Fetch all marathon sessions
  const { data: marathonSessions = [] } = useQuery({
    queryKey: ['all-marathon-sessions', userName],
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
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Fetch all quiz sessions
  const { data: quizSessions = [] } = useQuery({
    queryKey: ['all-quiz-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Fetch all mock test sessions
  const { data: mockTestSessions = [] } = useQuery({
    queryKey: ['all-mocktest-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching mock test sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Fetch all question attempts for day-wise analysis
  const { data: allAttempts = [] } = useQuery({
    queryKey: ['all-attempts', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatDateHeader(date: Date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }

  // Group all sessions by day
  const groupedSessions = useMemo((): DayGroup[] => {
    const allSessions: { session: SessionActivity; timestamp: Date }[] = [];

    // Add marathon sessions
    marathonSessions.forEach(session => {
      const accuracy = session.total_questions > 0 ? 
        Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 0;
      allSessions.push({
        session: {
          id: session.id,
          type: 'marathon',
          title: 'Marathon Mode',
          questions: session.total_questions || 0,
          accuracy,
          topics: session.subjects || ['Mixed'],
          icon: <Target className="h-4 w-4 text-orange-500" />,
          time: formatRelativeTime(session.created_at),
          timestamp: session.created_at
        },
        timestamp: new Date(session.created_at),
      });
    });

    // Add quiz sessions
    quizSessions.forEach(session => {
      const accuracy = Math.round(session.score_percentage || 0);
      allSessions.push({
        session: {
          id: session.id,
          type: 'quiz',
          title: `${session.subject === 'math' ? 'Math' : 'English'} Quiz`,
          questions: session.total_questions || 0,
          accuracy,
          topics: session.topics || [session.subject],
          icon: <Brain className="h-4 w-4 text-purple-500" />,
          time: formatRelativeTime(session.created_at),
          timestamp: session.created_at
        },
        timestamp: new Date(session.created_at),
      });
    });

    // Add local quiz sessions (fallback if not saved to DB)
    try {
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const localQuizzes = (stored || []).filter((r: any) => r.userName === userName);
      localQuizzes.forEach((r: any, idx: number) => {
        const correct = r.answers.filter((ans: any, i: number) => ans === r.questions[i]?.correctAnswer).length;
        const total = r.questions?.length || 0;
        const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
        allSessions.push({
          session: {
            id: r.id || `local-quiz-${idx}-${r.date}`,
            type: 'quiz',
            title: `${r.subject || 'Mixed'} Quiz`,
            questions: total,
            accuracy: acc,
            topics: r.topics || (r.questions || []).map((q: any) => q.topic).filter(Boolean).slice(0, 3),
            icon: <Brain className="h-4 w-4 text-purple-500" />,
            time: formatRelativeTime(r.date),
            timestamp: r.date
          },
          timestamp: new Date(r.date),
        });
      });
    } catch (e) {
      console.warn('Failed to parse local quiz results', e);
    }

    // Add mock test sessions
    mockTestSessions.forEach(session => {
      const accuracy = Math.round((session.total_score / 1600) * 100);
      allSessions.push({
        session: {
          id: session.id,
          type: 'mocktest',
          title: 'SAT Mock Test',
          questions: 154,
          accuracy,
          score: session.total_score,
          topics: ['Math', 'Reading', 'Writing'],
          icon: <FileText className="h-4 w-4 text-green-500" />,
          time: formatRelativeTime(session.completed_at),
          timestamp: session.completed_at
        },
        timestamp: new Date(session.completed_at),
      });
    });

    // Sort by timestamp (most recent first)
    allSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Group by day
    const dayGroups = new Map<string, SessionActivity[]>();
    allSessions.forEach(({ session, timestamp }) => {
      const dateKey = timestamp.toDateString();
      if (!dayGroups.has(dateKey)) {
        dayGroups.set(dateKey, []);
      }
      dayGroups.get(dateKey)!.push(session);
    });

    // Convert to array with day stats
    const result: DayGroup[] = [];
    dayGroups.forEach((sessions, dateKey) => {
      const date = new Date(dateKey);
      const totalQuestions = sessions.reduce((sum, s) => sum + s.questions, 0);
      const totalCorrect = sessions.reduce((sum, s) => sum + Math.round((s.accuracy / 100) * s.questions), 0);
      const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      
      // Calculate study time for this day
      const dayAttempts = allAttempts.filter(attempt => {
        const attemptDate = new Date(attempt.created_at);
        return attemptDate.toDateString() === dateKey;
      });
      const studyTimeSeconds = dayAttempts.reduce((sum, q) => sum + (q.time_spent || 0), 0);
      const studyTimeMinutes = Math.floor(studyTimeSeconds / 60);
      const studyTime = studyTimeMinutes > 60 ? 
        `${Math.floor(studyTimeMinutes / 60)}h ${studyTimeMinutes % 60}m` : 
        `${studyTimeMinutes}m`;

      result.push({
        date: dateKey,
        displayDate: formatDateHeader(date),
        sessions: sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        dayStats: {
          totalQuestions,
          overallAccuracy,
          studyTime,
          sessionsCount: sessions.length
        }
      });
    });

    return result;
  }, [marathonSessions, quizSessions, mockTestSessions, allAttempts]);

  // Group all sessions by month when Monthly filter is active
  const monthlyGroups = useMemo((): MonthGroup[] => {
    const allSessions: { session: SessionActivity; timestamp: Date }[] = [];

    // Marathon
    marathonSessions.forEach(session => {
      const accuracy = session.total_questions > 0 ?
        Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 0;
      allSessions.push({
        session: {
          id: session.id,
          type: 'marathon',
          title: 'Marathon Mode',
          questions: session.total_questions || 0,
          accuracy,
          topics: session.subjects || ['Mixed'],
          icon: <Target className="h-4 w-4 text-orange-500" />,
          time: formatRelativeTime(session.created_at),
          timestamp: session.created_at
        },
        timestamp: new Date(session.created_at),
      });
    });

    // Quiz
    quizSessions.forEach(session => {
      const accuracy = Math.round(session.score_percentage || 0);
      allSessions.push({
        session: {
          id: session.id,
          type: 'quiz',
          title: `${session.subject === 'math' ? 'Math' : 'English'} Quiz`,
          questions: session.total_questions || 0,
          accuracy,
          topics: session.topics || [session.subject],
          icon: <Brain className="h-4 w-4 text-purple-500" />,
          time: formatRelativeTime(session.created_at),
          timestamp: session.created_at
        },
        timestamp: new Date(session.created_at),
      });
    });

    // Local quizzes fallback
    try {
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const localQuizzes = (stored || []).filter((r: any) => r.userName === userName);
      localQuizzes.forEach((r: any, idx: number) => {
        const correct = r.answers.filter((ans: any, i: number) => ans === r.questions[i]?.correctAnswer).length;
        const total = r.questions?.length || 0;
        const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
        allSessions.push({
          session: {
            id: r.id || `local-quiz-${idx}-${r.date}`,
            type: 'quiz',
            title: `${r.subject || 'Mixed'} Quiz`,
            questions: total,
            accuracy: acc,
            topics: r.topics || (r.questions || []).map((q: any) => q.topic).filter(Boolean).slice(0, 3),
            icon: <Brain className="h-4 w-4 text-purple-500" />,
            time: formatRelativeTime(r.date),
            timestamp: r.date
          },
          timestamp: new Date(r.date),
        });
      });
    } catch {}

    // Mock tests
    mockTestSessions.forEach(session => {
      const accuracy = Math.round((session.total_score / 1600) * 100);
      allSessions.push({
        session: {
          id: session.id,
          type: 'mocktest',
          title: 'SAT Mock Test',
          questions: 154,
          accuracy,
          score: session.total_score,
          topics: ['Math', 'Reading', 'Writing'],
          icon: <FileText className="h-4 w-4 text-green-500" />,
          time: formatRelativeTime(session.completed_at),
          timestamp: session.completed_at
        },
        timestamp: new Date(session.completed_at),
      });
    });

    // Group by YYYY-MM
    const monthMap = new Map<string, SessionActivity[]>();
    allSessions.forEach(({ session, timestamp }) => {
      const key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(key)) monthMap.set(key, []);
      monthMap.get(key)!.push(session);
    });

    const result: MonthGroup[] = [];
    monthMap.forEach((sessions, key) => {
      const [y, m] = key.split('-').map(Number);
      const totalQuestions = sessions.reduce((sum, s) => sum + s.questions, 0);
      const totalCorrect = sessions.reduce((sum, s) => sum + Math.round((s.accuracy / 100) * s.questions), 0);
      const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      // Study time for the month
      const studyTimeSeconds = allAttempts.reduce((sum, q) => {
        const d = new Date(q.created_at);
        const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return mk === key ? sum + (q.time_spent || 0) : sum;
      }, 0);
      const studyTimeMinutes = Math.floor(studyTimeSeconds / 60);
      const studyTime = studyTimeMinutes > 60 ? `${Math.floor(studyTimeMinutes / 60)}h ${studyTimeMinutes % 60}m` : `${studyTimeMinutes}m`;

      const counts = sessions.reduce((acc, s) => {
        if (s.type === 'quiz') acc.quizzes += 1;
        if (s.type === 'marathon') acc.marathons += 1;
        if (s.type === 'mocktest') acc.mocktests += 1;
        return acc;
      }, { quizzes: 0, marathons: 0, mocktests: 0 });

      const displayDate = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      result.push({
        date: key,
        displayDate,
        sessions: sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        dayStats: { totalQuestions, overallAccuracy, studyTime, sessionsCount: sessions.length },
        counts
      });
    });

    // Sort months desc
    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  }, [marathonSessions, quizSessions, mockTestSessions, allAttempts, userName]);

  // Calculate all-time summary when "All-time" is selected
  const allTimeSummary = useMemo(() => {
    const allSessions = [...marathonSessions, ...quizSessions, ...mockTestSessions];
    
    // Get local quiz sessions
    let localQuizzes: any[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      localQuizzes = (stored || []).filter((r: any) => r.userName === userName);
    } catch {}

    const totalQuizzes = quizSessions.length + localQuizzes.length;
    const totalMarathons = marathonSessions.length;
    const totalMockTests = mockTestSessions.length;

    // Calculate overall accuracy and questions
    let totalQuestions = 0;
    let totalCorrect = 0;

    // Marathon sessions
    marathonSessions.forEach(session => {
      totalQuestions += session.total_questions || 0;
      totalCorrect += session.correct_answers || 0;
    });

    // Quiz sessions
    quizSessions.forEach(session => {
      const questions = session.total_questions || 0;
      totalQuestions += questions;
      totalCorrect += Math.round((session.score_percentage || 0) / 100 * questions);
    });

    // Local quiz sessions
    localQuizzes.forEach(r => {
      const questions = r.questions?.length || 0;
      const correct = r.answers?.filter((ans: any, i: number) => ans === r.questions[i]?.correctAnswer).length || 0;
      totalQuestions += questions;
      totalCorrect += correct;
    });

    // Mock test sessions (score out of 1600, convert to questions)
    mockTestSessions.forEach(session => {
      totalQuestions += 154; // Standard SAT question count
      totalCorrect += Math.round((session.total_score / 1600) * 154);
    });

    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Calculate total study time
    const studyTimeSeconds = allAttempts.reduce((sum, q) => sum + (q.time_spent || 0), 0);
    const studyTimeMinutes = Math.floor(studyTimeSeconds / 60);
    const studyTime = studyTimeMinutes > 60 ? 
      `${Math.floor(studyTimeMinutes / 60)}h ${studyTimeMinutes % 60}m` : 
      `${studyTimeMinutes}m`;

    return {
      totalQuizzes,
      totalMarathons,
      totalMockTests,
      totalQuestions,
      overallAccuracy,
      studyTime,
      totalSessions: totalQuizzes + totalMarathons + totalMockTests
    };
  }, [marathonSessions, quizSessions, mockTestSessions, allAttempts, userName]);

  const isDaily = selectedTimeFilter === 'daily';
  const isMonthly = selectedTimeFilter === 'monthly';
  const isAllTime = selectedTimeFilter === 'all-time';
  
  const groups = isMonthly ? monthlyGroups : groupedSessions;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <h1 className="text-xl font-bold text-foreground">Trends</h1>
            </div>
            
            {/* Time Filter Tabs */}
            <div className="flex gap-2">
              {(['daily', 'monthly', 'all-time'] as TimeFilter[]).map((filter) => (
                <Button
                  key={filter}
                  variant={selectedTimeFilter === filter ? 'default' : 'ghost'}
                  onClick={() => setSelectedTimeFilter(filter)}
                  className="text-sm"
                >
                  {filter === 'daily' ? 'Daily' : filter === 'monthly' ? 'Monthly' : 'All-time'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Sessions */}
        <div className="space-y-8">
          {isAllTime ? (
            /* All-time summary view */
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <Calendar className="h-5 w-5 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-900">All-time Summary</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Session Activities - Left (1/3) */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Session Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                        <Brain className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Quizzes</span>
                          <span className="text-2xl font-bold text-purple-600">{allTimeSummary.totalQuizzes}</span>
                        </div>
                        <div className="text-sm text-gray-600">Practice sessions completed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                        <Target className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Marathons</span>
                          <span className="text-2xl font-bold text-orange-600">{allTimeSummary.totalMarathons}</span>
                        </div>
                        <div className="text-sm text-gray-600">Extended practice sessions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                        <FileText className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Mock Tests</span>
                          <span className="text-2xl font-bold text-green-600">{allTimeSummary.totalMockTests}</span>
                        </div>
                        <div className="text-sm text-gray-600">Full-length SAT practice</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Trends - Right (2/3) */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overall Stats */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">{allTimeSummary.overallAccuracy}%</div>
                        <div className="text-sm text-gray-600">Overall Accuracy</div>
                        <div className="text-xs text-green-600 mt-1">
                          {allTimeSummary.overallAccuracy > 75 ? 'Excellent performance!' : 'Keep improving!'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">{allTimeSummary.totalQuestions}</div>
                        <div className="text-sm text-gray-600">Questions Attempted</div>
                        <div className="text-xs text-gray-500 mt-1">{allTimeSummary.studyTime} study time</div>
                      </div>
                    </div>

                    {/* All-time Skills Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">All-time Skills Performance</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Get skills from all sessions */}
                        {(() => {
                          const allTopics: { topic: string; sessions: number; totalAccuracy: number }[] = [];
                          
                          // Marathon sessions
                          marathonSessions.forEach(session => {
                            const accuracy = session.total_questions > 0 ? 
                              Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 0;
                            const topics = session.subjects || ['Mixed'];
                            topics.forEach((topic: string) => {
                              const existingTopic = allTopics.find(t => t.topic === topic);
                              if (existingTopic) {
                                existingTopic.sessions += 1;
                                existingTopic.totalAccuracy += accuracy;
                              } else {
                                allTopics.push({ topic, sessions: 1, totalAccuracy: accuracy });
                              }
                            });
                          });

                          // Quiz sessions
                          quizSessions.forEach(session => {
                            const accuracy = Math.round(session.score_percentage || 0);
                            const topics = session.topics || [session.subject];
                            topics.forEach((topic: string) => {
                              const existingTopic = allTopics.find(t => t.topic === topic);
                              if (existingTopic) {
                                existingTopic.sessions += 1;
                                existingTopic.totalAccuracy += accuracy;
                              } else {
                                allTopics.push({ topic, sessions: 1, totalAccuracy: accuracy });
                              }
                            });
                          });

                          // Mock test sessions
                          mockTestSessions.forEach(session => {
                            const accuracy = Math.round((session.total_score / 1600) * 100);
                            const topics = ['Math', 'Reading', 'Writing'];
                            topics.forEach((topic: string) => {
                              const existingTopic = allTopics.find(t => t.topic === topic);
                              if (existingTopic) {
                                existingTopic.sessions += 1;
                                existingTopic.totalAccuracy += accuracy;
                              } else {
                                allTopics.push({ topic, sessions: 1, totalAccuracy: accuracy });
                              }
                            });
                          });

                          return allTopics.map(skill => ({
                            topic: skill.topic,
                            accuracy: Math.round(skill.totalAccuracy / skill.sessions)
                          })).slice(0, 6);
                        })().map((skill, index) => (
                          <div key={index} className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-700">{skill.topic}</span>
                            <span className={`text-sm font-medium ${skill.accuracy >= 80 ? 'text-green-600' : skill.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {skill.accuracy}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Insights for all-time */}
                    <AIInsights 
                      userName={userName} 
                      targetDate="all-time"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.date} className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-semibold text-gray-900">{group.displayDate}</h2>
                </div>

                {/* Layout: Sessions Left (1/3) + Performance Trends Right (2/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Session Activities - Left (1/3) */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-lg">Session Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isMonthly ? (
                        /* Monthly summary view */
                        <>
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                              <Brain className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Quizzes</span>
                                <span className="text-2xl font-bold text-purple-600">{(group as MonthGroup).counts.quizzes}</span>
                              </div>
                              <div className="text-sm text-gray-600">Practice sessions completed</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                              <Target className="h-4 w-4 text-orange-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Marathons</span>
                                <span className="text-2xl font-bold text-orange-600">{(group as MonthGroup).counts.marathons}</span>
                              </div>
                              <div className="text-sm text-gray-600">Extended practice sessions</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                              <FileText className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Mock Tests</span>
                                <span className="text-2xl font-bold text-green-600">{(group as MonthGroup).counts.mocktests}</span>
                              </div>
                              <div className="text-sm text-gray-600">Full-length SAT practice</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Daily detailed view */
                        (group as DayGroup).sessions.map((session) => (
                          <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                              {session.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{session.title}</span>
                                <span className="text-xs text-gray-500">{session.time}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {session.questions} questions • {session.accuracy}% accuracy
                                {session.score && (
                                  <span className="ml-2">Score: <span className="font-medium">{session.score}/1600</span></span>
                                )}
                              </div>
                              {session.topics.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {session.topics.slice(0, 3).map((topic, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Performance Trends - Right (2/3) */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Stats */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900">{group.dayStats.overallAccuracy}%</div>
                          <div className="text-sm text-gray-600">Overall Accuracy</div>
                          <div className="text-xs text-green-600 mt-1">
                            {group.dayStats.overallAccuracy > 75 ? 'Excellent performance!' : 'Keep improving!'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900">{group.dayStats.totalQuestions}</div>
                          <div className="text-sm text-gray-600">Questions Attempted</div>
                          <div className="text-xs text-gray-500 mt-1">{group.dayStats.studyTime} study time</div>
                        </div>
                      </div>

                      {/* Skills Tested */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {isMonthly ? 'Skills Tested This Month' : 'Skills Tested Today'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {(isMonthly ? (group as MonthGroup).sessions : (group as DayGroup).sessions).reduce((allTopics: { topic: string; accuracy: number }[], session) => {
                            session.topics.forEach(topic => {
                              const existingTopic = allTopics.find(t => t.topic === topic);
                              if (existingTopic) {
                                existingTopic.accuracy = Math.round((existingTopic.accuracy + session.accuracy) / 2);
                              } else {
                                allTopics.push({ topic, accuracy: session.accuracy });
                              }
                            });
                            return allTopics;
                          }, []).slice(0, 6).map((skill, index) => (
                            <div key={index} className="flex justify-between items-center py-2">
                              <span className="text-sm text-gray-700">{skill.topic}</span>
                              <span className={`text-sm font-medium ${skill.accuracy >= 80 ? 'text-green-600' : skill.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {skill.accuracy}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Insights - Pass the target date with monthly support */}
                      <AIInsights 
                        userName={userName} 
                        targetDate={isMonthly ? `${group.date}-01` : group.date} 
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No sessions found</h3>
              <p>Start practicing to see your learning trends here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendsPage;
