import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface SkillRow { skill: string | null; test: string | null; }

const LearnPage: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    // Load bookmarks from localStorage
    try {
      const userId = localStorage.getItem('userName') || 'Student';
      const ids = JSON.parse(localStorage.getItem(`bookmarked_questions_${userId}`) || '[]');
      const details = JSON.parse(localStorage.getItem(`bookmarked_question_details_${userId}`) || '{}');
      const list = (ids || []).map((id: any) => details[String(id)]).filter(Boolean);
      setBookmarks(list);
    } catch {}
  }, []);

  const { data: allSkills = [] } = useQuery({
    queryKey: ['all-skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_bank')
        .select('skill, test')
        .not('skill', 'is', null)
        .order('skill');
      if (error) {
        console.error('Failed to load skills', error);
        return [] as SkillRow[];
      }
      return (data || []) as SkillRow[];
    }
  });

  const grouped = useMemo(() => {
    const g: Record<string, string[]> = { 'Reading and Writing': [], 'Math': [] };
    (allSkills as SkillRow[]).forEach(r => {
      const test = (r.test || '').includes('Math') ? 'Math' : 'Reading and Writing';
      const s = r.skill || '';
      if (s && !g[test].includes(s)) g[test].push(s);
    });
    g['Reading and Writing'].sort();
    g['Math'].sort();
    return g;
  }, [allSkills]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Learn</h1>
        <p className="text-gray-600 mb-6">Pick a skill to get a reflection and guided practice with a voice coach.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4 space-y-4">
              {(['Reading and Writing','Math'] as const).map(section => (
                <div key={section}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{section}</h3>
                  <div className="space-y-1 max-h-80 overflow-auto pr-1">
                    {(grouped[section] || []).map(skill => (
                      <Button key={skill} variant={selectedSkill === skill ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedSkill(skill)}>
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reflection + Tutor Area */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              {!selectedSkill ? (
                <div className="text-gray-500 text-sm">Select a skill to begin.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reflection */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedSkill} — Reflection</h3>
                    <p className="text-sm text-gray-600">Personalized analysis of where you struggle and how to improve, using your recent attempts.</p>
                    <div className="text-xs text-gray-500">Insights will adapt as you practice more.</div>
                  </div>

                  {/* Tutor */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Voice Tutor</h3>
                    <p className="text-sm text-gray-600">A guided lesson with questions on the left and voice explanations. (Placeholder UI)</p>
                    <div className="border rounded p-3 text-sm text-gray-600">
                      Question area — the tutor will ask focused questions based on your reflection. Recordings and TTS can plug in here.
                    </div>
                  </div>
                </div>
              )}

              {/* Bookmarked Questions */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Bookmark className="h-4 w-4" /> Bookmarked Questions
                </h3>
                {bookmarks.length === 0 ? (
                  <div className="text-sm text-gray-500">No bookmarked questions yet.</div>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 border rounded-lg bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm text-gray-800 flex-1">{q.question_text}</div>
                          <BookmarkCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="mr-3">{q.skill}</span>
                          <span className="mr-3">{q.difficulty}</span>
                          <span>{q.domain}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;


