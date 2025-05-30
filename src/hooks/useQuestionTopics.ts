
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TopicData {
  skill: string;
  count: number;
}

export const useQuestionTopics = () => {
  const [mathTopics, setMathTopics] = useState<TopicData[]>([]);
  const [englishTopics, setEnglishTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // Fetch math topics
        const { data: mathData } = await supabase
          .from('question_bank')
          .select('skill')
          .eq('section', 'math')
          .eq('is_active', true);

        // Fetch English topics
        const { data: englishData } = await supabase
          .from('question_bank')
          .select('skill')
          .eq('section', 'reading-writing')
          .eq('is_active', true);

        // Count occurrences for math
        const mathTopicCounts: { [key: string]: number } = {};
        mathData?.forEach(item => {
          mathTopicCounts[item.skill] = (mathTopicCounts[item.skill] || 0) + 1;
        });

        // Count occurrences for English
        const englishTopicCounts: { [key: string]: number } = {};
        englishData?.forEach(item => {
          englishTopicCounts[item.skill] = (englishTopicCounts[item.skill] || 0) + 1;
        });

        // Convert to array format
        setMathTopics(
          Object.entries(mathTopicCounts).map(([skill, count]) => ({ skill, count }))
        );
        setEnglishTopics(
          Object.entries(englishTopicCounts).map(([skill, count]) => ({ skill, count }))
        );
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { mathTopics, englishTopics, loading };
};
