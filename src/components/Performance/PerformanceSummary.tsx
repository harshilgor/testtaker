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
  // Fetch recent data for pacing analysis (last 30 days)
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

      if (error) return [];
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
        .select('created_at, subject, total_questions, time_taken')
        .eq('user_id', user.user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    },
    enabled: !!userName,
  });

  const { data: recentMarathons = [] } = useQuery({
    queryKey: ['recent-marathons-pacing', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('created_at, start_time, end_time, subjects, total_questions')
        .eq('user_id', user.user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    },
    enabled: !!userName,
  });

  const { data: recentMocks = [] } = useQuery({
    queryKey: ['recent-mocks-pacing', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data, error } = await supabase
        .from('mock_test_results')
        .select('completed_at, created_at, time_taken')
        .eq('user_id', user.user.id)
        .or(`completed_at.gte.${since.toISOString()},created_at.gte.${since.toISOString()}`)
        .order('completed_at', { ascending: false });

      if (error) return [];
      return data || [];
    },
    enabled: !!userName,
  });

  // Calculate pacing data across all modes
  const pacingData = useMemo((): PacingData[] => {
    // Helpers
    const isMath = (s?: string) => (s || '').toLowerCase().includes('math');
    const isRW = (s?: string) => {
      const v = (s || '').toLowerCase();
      return v.includes('reading') || v.includes('writing') || v.includes('verbal');
    };

    // Accumulators in seconds and counts
    let mathSeconds = 0; let mathQuestions = 0;
    let rwSeconds = 0; let rwQuestions = 0;

    // Attempts: exact per-question timing by subject
    recentAttempts.forEach((a: any) => {
      const sec = a.time_spent || 0;
      if (isMath(a.subject)) {
        mathSeconds += sec; mathQuestions += 1;
      } else if (isRW(a.subject)) {
        rwSeconds += sec; rwQuestions += 1;
      }
    });

    // Quizzes: use time_taken / total_questions, bucket by subject
    recentQuizzes.forEach((q: any) => {
      const totalQ = q.total_questions || 0;
      const totalSec = q.time_taken || 0; // seconds
      if (!totalQ || !totalSec) return;
      if (isMath(q.subject)) {
        mathSeconds += totalSec; mathQuestions += totalQ;
      } else if (isRW(q.subject)) {
        rwSeconds += totalSec; rwQuestions += totalQ;
      }
    });

    // Marathon sessions: use (end - start) and distribute seconds/questions to subjects
    recentMarathons.forEach((m: any) => {
      const start = m.start_time ? new Date(m.start_time) : (m.created_at ? new Date(m.created_at) : null);
      const end = m.end_time ? new Date(m.end_time) : null;
      const seconds = (start && end) ? Math.max(0, (end.getTime() - start.getTime()) / 1000) : 0;
      const totalQ = m.total_questions || 0;
      const subjects: string[] = Array.isArray(m.subjects) ? m.subjects : [];
      const hasMath = subjects.some(s => isMath(s));
      const hasRW = subjects.some(s => isRW(s));

      if (hasMath && !hasRW) {
        mathSeconds += seconds; mathQuestions += totalQ;
      } else if (!hasMath && hasRW) {
        rwSeconds += seconds; rwQuestions += totalQ;
      } else if (hasMath && hasRW) {
        // Split evenly when both subjects selected
        mathSeconds += seconds / 2; rwSeconds += seconds / 2;
        mathQuestions += totalQ / 2; rwQuestions += totalQ / 2;
      } else {
        // Unknown: ignore to avoid skewing
      }
    });

    // Mock tests: split by typical SAT sections (20 Math, 44 RW) if no finer data
    recentMocks.forEach((m: any) => {
      const sec = m.time_taken || 0; // seconds
      if (sec > 0) {
        // Distribute by 20/44 questions
        const mathQ = 20; const rwQ = 44; const totalQ = mathQ + rwQ;
        const mathShare = sec * (mathQ / totalQ);
        const rwShare = sec * (rwQ / totalQ);
        mathSeconds += mathShare; rwSeconds += rwShare;
        mathQuestions += mathQ; rwQuestions += rwQ;
      }
    });

    // Compute averages (seconds per question)
    const mathAvgSec = mathQuestions > 0 ? mathSeconds / mathQuestions : 0;
    const rwAvgSec = rwQuestions > 0 ? rwSeconds / rwQuestions : 0;

    const format = (sec: number) => sec > 0
      ? `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
      : '0:00';

    return [
      {
        subject: 'Math',
        avgTime: format(mathAvgSec),
        targetTime: '~1:25',
        hasData: mathQuestions > 0
      },
      {
        subject: 'Reading & Writing',
        avgTime: format(rwAvgSec),
        targetTime: '~1:15',
        hasData: rwQuestions > 0
      }
    ];
  }, [recentAttempts, recentQuizzes, recentMarathons, recentMocks]);

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
