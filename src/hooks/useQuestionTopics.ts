
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TopicData {
  skill: string;
  section: string;
  count: number;
}

interface UseQuestionTopicsReturn {
  mathTopics: Array<{ id: string; name: string; description: string }>;
  englishTopics: Array<{ id: string; name: string; description: string }>;
  loading: boolean;
  error: string | null;
}

export const useQuestionTopics = (): UseQuestionTopicsReturn => {
  const [mathTopics, setMathTopics] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [englishTopics, setEnglishTopics] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        
        // Fetch distinct skills grouped by section
        const { data, error: fetchError } = await supabase
          .from('question_bank')
          .select('skill, section')
          .eq('is_active', true);

        if (fetchError) {
          throw fetchError;
        }

        // Group and count topics by section
        const topicCounts: { [key: string]: { [skill: string]: number } } = {};
        
        data?.forEach((item) => {
          if (!topicCounts[item.section]) {
            topicCounts[item.section] = {};
          }
          topicCounts[item.section][item.skill] = (topicCounts[item.section][item.skill] || 0) + 1;
        });

        // Convert math topics
        const mathSkills = topicCounts['math'] || {};
        const formattedMathTopics = Object.entries(mathSkills).map(([skill, count]) => ({
          id: skill.toLowerCase().replace(/\s+/g, '-'),
          name: skill,
          description: `${count} questions available`
        }));

        // Convert English topics  
        const englishSkills = topicCounts['reading-writing'] || {};
        const formattedEnglishTopics = Object.entries(englishSkills).map(([skill, count]) => ({
          id: skill.toLowerCase().replace(/\s+/g, '-'),
          name: skill,
          description: `${count} questions available`
        }));

        setMathTopics(formattedMathTopics);
        setEnglishTopics(formattedEnglishTopics);
        setError(null);
        
        console.log('Loaded real topics from database:', {
          math: formattedMathTopics.length,
          english: formattedEnglishTopics.length
        });
        
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load topics');
        
        // Fallback to default topics if database fetch fails
        setMathTopics([
          { id: 'algebra', name: 'Algebra', description: 'Linear equations, inequalities, systems' },
          { id: 'geometry', name: 'Geometry', description: 'Area, volume, angles, triangles' },
          { id: 'advanced-math', name: 'Advanced Math', description: 'Quadratic equations, functions' },
          { id: 'data-analysis', name: 'Data Analysis', description: 'Statistics, probability, graphs' }
        ]);
        
        setEnglishTopics([
          { id: 'reading-comprehension', name: 'Reading Comprehension', description: 'Main ideas, inference' },
          { id: 'writing-language', name: 'Writing & Language', description: 'Grammar, style, organization' },
          { id: 'vocabulary', name: 'Vocabulary', description: 'Word meaning in context' },
          { id: 'rhetoric', name: 'Rhetoric', description: 'Purpose, audience, strategy' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { mathTopics, englishTopics, loading, error };
};
