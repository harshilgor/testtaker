
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuestionStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

interface UserProgress {
  questionsAttempted: number;
  totalAvailable: number;
}

export const useMarathonQuestionStats = () => {
  const [questionStats, setQuestionStats] = useState({
    total: 0,
    math: { total: 0, easy: 0, medium: 0, hard: 0 } as QuestionStats,
    english: { total: 0, easy: 0, medium: 0, hard: 0 } as QuestionStats
  });
  const [userProgress, setUserProgress] = useState<UserProgress>({
    questionsAttempted: 0,
    totalAvailable: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching question stats from question_bank using test column...');
        
        // Fetch all questions with valid content
        const { data: allQuestions, error } = await supabase
          .from('question_bank')
          .select('difficulty, test')
          .not('question_text', 'is', null)
          .not('difficulty', 'is', null)
          .not('test', 'is', null);

        if (error) {
          console.error('Error fetching questions from question_bank:', error);
          setLoading(false);
          return;
        }

        if (allQuestions) {
          console.log(`Found ${allQuestions.length} total questions in database`);
          
          const stats = {
            total: allQuestions.length,
            math: { total: 0, easy: 0, medium: 0, hard: 0 },
            english: { total: 0, easy: 0, medium: 0, hard: 0 }
          };

          // Categorize questions by test column
          allQuestions.forEach(q => {
            const difficulty = q.difficulty?.toLowerCase();
            const test = q.test?.toLowerCase() || '';
            
            const isMath = test.includes('math');
            
            if (isMath) {
              stats.math.total++;
              if (difficulty === 'easy') stats.math.easy++;
              else if (difficulty === 'medium') stats.math.medium++;
              else if (difficulty === 'hard') stats.math.hard++;
            } else {
              // Reading and Writing questions
              stats.english.total++;
              if (difficulty === 'easy') stats.english.easy++;
              else if (difficulty === 'medium') stats.english.medium++;
              else if (difficulty === 'hard') stats.english.hard++;
            }
          });

          console.log('Calculated stats using test column:', {
            total: stats.total,
            math: stats.math,
            english: stats.english
          });
          
          setQuestionStats(stats);
        }

        // Fetch user progress
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: attempts } = await supabase
            .from('question_attempts_v2')
            .select('question_id')
            .eq('user_id', user.id);

          if (attempts) {
            setUserProgress({
              questionsAttempted: attempts.length,
              totalAvailable: allQuestions?.length || 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching marathon stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { questionStats, userProgress, loading };
};
