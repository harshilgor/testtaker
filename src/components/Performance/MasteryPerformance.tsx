import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { preloadDomainMappings, getCachedDomainMappings } from '@/services/masteryCacheService';

interface AttemptRow {
  topic?: string | null;
  subject?: string | null;
  difficulty?: string | null;
  is_correct: boolean;
  created_at: string;
}

interface SkillMastery {
  skill: string;
  domain: string;
  subject: 'math' | 'english';
  totalXP: number;
  totalXPWithDecay: number;
  status: 'NOVICE' | 'PRO' | 'GOD';
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

function applyDecay(xp: number, last: Date | null): number {
  if (!last) return xp;
  const now = new Date();
  const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  let decayed = xp;
  if (xp >= 1000 && xp < 2000 && days > 14) {
    const excessDays = days - 14;
    decayed = Math.max(0, xp - 5 * excessDays);
  }
  if (xp >= 2000) {
    return xp;
  }
  return decayed;
}

const MasteryPerformance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { questionAttempts, isInitialized } = useData();
  const [selectedSubject, setSelectedSubject] = useState<'english' | 'math'>('english');
  const [domainSkillMap, setDomainSkillMap] = useState<Map<string, { domain: string; subject: 'math' | 'english' }>>(new Map());

  // Load domain-skill mappings from cache first (instant), then preload if needed
  useEffect(() => {
    const loadDomainMappings = async () => {
      // Try cache first for instant loading
      const cached = getCachedDomainMappings();
      if (cached && cached.size > 0) {
        console.log('🚀 Using cached domain mappings (instant)');
        setDomainSkillMap(cached);
      } else {
        // Preload if not in cache
        const map = await preloadDomainMappings();
        setDomainSkillMap(map);
      }
    };
    
    loadDomainMappings();
  }, []);

  // Convert questionAttempts from DataContext to AttemptRow format (instant, no loading)
  const attempts: AttemptRow[] = useMemo(() => {
    if (!isInitialized || !questionAttempts.length) {
      return [];
    }
    
    // Convert to AttemptRow format - limit to 5000 most recent
    return questionAttempts
      .slice(0, 5000)
      .map(attempt => ({
        topic: attempt.topic || null,
        subject: attempt.subject || null,
        difficulty: attempt.difficulty || null,
        is_correct: attempt.is_correct,
        created_at: attempt.created_at
      }));
  }, [questionAttempts, isInitialized]);

  const mastery: SkillMastery[] = useMemo(() => {
    const map = calcBaseXP(attempts);
    const entries: SkillMastery[] = [];
    const skillsProcessed = new Set<string>();
    
    // First, add all skills from attempts (with XP)
    for (const [skill, { xp, last, subject }] of map.entries()) {
      const decayed = applyDecay(xp, last);
      const status: SkillMastery['status'] = decayed >= 2000 ? 'GOD' : decayed >= 1000 ? 'PRO' : 'NOVICE';
      
      // Get domain from mapping, default to 'Other' if not found
      const mapping = domainSkillMap.get(skill);
      entries.push({
        skill,
        domain: mapping?.domain || 'Other',
        subject,
        totalXP: Math.max(0, xp),
        totalXPWithDecay: Math.max(0, decayed),
        status,
      });
      skillsProcessed.add(skill);
    }
    
    // Then, add all available skills from question_bank with 0 XP if not already processed
    // This ensures we show all possible skills/domains even if user hasn't practiced them
    for (const [skill, info] of domainSkillMap.entries()) {
      if (!skillsProcessed.has(skill)) {
        entries.push({
          skill,
          domain: info.domain,
          subject: info.subject,
          totalXP: 0,
          totalXPWithDecay: 0,
          status: 'NOVICE',
        });
      }
    }
    
    entries.sort((a, b) => b.totalXPWithDecay - a.totalXPWithDecay);
    return entries;
  }, [attempts, domainSkillMap]);

  // Filter mastery by selected subject
  const filteredMastery = useMemo(() => {
    return mastery.filter(m => m.subject === selectedSubject);
  }, [mastery, selectedSubject]);

  // Calculate progress towards first goal of 1000 XP
  const getProgress = (xp: number) => Math.min(100, (xp / 1000) * 100);

  // Handle skill click to start marathon
  const handleSkillClick = (skill: string, subject: 'math' | 'english') => {
    // Store auto-selection in localStorage for marathon mode (large question count)
    const autoSelection = {
      subject: subject,
      topic: skill,
      questionCount: 50 // Marathon mode - large question count to teach the skill completely
    };
    localStorage.setItem('selectedQuizTopic', JSON.stringify(autoSelection));
    
    // Navigate to quiz page - it will auto-select and start the quiz
    navigate('/quiz');
  };

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Mastery
          </CardTitle>
          {/* Subject Toggle */}
          <div className="flex space-x-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setSelectedSubject('english')}
              className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${
                selectedSubject === 'english'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              R&W
            </button>
            <button
              onClick={() => setSelectedSubject('math')}
              className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${
                selectedSubject === 'math'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Math
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="max-h-[800px] overflow-y-auto">
        {!isInitialized ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMastery.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No Mastery Data</h3>
            <p className="text-sm text-gray-500">
              Start practicing to track your skill mastery
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredMastery.map(item => {
              const progress = getProgress(item.totalXPWithDecay);
              return (
                <div 
                  key={item.skill} 
                  onClick={() => handleSkillClick(item.skill, item.subject)}
                  className="p-3 rounded-lg border transition-all hover:shadow-md border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 text-sm truncate">{item.skill}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 flex-shrink-0 ml-2">
                      {Math.round(item.totalXPWithDecay)} / 1000 XP
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-2 ${
                        item.status === 'GOD' 
                          ? 'bg-yellow-500' 
                          : item.status === 'PRO' 
                          ? 'bg-purple-600' 
                          : 'bg-blue-500'
                      } transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MasteryPerformance;

