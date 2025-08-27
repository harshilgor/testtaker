import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Target, Brain, FileText } from 'lucide-react';

interface RecentSessionsProps {
  userName: string;
  onViewTrends?: () => void;
}

interface Session {
  id: string;
  type: 'marathon' | 'quiz' | 'mocktest';
  date: string;
  questions: number;
  accuracy: number;
  subject?: string;
  difficulty?: string;
  score?: number;
}

const RecentSessions: React.FC<RecentSessionsProps> = ({ userName, onViewTrends }) => {
  const queryClient = useQueryClient();

  // Set up real-time listeners for all session types
  useEffect(() => {
    if (!userName) return;

    const channel = supabase
      .channel('sessions-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marathon_sessions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recent-marathon-sessions', userName] });
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
          queryClient.invalidateQueries({ queryKey: ['recent-quiz-sessions', userName] });
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
          queryClient.invalidateQueries({ queryKey: ['recent-mocktest-sessions', userName] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userName, queryClient]);
  // Fetch recent marathon sessions
  const { data: marathonSessions = [] } = useQuery({
    queryKey: ['recent-marathon-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching marathon sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch recent quiz results
  const { data: quizSessions = [] } = useQuery({
    queryKey: ['recent-quiz-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching quiz sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch recent mock test results
  const { data: mockTestSessions = [] } = useQuery({
    queryKey: ['recent-mocktest-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false })
        .limit(2);

      if (error) {
        console.error('Error fetching mock test sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Combine and sort all sessions
  const getAllSessions = (): Session[] => {
    const sessions: Session[] = [];

    // Add marathon sessions
    marathonSessions.forEach(session => {
      sessions.push({
        id: session.id,
        type: 'marathon',
        date: session.created_at,
        questions: session.total_questions || 0,
        accuracy: session.total_questions > 0 ? 
          Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 0,
        difficulty: session.difficulty || 'mixed'
      });
    });

    // Add quiz sessions (DB)
    quizSessions.forEach(session => {
      sessions.push({
        id: session.id,
        type: 'quiz',
        date: session.created_at,
        questions: session.total_questions || 0,
        accuracy: session.total_questions > 0 ? 
          Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : Math.round(session.score_percentage || 0),
        subject: session.subject || 'Mixed'
      });
    });

    // Add mock test sessions (DB)
    mockTestSessions.forEach(session => {
      const accuracy = Math.round((session.total_score / 1600) * 100);
      sessions.push({
        id: session.id,
        type: 'mocktest',
        date: session.completed_at,
        questions: 154,
        accuracy,
        score: session.total_score || 0
      });
    });

    // Add local quiz sessions as fallback (for unauthenticated users or offline sessions)
    try {
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const localQuizzes = (stored || []).filter((r: any) => r.userName === userName);
      localQuizzes.forEach((r: any, idx: number) => {
        const correct = r.answers.filter((ans: any, i: number) => ans === r.questions[i]?.correctAnswer).length;
        const total = r.questions?.length || 0;
        sessions.push({
          id: r.id || `local-quiz-${idx}-${r.date}`,
          type: 'quiz',
          date: r.date,
          questions: total,
          accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
          subject: r.subject || 'Mixed'
        });
      });
    } catch (e) {
      console.warn('Failed to parse local quiz results', e);
    }

    // Sort by date (most recent first) and take top 5
    return sessions
      .filter(s => !!s.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const recentSessions = getAllSessions();

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'marathon': return <Target className="h-4 w-4 text-orange-500" />;
      case 'quiz': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'mocktest': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'marathon': return 'Marathon';
      case 'quiz': return 'Quiz';
      case 'mocktest': return 'Mock Test';
      default: return 'Session';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-white h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700 text-xs"
            onClick={onViewTrends}
          >
            View Trends
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50">
                    {getSessionIcon(session.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {getSessionTypeLabel(session.type)}
                      </span>
                      {session.type === 'mocktest' && session.score && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          {session.score} pts
                        </Badge>
                      )}
                      {session.subject && (
                        <Badge variant="secondary" className="text-xs">
                          {session.subject}
                        </Badge>
                      )}
                      {session.difficulty && session.difficulty !== 'mixed' && (
                        <Badge variant="secondary" className="text-xs">
                          {session.difficulty}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.questions} Questions • {formatDate(session.date)}
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
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No Recent Sessions</h3>
            <p className="text-sm text-gray-500">
              Start practicing to see your recent activity here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSessions;
