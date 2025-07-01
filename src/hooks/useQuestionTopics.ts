
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TopicData {
  id: string;
  skill: string;
  name: string;
  description: string;
  count: number;
  domain?: string;
}

export const useQuestionTopics = () => {
  const [mathTopics, setMathTopics] = useState<TopicData[]>([]);
  const [englishTopics, setEnglishTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        console.log('=== FETCHING TOPICS DEBUG ===');
        setError(null);
        
        // Fetch math topics using correct database structure
        const { data: mathData, error: mathError } = await supabase
          .from('question_bank')
          .select('skill, domain')
          .eq('assessment', 'SAT')
          .eq('test', 'Math')
          .not('question_text', 'is', null)
          .not('skill', 'is', null);

        if (mathError) {
          console.error('Math topics error:', mathError);
        }

        console.log('Math data sample:', mathData?.slice(0, 5));

        // Fetch English topics using correct database structure
        const { data: englishData, error: englishError } = await supabase
          .from('question_bank')
          .select('skill, domain')
          .eq('assessment', 'SAT')
          .eq('test', 'Reading and Writing')
          .not('question_text', 'is', null)
          .not('skill', 'is', null);

        if (englishError) {
          console.error('English topics error:', englishError);
          throw englishError;
        }

        console.log('English data sample:', englishData?.slice(0, 5));

        // Count occurrences for math
        const mathTopicCounts: Record<string, { count: number; domain?: string }> = {};
        mathData?.forEach(item => {
          if (item.skill) {
            if (!mathTopicCounts[item.skill]) {
              mathTopicCounts[item.skill] = { count: 0, domain: item.domain };
            }
            mathTopicCounts[item.skill].count++;
          }
        });

        // Count occurrences for English
        const englishTopicCounts: Record<string, { count: number; domain?: string }> = {};
        englishData?.forEach(item => {
          if (item.skill) {
            if (!englishTopicCounts[item.skill]) {
              englishTopicCounts[item.skill] = { count: 0, domain: item.domain };
            }
            englishTopicCounts[item.skill].count++;
          }
        });

        // Convert to array format with proper structure
        const mathTopicsArray = Object.entries(mathTopicCounts).map(([skill, data]) => ({
          id: skill.toLowerCase().replace(/\s+/g, '-'),
          skill,
          name: skill,
          description: `Practice ${skill} problems`,
          count: data.count,
          domain: data.domain
        }));

        const englishTopicsArray = Object.entries(englishTopicCounts).map(([skill, data]) => ({
          id: skill.toLowerCase().replace(/\s+/g, '-'),
          skill,
          name: skill,
          description: `Practice ${skill} problems`,
          count: data.count,
          domain: data.domain
        }));

        console.log('Math topics processed:', mathTopicsArray.length);
        console.log('English topics processed:', englishTopicsArray.length);
        console.log('Sample math topics:', mathTopicsArray.slice(0, 3));
        console.log('Sample english topics:', englishTopicsArray.slice(0, 3));
        
        setMathTopics(mathTopicsArray);
        setEnglishTopics(englishTopicsArray);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load topics');
        
        // Provide fallback topics if database fails
        const fallbackMathTopics = [
          { id: 'linear-equations', skill: 'Linear Equations', name: 'Linear Equations', description: 'Practice Linear Equations problems', count: 50 },
          { id: 'quadratic-functions', skill: 'Quadratic Functions', name: 'Quadratic Functions', description: 'Practice Quadratic Functions problems', count: 40 },
        ];
        
        const fallbackEnglishTopics = [
          { id: 'grammar', skill: 'Grammar', name: 'Grammar', description: 'Practice Grammar problems', count: 60 },
          { id: 'reading-comprehension', skill: 'Reading Comprehension', name: 'Reading Comprehension', description: 'Practice Reading Comprehension problems', count: 45 },
        ];
        
        setMathTopics(fallbackMathTopics);
        setEnglishTopics(fallbackEnglishTopics);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { mathTopics, englishTopics, loading, error };
};
