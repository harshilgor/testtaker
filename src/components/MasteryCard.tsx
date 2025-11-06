import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

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
  let decayed = xp;
  let atRisk = false;
  if (xp >= 1000 && xp < 2000 && days > 14) {
    atRisk = true;
    const excessDays = days - 14;
    decayed = Math.max(0, xp - 5 * excessDays);
  }
  if (xp >= 2000) {
    return { decayed: xp, daysSince: days, atRisk: false };
  }
  return { decayed, daysSince: days, atRisk };
}

const MasteryCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
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
        status,
        atRisk,
      });
    }
    
    // Sort by closest to mastery (prioritize skills closest to next milestone)
    entries.sort((a, b) => {
      const getDistanceToNextMilestone = (skill: SkillMastery) => {
        const xp = skill.totalXPWithDecay;
        if (xp >= 2000) return 0; // Already GOD, no progress needed
        if (xp >= 1000) return 2000 - xp; // Distance to GOD
        return 1000 - xp; // Distance to PRO
      };
      
      const distanceA = getDistanceToNextMilestone(a);
      const distanceB = getDistanceToNextMilestone(b);
      
      // Sort by smallest distance (closest to mastery first)
      // If same distance, prefer higher XP
      if (distanceA === distanceB) {
        return b.totalXPWithDecay - a.totalXPWithDecay;
      }
      return distanceA - distanceB;
    });
    
    return entries;
  }, [attempts]);

  const stats = useMemo(() => {
    const totalSkills = mastery.length;
    const proSkills = mastery.filter(m => m.status === 'PRO').length;
    const godSkills = mastery.filter(m => m.status === 'GOD').length;
    const topSkills = mastery.slice(0, 3);
    
    return {
      totalSkills,
      proSkills,
      godSkills,
      topSkills,
      hasSkills: totalSkills > 0,
    };
  }, [mastery]);

  const handleViewMastery = () => {
    navigate('/mastery');
  };

  const handleSkillClick = (skill: string, subject: 'math' | 'english') => {
    // Navigate to marathon with skill-specific settings
    navigate('/marathon', {
      state: {
        marathonSettings: {
          subjects: [subject],
          difficulty: 'mixed',
          timedMode: false,
          calculatorEnabled: true,
          darkMode: false,
          fontSize: 'medium' as const,
          adaptiveLearning: true,
          skill: skill, // Skill-specific marathon
        }
      }
    });
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">Mastery</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats.hasSkills) {
    return (
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">Mastery</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-600 text-sm mb-4">
            Start practicing to track your skill mastery and see your progress.
          </p>
          <Button 
            variant="link" 
            className="p-0 h-auto text-blue-600" 
            onClick={handleViewMastery}
          >
            View mastery details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">Mastery</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4">
          You have mastered <span className="font-semibold text-gray-900">{stats.proSkills + stats.godSkills}</span> out of <span className="font-semibold text-gray-900">{stats.totalSkills}</span> skills.
        </p>

        {stats.topSkills.length > 0 && (
          <div className="space-y-2 mb-4">
            {stats.topSkills.map((skill, index) => (
              <div 
                key={skill.skill} 
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleSkillClick(skill.skill, skill.subject)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {skill.status !== 'NOVICE' && (
                    <div className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      skill.status === 'GOD' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {skill.status}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">{skill.skill}</span>
                </div>
                <span className="text-xs text-gray-600 ml-2 flex-shrink-0">
                  {Math.round(skill.totalXPWithDecay)} XP
                </span>
              </div>
            ))}
          </div>
        )}

        <Button 
          variant="link" 
          className="p-0 h-auto text-blue-600" 
          onClick={handleViewMastery}
        >
          View all mastery
        </Button>
      </CardContent>
    </Card>
  );
};

export default MasteryCard;

