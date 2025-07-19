import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '../types/common';

interface TopicData {
  id: string;
  skill: string;
  name: string;
  description: string;
  count: number;
  domain?: string;
  question_count?: number;
}

export const useQuestionTopics = (subject: Subject) => {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        console.log('=== FETCHING TOPICS DEBUG ===');
        console.log('Subject:', subject);
        setError(null);
        
        // Map subject to database test field
        const testFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
        
        // Fetch topics using correct database structure
        const { data, error: fetchError } = await supabase
          .from('question_bank')
          .select('skill, domain, test, assessment')
          .eq('assessment', 'SAT')
          .eq('test', testFilter)
          .not('question_text', 'is', null)
          .not('skill', 'is', null);

        if (fetchError) {
          console.error('Topics error:', fetchError);
          throw fetchError;
        }

        console.log('Raw data from database:', data);
        console.log('Total records found:', data?.length || 0);

        // Debug: Log unique skills found
        const uniqueSkills = [...new Set(data?.map(item => item.skill) || [])];
        console.log('Unique skills found:', uniqueSkills);

        // Count occurrences with case-insensitive grouping
        const topicCounts: Record<string, { count: number; domain?: string; originalSkill: string }> = {};
        data?.forEach(item => {
          if (item.skill) {
            // Use lowercase for grouping but keep original casing
            const skillKey = item.skill.toLowerCase().trim();
            if (!topicCounts[skillKey]) {
              topicCounts[skillKey] = { 
                count: 0, 
                domain: item.domain,
                originalSkill: item.skill
              };
            }
            topicCounts[skillKey].count++;
          }
        });

        console.log('Topic counts after processing:', topicCounts);

        // Convert to array format with proper structure
        const topicsArray = Object.entries(topicCounts).map(([skillKey, data]) => ({
          id: skillKey.replace(/\s+/g, '-'),
          skill: data.originalSkill, // Use original casing
          name: data.originalSkill,
          description: `Practice ${data.originalSkill} problems`,
          count: data.count,
          question_count: data.count,
          domain: data.domain
        }));

        console.log('Final topics array:', topicsArray);
        console.log('Analysis topic specifically:', topicsArray.find(t => t.skill.toLowerCase().includes('analysis')));
        
        setTopics(topicsArray);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load topics');
        
        // Provide fallback topics if database fails
        const fallbackTopics = subject === 'math' ? [
          { id: 'linear-equations', skill: 'Linear Equations', name: 'Linear Equations', description: 'Practice Linear Equations problems', count: 50, question_count: 50 },
          { id: 'quadratic-functions', skill: 'Quadratic Functions', name: 'Quadratic Functions', description: 'Practice Quadratic Functions problems', count: 40, question_count: 40 },
        ] : [
          { id: 'grammar', skill: 'Grammar', name: 'Grammar', description: 'Practice Grammar problems', count: 60, question_count: 60 },
          { id: 'reading-comprehension', skill: 'Reading Comprehension', name: 'Reading Comprehension', description: 'Practice Reading Comprehension problems', count: 45, question_count: 45 },
        ];
        
        setTopics(fallbackTopics);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subject]);

  return { topics, loading, error };
};
