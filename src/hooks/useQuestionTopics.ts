
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '../types/common';

interface Topic {
  id: string;
  skill: string;
  domain: string;
  question_count: number;
  count: number;
}

const FALLBACK_TOPICS: Partial<Record<Subject, Array<{ skill: string; domain: string }>>> = {
  math: [
    { skill: 'Linear equation in one variable', domain: 'Algebra' },
    { skill: 'Linear equation in two variable', domain: 'Algebra' },
    { skill: 'Linear function', domain: 'Algebra' },
    { skill: 'Systems of two linear equations in two variables', domain: 'Algebra' },
    { skill: 'Nonlinear functions', domain: 'Advanced Math' }
  ],
  english: [
    { skill: 'Comprehension', domain: 'Information and Ideas' },
    { skill: 'Command of Evidence', domain: 'Information and Ideas' },
    { skill: 'Central Ideas and Details', domain: 'Information and Ideas' },
    { skill: 'Words in Context', domain: 'Information and Ideas' },
    { skill: 'Transitions', domain: 'Craft and Structure' },
    { skill: 'Rhetorical Synthesis', domain: 'Craft and Structure' },
    { skill: 'Form, Structure, and Sense', domain: 'Craft and Structure' },
    { skill: 'Boundaries', domain: 'Expression of Ideas' },
    { skill: 'Standard English Conventions', domain: 'Standard English Conventions' }
  ]
};

export const useQuestionTopics = (subject: Subject) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const testFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
        
        const { data, error } = await supabase
          .from('question_bank')
          .select('skill, domain')
          .eq('assessment', 'SAT')
          .eq('test', testFilter)
          .not('skill', 'is', null)
          .not('domain', 'is', null);

        if (error) {
          console.error('Error loading topics:', error);
          return;
        }

        console.log(`🔍 Topics Debug for ${subject}:`, data?.length, 'rows found');

        // Group by skill and count questions
        const skillCounts: Record<string, { domain: string; count: number }> = {};
        
        data.forEach(row => {
          const skill = row.skill as string;
          const domain = row.domain as string;
          
          if (!skillCounts[skill]) {
            skillCounts[skill] = { domain, count: 0 };
          }
          skillCounts[skill].count++;
        });

        // Convert to topic format
        const topicsList: Topic[] = Object.entries(skillCounts).map(([skill, info]) => ({
          id: `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`,
          skill,
          domain: info.domain,
          question_count: info.count,
          count: info.count
        }));

        const fallbackTopics = FALLBACK_TOPICS[subject] || [];
        fallbackTopics.forEach((fallback) => {
          const id = `skill-${fallback.skill.toLowerCase().replace(/\s+/g, '-')}`;
          if (!topicsList.some((topic) => topic.id === id)) {
            topicsList.push({
              id,
              skill: fallback.skill,
              domain: fallback.domain,
              question_count: 0,
              count: 0
            });
          }
        });

        topicsList.sort((a, b) => {
          if (a.domain === b.domain) {
            return a.skill.localeCompare(b.skill);
          }
          return a.domain.localeCompare(b.domain);
        });

        console.log(`📋 Final topics for ${subject}:`, topicsList.length, 'topics generated');
        console.log('Sample topics:', topicsList.slice(0, 3));
        setTopics(topicsList);
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();

    // Realtime: increment counts when new questions are inserted
    const testFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
    const channel = supabase
      .channel(`question_bank_inserts_${testFilter}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'question_bank', filter: `test=eq.${testFilter}` },
        (payload) => {
          const newRow: any = payload.new;
          if (!newRow || newRow.assessment !== 'SAT') return;
          const skill = newRow.skill as string | null;
          const domain = newRow.domain as string | null;
          if (!skill || !domain) return;

          setTopics(prev => {
            const id = `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`;
            const existing = prev.find(t => t.id === id);
            if (existing) {
              return prev.map(t => t.id === id ? { ...t, question_count: t.question_count + 1, count: t.count + 1 } : t);
            }
            // If a brand new skill appears, append it
            return [
              ...prev,
              {
                id,
                skill,
                domain,
                question_count: 1,
                count: 1
              }
            ];
          });
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // noop
      }
    };
  }, [subject]);

  return { topics, loading };
};
