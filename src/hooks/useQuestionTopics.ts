
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TopicData {
  id: string;
  skill: string;
  name: string;
  description: string;
  count: number;
}

export const useQuestionTopics = () => {
  const [mathTopics, setMathTopics] = useState<TopicData[]>([]);
  const [englishTopics, setEnglishTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setError(null);
        
        // Fetch math topics from question_bank
        const { data: mathData, error: mathError } = await supabase
          .from('question_bank')
          .select('skill')
          .eq('section', 'math')
          .not('question_text', 'is', null);

        if (mathError) throw mathError;

        // Fetch English topics from question_bank
        const { data: englishData, error: englishError } = await supabase
          .from('question_bank')
          .select('skill')
          .eq('section', 'reading-writing')
          .not('question_text', 'is', null);

        if (englishError) throw englishError;

        // Count occurrences for math
        const mathTopicCounts: { [key: string]: number } = {};
        mathData?.forEach(item => {
          if (item.skill) {
            mathTopicCounts[item.skill] = (mathTopicCounts[item.skill] || 0) + 1;
          }
        });

        // Count occurrences for English
        const englishTopicCounts: { [key: string]: number } = {};
        englishData?.forEach(item => {
          if (item.skill) {
            englishTopicCounts[item.skill] = (englishTopicCounts[item.skill] || 0) + 1;
          }
        });

        // Convert to array format with proper structure
        setMathTopics(
          Object.entries(mathTopicCounts).map(([skill, count]) => ({
            id: skill.toLowerCase().replace(/\s+/g, '-'),
            skill,
            name: skill,
            description: `Practice ${skill} problems`,
            count
          }))
        );
        
        setEnglishTopics(
          Object.entries(englishTopicCounts).map(([skill, count]) => ({
            id: skill.toLowerCase().replace(/\s+/g, '-'),
            skill,
            name: skill,
            description: `Practice ${skill} problems`,
            count
          }))
        );
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { mathTopics, englishTopics, loading, error };
};
