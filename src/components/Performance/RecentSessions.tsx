import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Brain, FileText } from 'lucide-react';
import { useRecentSessions } from '@/hooks/useRecentSessions';

interface RecentSessionsProps {
  userName: string;
  onViewTrends?: () => void;
}

const RecentSessions: React.FC<RecentSessionsProps> = ({ userName, onViewTrends }) => {
  // Use the optimized hook for instant loading with caching
  const { 
    sessions: recentSessions, 
    isLoading, 
    hasCachedData,
    isInitialLoad 
  } = useRecentSessions({ 
    userName,
    enabled: !!userName
  });

  // Log optimization status for debugging
  React.useEffect(() => {
    if (hasCachedData) {
      console.log('⚡ Recent Sessions: Loaded instantly from cache!', { 
        sessionCount: recentSessions.length,
        userName 
      });
    } else if (isLoading) {
      console.log('🔄 Recent Sessions: Loading from server...', { userName });
    }
  }, [hasCachedData, isLoading, recentSessions.length, userName]);

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
            {/* Show subtle loading indicator only when no cached data and still loading */}
            {isLoading && !hasCachedData && (
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  Loading recent sessions...
                </div>
              </div>
            )}
            
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
