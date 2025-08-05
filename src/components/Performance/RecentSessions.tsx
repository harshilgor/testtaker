import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, FileText, Brain } from 'lucide-react';

interface Session {
  id: string;
  type: 'Quiz Mode' | 'Marathon Mode' | 'Mock Test';
  date: string;
  time: string;
  accuracy?: number;
  score?: string;
  questionCount: number;
  topic: string;
  hasReview?: boolean;
}

interface RecentSessionsProps {
  userName: string;
}

const RecentSessions: React.FC<RecentSessionsProps> = ({ userName }) => {
  // Mock data - in real app, this would come from props or API
  const sessions: Session[] = [
    {
      id: '1',
      type: 'Quiz Mode',
      date: 'Aug 28, 2025',
      time: '8:45 PM',
      accuracy: 82,
      questionCount: 25,
      topic: 'Reading Comprehension',
      hasReview: true
    },
    {
      id: '2',
      type: 'Marathon Mode',
      date: 'Aug 27, 2025',
      time: '4:20 PM',
      accuracy: 75,
      questionCount: 40,
      topic: 'Mixed Topics',
      hasReview: true
    },
    {
      id: '3',
      type: 'Mock Test',
      date: 'Aug 25, 2025',
      time: '10:00 AM',
      score: '1340/1600',
      questionCount: 0,
      topic: 'Full SAT Practice Test #5',
      hasReview: false
    },
    {
      id: '4',
      type: 'Quiz Mode',
      date: 'Aug 24, 2025',
      time: '7:15 PM',
      accuracy: 68,
      questionCount: 15,
      topic: 'Punctuation',
      hasReview: true
    }
  ];

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
        
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="relative p-4 border rounded-lg bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getStatusColor(session.type)}`}>
                  {getSessionIcon(session.type)}
                </div>
                
                <div className="flex-1 min-w-0 pr-8">
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
              
              {/* Small review button in bottom right */}
              <div className="absolute bottom-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                  title={session.type === 'Mock Test' ? 'View Analysis' : 'Review Mistakes'}
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
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