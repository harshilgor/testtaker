
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TopicCounts {
  [topic: string]: number;
}

export const useQuestionTopics = () => {
  const [mathTopics, setMathTopics] = useState<TopicCounts>({});
  const [englishTopics, setEnglishTopics] = useState<TopicCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // Fetch all questions from main_question_bank
        const { data: questions, error } = await supabase
          .from('main_question_bank')
          .select('section, skill')
          .not('question_text', 'is', null)
          .not('skill', 'is', null);

        if (error) {
          console.error('Error fetching topics:', error);
          return;
        }

        if (questions) {
          const mathCounts: TopicCounts = {};
          const englishCounts: TopicCounts = {};

          questions.forEach(q => {
            if (q.skill) {
              if (q.section === 'math') {
                mathCounts[q.skill] = (mathCounts[q.skill] || 0) + 1;
              } else if (q.section === 'reading-writing') {
                englishCounts[q.skill] = (englishCounts[q.skill] || 0) + 1;
              }
            }
          });

          setMathTopics(mathCounts);
          setEnglishTopics(englishCounts);
        }
      } catch (error) {
        console.error('Error fetching question topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return {
    mathTopics,
    englishTopics,
    loading
  };
};
