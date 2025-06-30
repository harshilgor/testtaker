
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
        
        // Fetch math topics from question_bank using 'assessment' field
        const { data: mathData, error: mathError } = await supabase
          .from('question_bank')
          .select('skill')
          .eq('assessment', 'Math')
          .not('question_text', 'is', null)
          .not('skill', 'is', null);

        if (mathError) {
          console.error('Math topics error:', mathError);
        }

        // Fetch English topics - try multiple variations to ensure we get data
        const { data: englishData1, error: englishError1 } = await supabase
          .from('question_bank')
          .select('skill')
          .eq('assessment', 'Reading and Writing')
          .not('question_text', 'is', null)
          .not('skill', 'is', null);

        const { data: englishData2, error: englishError2 } = await supabase
          .from('question_bank')
          .select('skill')
          .eq('test', 'Reading and Writing')
          .not('question_text', 'is', null)
          .not('skill', 'is', null);

        // Combine English data from both queries
        const combinedEnglishData = [
          ...(englishData1 || []),
          ...(englishData2 || [])
        ];

        if (englishError1 && englishError2) {
          console.error('English topics errors:', englishError1, englishError2);
          throw englishError1;
        }

        // Count occurrences for math
        const mathTopicCounts: Record<string, number> = {};
        mathData?.forEach(item => {
          if (item.skill) {
            mathTopicCounts[item.skill] = (mathTopicCounts[item.skill] || 0) + 1;
          }
        });

        // Count occurrences for English (from combined data)
        const englishTopicCounts: Record<string, number> = {};
        combinedEnglishData.forEach(item => {
          if (item.skill) {
            englishTopicCounts[item.skill] = (englishTopicCounts[item.skill] || 0) + 1;
          }
        });

        // Convert to array format with proper structure
        const mathTopicsArray = Object.entries(mathTopicCounts).map(([skill, count]) => ({
          id: skill.toLowerCase().replace(/\s+/g, '-'),
          skill,
          name: skill,
          description: `Practice ${skill} problems`,
          count
        }));

        const englishTopicsArray = Object.entries(englishTopicCounts).map(([skill, count]) => ({
          id: skill.toLowerCase().replace(/\s+/g, '-'),
          skill,
          name: skill,
          description: `Practice ${skill} problems`,
          count
        }));

        console.log('Math topics loaded:', mathTopicsArray.length);
        console.log('English topics loaded:', englishTopicsArray.length);
        
        setMathTopics(mathTopicsArray);
        setEnglishTopics(englishTopicsArray);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load topics');
        
        // Provide fallback topics if database fails
        if (err instanceof Error && err.message.includes('Failed to load topics')) {
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
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { mathTopics, englishTopics, loading, error };
};
