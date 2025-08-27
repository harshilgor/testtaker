import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Target, Clock, Activity, Lightbulb, Zap, AlertCircle, Award, Calendar } from 'lucide-react';

interface PerformanceSummaryProps {
  userName: string;
}

interface PacingData {
  subject: string;
  avgTime: string;
  targetTime: string;
  hasData: boolean;
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ userName }) => {
  // Fetch recent data for pacing analysis
  const { data: recentAttempts = [] } = useQuery({
    queryKey: ['recent-attempts-pacing', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('created_at, time_spent, subject, is_correct')
        .eq('user_id', user.user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: recentQuizzes = [] } = useQuery({
    queryKey: ['recent-quizzes-pacing', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent quizzes:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Calculate pacing data
  const pacingData = useMemo((): PacingData[] => {
    // Math section
    const mathAttempts = recentAttempts.filter(a => 
      a.subject?.toLowerCase().includes('math')
    );
    const mathQuizzes = recentQuizzes.filter(q => 
      q.subject?.toLowerCase().includes('math')
    );
    
    const mathTotalTime = mathAttempts.reduce((sum, a) => sum + (a.time_spent || 0), 0);
    const mathTotalQuestions = mathAttempts.length + 
      mathQuizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0);
    
    const mathAvgTime = mathTotalQuestions > 0 ? mathTotalTime / mathTotalQuestions : 0;
    const mathAvgTimeFormatted = mathAvgTime > 0 ? 
      `${Math.floor(mathAvgTime / 60)}:${String(Math.floor(mathAvgTime % 60)).padStart(2, '0')}` : 
      '0:00';

    // Reading & Writing section
    const rwAttempts = recentAttempts.filter(a => 
      a.subject?.toLowerCase().includes('reading') || 
      a.subject?.toLowerCase().includes('writing') ||
      a.subject?.toLowerCase().includes('verbal')
    );
    const rwQuizzes = recentQuizzes.filter(q => 
      q.subject?.toLowerCase().includes('reading') || 
      q.subject?.toLowerCase().includes('writing') ||
      q.subject?.toLowerCase().includes('verbal')
    );
    
    const rwTotalTime = rwAttempts.reduce((sum, a) => sum + (a.time_spent || 0), 0);
    const rwTotalQuestions = rwAttempts.length + 
      rwQuizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0);
    
    const rwAvgTime = rwTotalQuestions > 0 ? rwTotalTime / rwTotalQuestions : 0;
    const rwAvgTimeFormatted = rwAvgTime > 0 ? 
      `${Math.floor(rwAvgTime / 60)}:${String(Math.floor(rwAvgTime % 60)).padStart(2, '0')}` : 
      '0:00';

    return [
      {
        subject: 'Math',
        avgTime: mathAvgTimeFormatted,
        targetTime: '~1:25',
        hasData: mathTotalQuestions > 0
      },
      {
        subject: 'Reading & Writing',
        avgTime: rwAvgTimeFormatted,
        targetTime: '~1:15',
        hasData: rwTotalQuestions > 0
      }
    ];
  }, [recentAttempts, recentQuizzes]);

  return (
    <Card className="bg-white border-0 shadow-sm h-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Time & Pacing Analysis</h3>
          <p className="text-sm text-gray-500">Section-by-Section Pacing</p>
        </div>

        {/* Pacing Sections */}
        <div className="space-y-4 mb-6">
          {pacingData.map((section, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">{section.subject}</h4>
                <Badge variant={section.hasData ? "default" : "secondary"} className="text-xs">
                  {section.hasData ? "Has Data" : "No Data"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Current avg. per question</span>
                  <span className="text-lg font-bold text-gray-900">{section.avgTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Target pacing</span>
                  <span className="text-sm text-gray-600">{section.targetTime} per question</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pacing Tips */}
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Pacing Tips</p>
              <p className="text-xs text-gray-600 mt-1">
                Aim for 1:15-1:25 per question to complete all sections on time
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceSummary;
