
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

        // Group by skill and count questions
        const skillCounts: Record<string, { domain: string; count: number }> = {};
        
        data.forEach(row => {
          const skill = row.skill;
          const domain = row.domain;
          
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

        setTopics(topicsList);
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, [subject]);

  return { topics, loading };
};
