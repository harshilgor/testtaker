import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useMemo } from 'react';

interface StudyTimeWidgetProps { 
  variant?: 'bare' | 'card' 
}

const StudyTimeWidget: React.FC<StudyTimeWidgetProps> = ({ variant = 'card' }) => {
  const { marathonSessions = [], quizResults = [], mockTests = [] } = useData();

  // Calculate today's study time
  const todayMinutes = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalMinutes = 0;

    // Marathon sessions
    for (const session of marathonSessions) {
      const endOrCreated = new Date(session.end_time || session.created_at);
      if (endOrCreated >= today) {
        const start = session.start_time ? new Date(session.start_time) : new Date(session.created_at);
        const end = session.end_time ? new Date(session.end_time) : new Date(session.created_at);
        if (start && end) {
          const diffMs = Math.max(0, end.getTime() - start.getTime());
          totalMinutes += diffMs / 60000;
        }
      }
    }

    // Quiz results
    for (const quiz of quizResults) {
      const qDate = new Date(quiz.created_at);
      if (qDate >= today) {
        const seconds = typeof quiz.time_taken === 'number' ? quiz.time_taken : 0;
        totalMinutes += seconds / 60;
      }
    }

    // Mock tests
    for (const mock of mockTests) {
      const mDate = new Date(m.completed_at || m.created_at || m.updated_at || Date.now());
      if (mDate >= today) {
        const seconds = typeof mock.time_taken === 'number' ? mock.time_taken : 0;
        if (seconds > 0) {
          totalMinutes += seconds / 60;
        } else {
          totalMinutes += 96; // Fallback estimate
        }
      }
    }

    return Math.round(totalMinutes);
  }, [marathonSessions, quizResults, mockTests]);

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const Content = (
    <div className="w-full h-full flex flex-col justify-between pb-4">
      <div className="text-center py-2">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
          <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
        </div>
        <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-0.5">
          {formatTime(todayMinutes)}
        </div>
        <div className="text-xs lg:text-sm text-gray-600">
          Study Time Today
        </div>
      </div>
    </div>
  );

  if (variant === 'bare') {
    return Content;
  }

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Study Time</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {Content}
      </CardContent>
    </Card>
  );
};

export default StudyTimeWidget;



