import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/utils/timeUtils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
interface TimePacingAnalysisProps {
  userName: string;
  mockTestResults: any[];
}

const TimePacingAnalysis: React.FC<TimePacingAnalysisProps> = ({ userName }) => {
  // Fetch last 30 days of attempts with time_spent and subject
  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['pacing-attempts-30', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [] as Array<{ time_spent: number; subject: string }>
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('time_spent, subject')
        .eq('user_id', user.user.id)
        .gte('created_at', since.toISOString());
      if (error) {
        console.error('Error fetching pacing attempts:', error);
        return [] as Array<{ time_spent: number; subject: string }>
      }
      return (data || []) as Array<{ time_spent: number; subject: string }>
    },
    enabled: !!userName,
    staleTime: 60_000,
  });

  const pacingData = useMemo(() => {
    const normalizeSubject = (s: string) => (s || '').toLowerCase();
    let mathCount = 0, mathTime = 0;
    let rwCount = 0, rwTime = 0;

    attempts.forEach((a: any) => {
      const subj = normalizeSubject(a.subject);
      const t = Number(a.time_spent || 0);
      if (!t || t <= 0) return;
      const isMath = subj.includes('math');
      const isRW = subj.includes('reading') || subj.includes('writing') || subj.includes('verbal') || subj.includes('rw');
      if (isMath) { mathCount++; mathTime += t; }
      else if (isRW) { rwCount++; rwTime += t; }
    });

    const mathAvg = mathCount ? Math.round(mathTime / mathCount) : 0;
    const rwAvg = rwCount ? Math.round(rwTime / rwCount) : 0;

    const mathTarget = 85; // seconds
    const rwTarget = 75; // seconds

    const statusFn = (avg: number, target: number, count: number) => {
      if (!count) return 'No Data';
      const diff = avg - target;
      if (Math.abs(diff) <= 5) return 'On Pace';
      return diff > 0 ? 'Too Slow' : 'Too Fast';
    };

    return {
      math: { avgTime: mathAvg, target: mathTarget, status: statusFn(mathAvg, mathTarget, mathCount) },
      readingWriting: { avgTime: rwAvg, target: rwTarget, status: statusFn(rwAvg, rwTarget, rwCount) }
    };
  }, [attempts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Pace': return 'bg-green-100 text-green-800';
      case 'Too Fast': return 'bg-yellow-100 text-yellow-800';
      case 'Too Slow': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">
          Your Time & Pacing Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section-by-Section Pacing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Math Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium text-gray-900">Math</h4>
                <Badge className={getStatusColor(pacingData.math.status)}>
                  {pacingData.math.status}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(pacingData.math.avgTime)} 
                  <span className="text-sm font-normal text-gray-500 ml-1">avg. per question</span>
                </div>
                <div className="text-sm text-gray-500">
                  Target: ~{formatTime(pacingData.math.target)} per question
                </div>
              </div>
            </div>

            {/* Reading & Writing Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium text-gray-900">Reading & Writing</h4>
                <Badge className={getStatusColor(pacingData.readingWriting.status)}>
                  {pacingData.readingWriting.status}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(pacingData.readingWriting.avgTime)}
                  <span className="text-sm font-normal text-gray-500 ml-1">avg. per question</span>
                </div>
                <div className="text-sm text-gray-500">
                  Target: ~{formatTime(pacingData.readingWriting.target)} per question
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimePacingAnalysis;