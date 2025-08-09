import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/timeUtils';

interface PerformanceOverviewProps {
  userName: string;
}

type ViewMode = 'strongest' | 'improvement' | 'fastest' | 'timeSink';

interface SkillStats {
  skill: string; // aggregated across subjects
  total: number;
  correct: number;
  accuracy: number; // 0-100
  totalTime: number; // seconds
  avgTime: number; // seconds per question
}

const MIN_ATTEMPTS = 3; // small threshold to avoid noisy rankings

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ userName }) => {
  const [mode, setMode] = useState<ViewMode>('strongest');

  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['performance-overview-attempts', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [] as Array<{ topic: string | null; is_correct: boolean | null; time_spent: number | null }>;

      // Get data from quiz_results and marathon_sessions instead of question_attempts_v2
      const [quizResults, marathonSessions] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('topics, correct_answers, total_questions, time_taken')
          .eq('user_id', user.user.id),
        
        supabase
          .from('marathon_sessions')
          .select('subjects, correct_answers, total_questions')
          .eq('user_id', user.user.id)
      ]);

      const attempts: Array<{ topic: string | null; is_correct: boolean | null; time_spent: number | null }> = [];

      // Process quiz results
      if (quizResults.data) {
        quizResults.data.forEach(quiz => {
          const avgTimePerQuestion = quiz.time_taken ? Math.round(quiz.time_taken / quiz.total_questions) : 0;
          const topics = quiz.topics || [];
          
          topics.forEach(topic => {
            // Estimate correct/incorrect distribution across topics
            const questionsPerTopic = Math.ceil(quiz.total_questions / topics.length);
            const correctPerTopic = Math.ceil(quiz.correct_answers / topics.length);
            
            for (let i = 0; i < questionsPerTopic; i++) {
              attempts.push({
                topic,
                is_correct: i < correctPerTopic,
                time_spent: avgTimePerQuestion
              });
            }
          });
        });
      }

      // Process marathon sessions 
      if (marathonSessions.data) {
        marathonSessions.data.forEach(session => {
          const subjects = session.subjects || [];
          const totalQuestions = session.total_questions || 0;
          const correctAnswers = session.correct_answers || 0;
          
          // Create generic topic entries for marathon sessions
          const questionsPerSubject = Math.ceil(totalQuestions / Math.max(subjects.length, 1));
          const correctPerSubject = Math.ceil(correctAnswers / Math.max(subjects.length, 1));
          
          subjects.forEach(subject => {
            const topicName = subject === 'math' ? 'Mathematics' : subject === 'english' ? 'Reading & Writing' : 'Mixed Practice';
            
            for (let i = 0; i < questionsPerSubject; i++) {
              attempts.push({
                topic: topicName,
                is_correct: i < correctPerSubject,
                time_spent: 60 // Estimate 60 seconds per question for marathon
              });
            }
          });
        });
      }

      console.log('Performance Overview data:', { quizResults: quizResults.data?.length, marathonSessions: marathonSessions.data?.length, totalAttempts: attempts.length });
      
      return attempts;
    },
    enabled: !!userName,
    staleTime: 60_000,
  });

  const bySkill: SkillStats[] = useMemo(() => {
    const map = new Map<string, { total: number; correct: number; totalTime: number }>();

    attempts.forEach((a) => {
      const skill = (a.topic || '').trim();
      if (!skill) return;
      const entry = map.get(skill) || { total: 0, correct: 0, totalTime: 0 };
      entry.total += 1;
      entry.correct += a.is_correct ? 1 : 0;
      entry.totalTime += Math.max(0, a.time_spent || 0);
      map.set(skill, entry);
    });

    const list: SkillStats[] = Array.from(map.entries()).map(([skill, v]) => {
      const accuracy = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
      const avgTime = v.total > 0 ? Math.round(v.totalTime / v.total) : 0;
      return { skill, total: v.total, correct: v.correct, accuracy, totalTime: v.totalTime, avgTime };
    });

    return list;
  }, [attempts]);

  const top5: SkillStats[] = useMemo(() => {
    const eligible = bySkill.filter((s) => s.total >= MIN_ATTEMPTS);
    if (eligible.length === 0) return [];

    const sorted = [...eligible];
    switch (mode) {
      case 'strongest':
        sorted.sort((a, b) => (b.accuracy - a.accuracy) || (b.total - a.total));
        break;
      case 'improvement':
        sorted.sort((a, b) => (a.accuracy - b.accuracy) || (b.total - a.total));
        break;
      case 'fastest':
        sorted.sort((a, b) => (a.avgTime - b.avgTime) || (b.total - a.total));
        break;
      case 'timeSink':
        sorted.sort((a, b) => (b.avgTime - a.avgTime) || (b.total - a.total));
        break;
    }
    return sorted.slice(0, 5);
  }, [bySkill, mode]);

  const renderRow = (s: SkillStats) => (
    <div key={s.skill} className="flex items-center justify-between rounded-md border px-4 py-3">
      <div className="min-w-0">
        <div className="font-medium truncate">{s.skill}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {s.correct}/{s.total} correct • {s.accuracy}% accuracy • avg {formatTime(s.avgTime)} per question
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-background">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Performance overview</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={mode === 'strongest' ? 'default' : 'outline'} size="sm" onClick={() => setMode('strongest')}>
            Strongest skill
          </Button>
          <Button variant={mode === 'improvement' ? 'default' : 'outline'} size="sm" onClick={() => setMode('improvement')}>
            Top areas of improvement
          </Button>
          <Button variant={mode === 'fastest' ? 'default' : 'outline'} size="sm" onClick={() => setMode('fastest')}>
            Fastest skill
          </Button>
          <Button variant={mode === 'timeSink' ? 'default' : 'outline'} size="sm" onClick={() => setMode('timeSink')}>
            Biggest Time Sink
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading your performance...</div>
        ) : top5.length === 0 ? (
          <div className="text-sm text-muted-foreground">Not enough data yet. Practice a few more questions to see insights.</div>
        ) : (
          <div className="space-y-3">
            {top5.map(renderRow)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceOverview;
