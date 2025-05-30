
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Eye, Calendar, Target } from 'lucide-react';

interface MarathonSession {
  id: string;
  total_questions: number;
  correct_answers: number;
  difficulty: string;
  subjects: string[];
  created_at: string;
}

interface MarathonHistorySectionProps {
  marathonSessions: MarathonSession[];
  onViewResult: (session: MarathonSession) => void;
}

const MarathonHistorySection: React.FC<MarathonHistorySectionProps> = ({
  marathonSessions,
  onViewResult
}) => {
  if (marathonSessions.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span>Marathon History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No marathon sessions completed yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-orange-500" />
          <span>Marathon History ({marathonSessions.length} sessions)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marathonSessions.map((session) => {
            const accuracy = session.total_questions > 0 
              ? Math.round((session.correct_answers / session.total_questions) * 100) 
              : 0;
            
            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>{session.total_questions} questions</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.difficulty}
                    </Badge>
                  </div>
                  
                  {session.subjects && session.subjects.length > 0 && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500">Subjects:</span>
                      {session.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      accuracy >= 70 ? 'text-green-600' : 
                      accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {accuracy}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.correct_answers}/{session.total_questions}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewResult(session)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarathonHistorySection;
