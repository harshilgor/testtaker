import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, BookOpen, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { prefetchRecentSessions, transformSessions, Session } from '@/services/recentSessionsService';

interface SessionsListProps {
  selectedSession: Session | null;
  onSessionSelect: (session: Session | null) => void;
}

const SessionsList: React.FC<SessionsListProps> = ({ selectedSession, onSessionSelect }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get user display name or email for the service
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const userName = authUser?.user_metadata?.full_name || authUser?.email || user.id;
        const sessionData = await prefetchRecentSessions(userName);
        const transformedSessions = transformSessions(sessionData);
        setSessions(transformedSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'Quiz';
      case 'marathon':
        return 'Marathon';
      case 'mocktest':
        return 'Mock Test';
      default:
        return type;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-blue-100 text-blue-700';
      case 'marathon':
        return 'bg-purple-100 text-purple-700';
      case 'mocktest':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Loading sessions...</p>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No sessions found. Complete some quizzes to see your sessions here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session.id === selectedSession?.id ? null : session)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedSession?.id === session.id
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getSessionTypeColor(session.type)}>
                    {getSessionTypeLabel(session.type)}
                  </Badge>
                  {session.subject && (
                    <span className="text-xs text-gray-500">{session.subject}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(session.date)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{session.questions} questions</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{session.accuracy}% accuracy</span>
                </div>
                {session.score && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Score: {session.score}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionsList;

