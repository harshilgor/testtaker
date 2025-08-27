import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SkillStats {
  skill: string;
  accuracy: number;
  questionsAttempted: number;
  avgTime: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface SkillInsightModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  subject: 'math' | 'reading-writing';
  stats: SkillStats;
}

interface SkillAIResponse {
  summary?: string;
  rootCauses?: string[];
  weaknesses?: string[];
  strengths?: string[];
  trends?: string[];
  benchmarks?: string[];
  recommendations?: string[];
  motivation?: string[];
  projections?: string[];
}

const Section: React.FC<{ title: string; items?: string[]; body?: string }> = ({ title, items, body }) => {
  if ((!items || items.length === 0) && !body) return null;
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      {body && <p className="text-sm text-gray-700">{body}</p>}
      {items && items.length > 0 && (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SkillInsightModal: React.FC<SkillInsightModalProps> = ({ open, onOpenChange, subject, stats }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState<SkillAIResponse | null>(null);

  const headerChips = useMemo(() => [
    { label: 'Accuracy', value: `${stats.accuracy}%` },
    { label: 'Solved', value: `${stats.questionsAttempted}` },
    { label: 'Avg. Time', value: `${stats.avgTime} sec` },
    { label: 'E/M/H', value: `${stats.difficultyBreakdown.easy}/${stats.difficultyBreakdown.medium}/${stats.difficultyBreakdown.hard}` },
  ], [stats]);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      setLoading(true);
      setError(null);
      setAi(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please sign in to generate insights.');
          setLoading(false);
          return;
        }

        // Build analysis payload with extra context pulled from attempts history
        const { data: attempts } = await supabase
          .from('question_attempts_v2')
          .select('is_correct,time_spent,difficulty,created_at,question_id')
          .eq('user_id', user.id)
          .eq('subject', subject === 'math' ? 'math' : 'english')
          .order('created_at', { ascending: true });

        let filteredAttempts: any[] = [];
        if (attempts && attempts.length > 0) {
          const qIds = attempts.map(a => a.question_id);
          const { data: qs } = await supabase
            .from('question_bank')
            .select('id, skill')
            .in('id', qIds.map((id: any) => parseInt(id?.toString?.() || id)))
            .limit(2000);
          const skillIdSet = new Set((qs || []).filter(q => q.skill === stats.skill).map(q => q.id.toString()));
          filteredAttempts = attempts.filter(a => skillIdSet.has(a.question_id?.toString?.() || a.question_id));
        }

        const analysisPayload = {
          subject,
          skill: stats.skill,
          summary: stats,
          attempts: filteredAttempts?.slice?.(-500) || [], // cap for token safety
        };

        const { data, error } = await supabase.functions.invoke('openai-insight-generator', {
          body: {
            skillAnalysisData: analysisPayload,
            tzOffsetMinutes: new Date().getTimezoneOffset(),
          }
        });

        if (error) {
          setError('Network error while generating insight.');
          setLoading(false);
          return;
        }

        if (data?.success) {
          setAi(data.analysis as SkillAIResponse);
        } else {
          setError(data?.error || 'Unable to generate insight right now.');
        }
      } catch (e) {
        setError('Unexpected error generating insights.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, subject, stats]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {stats.skill} — AI Insight
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {headerChips.map((c, i) => (
              <Badge key={i} variant="secondary">{c.label}: {c.value}</Badge>
            ))}
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your performance for tailored coaching suggestions...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>
          )}

          {!loading && !error && ai && (
            <div className="space-y-5">
              <Section title="Summary" body={ai.summary} />
              <Section title="Root Cause Analysis" items={ai.rootCauses} />
              <Section title="Weaknesses" items={ai.weaknesses} />
              <Section title="Strengths" items={ai.strengths} />
              <Section title="Progress & Trends" items={ai.trends} />
              <Section title="Comparative Benchmarks" items={ai.benchmarks} />
              <Section title="Personalized Recommendations" items={ai.recommendations} />
              <Section title="Motivation & Projections" items={[...(ai.motivation || []), ...(ai.projections || [])]} />
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              </div>
            </div>
          )}

          {!loading && !error && !ai && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              No insight yet. Click again if this persists.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillInsightModal;


