import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Target, Brain, FileText } from 'lucide-react';
import { useRecentSessions } from '@/hooks/useRecentSessions';
import SessionSummary from './SessionSummary';

interface RecentSessionsProps {
  userName: string;
  onViewTrends?: () => void;
}

const RecentSessions: React.FC<RecentSessionsProps> = ({ userName, onViewTrends }) => {
  const [selectedSession, setSelectedSession] = useState<{ id: string; type: 'marathon' | 'quiz' | 'mocktest' } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'marathon' | 'quiz' | 'mocktest'>('all');
  
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

  // Filter sessions by type
  const filteredSessions = useMemo(() => {
    if (activeTab === 'all') return recentSessions;
    return recentSessions.filter(session => session.type === activeTab);
  }, [recentSessions, activeTab]);

  // Count sessions by type for tab badges
  const sessionCounts = useMemo(() => {
    return {
      marathon: recentSessions.filter(s => s.type === 'marathon').length,
      quiz: recentSessions.filter(s => s.type === 'quiz').length,
      mocktest: recentSessions.filter(s => s.type === 'mocktest').length,
      all: recentSessions.length
    };
  }, [recentSessions]);

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

  const handleSessionClick = (sessionId: string, sessionType: 'marathon' | 'quiz' | 'mocktest') => {
    setSelectedSession({ id: sessionId, type: sessionType });
  };

  const handleCloseSessionSummary = () => {
    setSelectedSession(null);
  };

  const renderSessionList = (sessions: any[]) => {
    if (sessions.length === 0) {
      return (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">No Recent Sessions</h3>
          <p className="text-sm text-gray-500">
            Start practicing to see your recent activity here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Show subtle loading indicator only when no cached data and still loading */}
        {isLoading && !hasCachedData && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              Loading recent sessions...
            </div>
          </div>
        )}
        
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className="p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer border-gray-200 bg-white hover:bg-gray-50"
            onClick={() => handleSessionClick(session.id, session.type)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  {getSessionIcon(session.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {getSessionTypeLabel(session.type)}
                    </span>
                    {session.type === 'mocktest' && session.score && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5">
                        {session.score} pts
                      </Badge>
                    )}
                    {session.subject && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200">
                        {session.subject}
                      </Badge>
                    )}
                    {session.difficulty && session.difficulty !== 'mixed' && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border border-gray-200">
                        {session.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {session.questions} Questions • {formatDate(session.date)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-base font-semibold ${getAccuracyColor(session.accuracy)}`}>
                  {session.accuracy}%
                </div>
                <div className="text-xs text-gray-600">accuracy</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Sessions</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-gray-900 text-xs"
            onClick={onViewTrends}
          >
            View Trends
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-3 bg-white border border-gray-200 p-1 rounded-xl">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg">
              All {sessionCounts.all > 0 && <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-700">{sessionCounts.all}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="marathon" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg">
              Marathon {sessionCounts.marathon > 0 && <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-700">{sessionCounts.marathon}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="quiz" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg">
              Quiz {sessionCounts.quiz > 0 && <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-700">{sessionCounts.quiz}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="mocktest" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg">
              Mock Test {sessionCounts.mocktest > 0 && <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-700">{sessionCounts.mocktest}</Badge>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {renderSessionList(filteredSessions)}
          </TabsContent>
          
          <TabsContent value="marathon" className="mt-0">
            {renderSessionList(filteredSessions)}
          </TabsContent>
          
          <TabsContent value="quiz" className="mt-0">
            {renderSessionList(filteredSessions)}
          </TabsContent>
          
          <TabsContent value="mocktest" className="mt-0">
            {renderSessionList(filteredSessions)}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Session Summary Modal */}
      {selectedSession && (
        <SessionSummary
          sessionId={selectedSession.id}
          sessionType={selectedSession.type}
          onClose={handleCloseSessionSummary}
        />
      )}
    </Card>
  );
};

export default RecentSessions;
