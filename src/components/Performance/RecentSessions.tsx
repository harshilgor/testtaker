import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, FileText, Brain, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  type: 'Quiz Mode' | 'Marathon Mode' | 'Mock Test';
  date: string;
  time: string;
  accuracy?: number;
  score?: string;
  questionCount: number;
  topic: string;
  sessionData?: any;
}

interface RecentSessionsProps {
  userName: string;
}

const RecentSessions: React.FC<RecentSessionsProps> = ({ userName }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const fetchRecentSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent sessions from different tables
      const [marathonRes, quizRes, mockTestRes] = await Promise.all([
        supabase
          .from('marathon_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('mock_test_results')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(10)
      ]);

      const allSessions: Session[] = [];

      // Process marathon sessions
      if (marathonRes.data) {
        marathonRes.data.forEach(session => {
          const accuracy = session.total_questions > 0 ? 
            Math.round((session.correct_answers / session.total_questions) * 100) : 0;
          
          allSessions.push({
            id: session.id,
            type: 'Marathon Mode',
            date: new Date(session.created_at).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric' 
            }),
            time: new Date(session.created_at).toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            }),
            accuracy,
            questionCount: session.total_questions,
            topic: Array.isArray(session.subjects) ? 
              session.subjects.join(', ').replace(/,/g, ', ') : 'Mixed Topics',
            sessionData: session
          });
        });
      }

      // Process quiz results
      if (quizRes.data) {
        quizRes.data.forEach(quiz => {
          allSessions.push({
            id: quiz.id,
            type: 'Quiz Mode',
            date: new Date(quiz.created_at).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric' 
            }),
            time: new Date(quiz.created_at).toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            }),
            accuracy: quiz.score_percentage,
            questionCount: quiz.total_questions,
            topic: Array.isArray(quiz.topics) ? 
              quiz.topics.join(', ') : quiz.subject,
            sessionData: quiz
          });
        });
      }

      // Process mock test results
      if (mockTestRes.data) {
        mockTestRes.data.forEach(test => {
          allSessions.push({
            id: test.id,
            type: 'Mock Test',
            date: new Date(test.completed_at).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric' 
            }),
            time: new Date(test.completed_at).toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            }),
            score: `${test.total_score}/1600`,
            questionCount: 0,
            topic: `Full SAT Practice Test`,
            sessionData: test
          });
        });
      }

      // Sort all sessions by date
      allSessions.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });

      setSessions(allSessions.slice(0, 5)); // Show only latest 5
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSession = (session: Session) => {
    switch (session.type) {
      case 'Marathon Mode':
        // Navigate to marathon summary with session data
        navigate('/marathon', { 
          state: { 
            showSummary: true, 
            sessionData: session.sessionData 
          } 
        });
        break;
      case 'Quiz Mode':
        // Navigate to quiz summary with session data
        navigate('/quiz', { 
          state: { 
            showSummary: true, 
            sessionData: session.sessionData 
          } 
        });
        break;
      case 'Mock Test':
        // Navigate to SAT mock test results
        navigate('/sat-mock-test', { 
          state: { 
            showResults: true, 
            sessionData: session.sessionData 
          } 
        });
        break;
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'Quiz Mode':
        return <Brain className="h-4 w-4" />;
      case 'Marathon Mode':
        return <Clock className="h-4 w-4" />;
      case 'Mock Test':
        return <FileText className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'Quiz Mode':
        return 'bg-blue-100 text-blue-800';
      case 'Marathon Mode':
        return 'bg-purple-100 text-purple-800';
      case 'Mock Test':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Sessions</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg bg-gray-50 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/3 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No recent sessions found</p>
            <p className="text-sm">Complete some quizzes or tests to see your history</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="relative p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(session.type)}`}>
                    {getSessionIcon(session.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-16">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{session.type}</h3>
                      {session.accuracy && (
                        <span className="inline-flex items-center text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {session.accuracy}%
                        </span>
                      )}
                      {session.score && (
                        <span className="text-xs font-medium text-gray-700">
                          {session.score}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-1">
                      {session.date} • {session.time}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {session.questionCount > 0 ? `${session.questionCount} Questions ` : ''}
                      ({session.topic})
                    </p>
                  </div>
                </div>
                
                {/* Review button in bottom right */}
                <div className="absolute bottom-3 right-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReviewSession(session)}
                    className="h-6 px-2 text-xs border-blue-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    title={session.type === 'Mock Test' ? 'View Analysis' : 'Review Session'}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-800">
            View All Sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSessions;