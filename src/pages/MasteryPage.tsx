import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

interface AttemptRow {
  topic?: string | null;
  subject?: string | null;
  difficulty?: string | null;
  is_correct: boolean;
  created_at: string;
}

interface SkillMastery {
  skill: string;
  subject: 'math' | 'english';
  totalXP: number;
  totalXPWithDecay: number;
  lastPracticedDays: number;
  status: 'NOVICE' | 'PRO' | 'GOD';
  atRisk: boolean;
}

const XP_FOR = {
  easy: 10,
  medium: 25,
  hard: 50,
};

const PENALTY_INCORRECT = 15;

function calcBaseXP(attempts: AttemptRow[]): Map<string, { xp: number; last: Date | null; subject: 'math' | 'english' }> {
  const bySkill = new Map<string, { xp: number; last: Date | null; subject: 'math' | 'english' }>();
  attempts.forEach(a => {
    const skillName = (a.topic || 'General').toString();
    const key = skillName;
    const prev = bySkill.get(key) || { xp: 0, last: null, subject: 'math' };
    const diff = (a.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard';
    const gained = a.is_correct ? (XP_FOR[diff] || 25) : -PENALTY_INCORRECT;
    const when = new Date(a.created_at);
    const last = prev.last && prev.last > when ? prev.last : when;
    const subject = (a.subject?.toLowerCase() === 'math' || a.subject?.toLowerCase() === 'english') 
      ? a.subject.toLowerCase() as 'math' | 'english' 
      : prev.subject;
    bySkill.set(key, { xp: prev.xp + gained, last, subject });
  });
  return bySkill;
}

function applyDecay(xp: number, last: Date | null): { decayed: number; daysSince: number; atRisk: boolean } {
  if (!last) return { decayed: xp, daysSince: 0, atRisk: false };
  const now = new Date();
  const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  // Decay only after 14 days of inactivity, only if user is PRO but not GOD
  let decayed = xp;
  let atRisk = false;
  if (xp >= 1000 && xp < 2000 && days > 14) {
    atRisk = true;
    const excessDays = days - 14;
    decayed = Math.max(0, xp - 5 * excessDays);
  }
  // Once GOD, no decay
  if (xp >= 2000) {
    return { decayed: xp, daysSince: days, atRisk: false };
  }
  return { decayed, daysSince: days, atRisk };
}

const MasteryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('topic, subject, difficulty, is_correct, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5000);
      if (!error && data) setAttempts(data as AttemptRow[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const mastery: SkillMastery[] = useMemo(() => {
    const map = calcBaseXP(attempts);
    const entries: SkillMastery[] = [];
    for (const [skill, { xp, last, subject }] of map.entries()) {
      const { decayed, daysSince, atRisk } = applyDecay(xp, last);
      const status: SkillMastery['status'] = decayed >= 2000 ? 'GOD' : decayed >= 1000 ? 'PRO' : 'NOVICE';
      entries.push({
        skill,
        subject,
        totalXP: Math.max(0, xp),
        totalXPWithDecay: Math.max(0, decayed),
        lastPracticedDays: daysSince,
        status,
        atRisk,
      });
    }
    // Sort by highest XP
    entries.sort((a, b) => b.totalXPWithDecay - a.totalXPWithDecay);
    return entries;
  }, [attempts]);

  const getProgress = (xp: number) => Math.min(100, (xp / 2000) * 100);

  const handlePractice = (skill: string, subject: 'math' | 'english') => {
    // Store the selected skill and navigate to quiz
    localStorage.setItem('selectedQuizTopic', JSON.stringify({
      subject,
      topic: skill,
      questionCount: 10
    }));
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mastery</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/quiz')}>Go to Quiz</Button>
            <Button onClick={() => navigate('/')}>Dashboard</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Each skill has 2000 XP. Reach 1000 XP to earn the PRO badge. Reach 2000 XP to become GOD. Incorrect answers deduct 15 XP. If you are PRO and inactive for 14+ days, XP decays by 5/day until you practice again. GOD level never decays.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : mastery.length === 0 ? (
              <div className="text-center text-gray-600 py-12">No attempts yet. Start a quiz to begin earning XP.</div>
            ) : (
              <div className="space-y-4">
                {mastery.map(item => {
                  const purple = item.status !== 'NOVICE';
                  const progress = getProgress(item.totalXPWithDecay);
                  const nextMilestone = item.totalXPWithDecay >= 2000 ? 2000 : item.totalXPWithDecay >= 1000 ? 2000 : 1000;
                  const toNext = Math.max(0, nextMilestone - item.totalXPWithDecay);
                  return (
                    <div key={item.skill} className="p-4 rounded-lg border bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`text-xs px-2 py-1 rounded-full ${item.status === 'GOD' ? 'bg-yellow-100 text-yellow-800' : item.status === 'PRO' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                            {item.status}
                          </div>
                          <div className="text-base font-semibold text-gray-900">{item.skill}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-700 font-medium">
                            {Math.round(item.totalXPWithDecay)} / 2000 XP
                          </div>
                          <Button
                            onClick={() => handlePractice(item.skill, item.subject)}
                            size="sm"
                            className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Practice
                          </Button>
                        </div>
                      </div>
                      <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-3 ${item.status === 'GOD' ? 'bg-yellow-500' : purple ? 'bg-purple-600' : 'bg-blue-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                        <div>
                          {item.status === 'PRO' && item.totalXPWithDecay < 2000 && (
                            <span>Practice {Math.ceil(toNext)} more XP to reach GOD.</span>
                          )}
                          {item.status === 'NOVICE' && (
                            <span>Earn {Math.ceil(toNext)} XP to reach PRO.</span>
                          )}
                          {item.status === 'GOD' && (
                            <span>GOD level achieved. No decay.</span>
                          )}
                        </div>
                        <div className={`text-right ${item.atRisk ? 'text-purple-700 font-medium' : ''}`}>
                          {item.lastPracticedDays > 0 ? `${item.lastPracticedDays}d since last practice` : 'Practiced today'}
                          {item.atRisk && ' • At risk (decaying)'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasteryPage;
