
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
        console.log('Fetching question stats from question_bank...');
        
        // Fetch question statistics from the question_bank table
        const { data: allQuestions, error } = await supabase
          .from('question_bank')
          .select('section, difficulty')
          .not('question_text', 'is', null)
          .not('difficulty', 'is', null)
          .not('section', 'is', null);

        if (error) {
          console.error('Error fetching questions from question_bank:', error);
          setLoading(false);
          return;
        }

        if (allQuestions) {
          console.log('Raw questions fetched:', allQuestions.length);
          console.log('Sample questions:', allQuestions.slice(0, 5));
          
          const stats = {
            total: allQuestions.length,
            math: { total: 0, easy: 0, medium: 0, hard: 0 },
            english: { total: 0, easy: 0, medium: 0, hard: 0 }
          };

          allQuestions.forEach(q => {
            console.log('Processing question:', { section: q.section, difficulty: q.difficulty });
            
            if (q.section === 'math') {
              stats.math.total++;
              if (q.difficulty === 'easy') stats.math.easy++;
              else if (q.difficulty === 'medium') stats.math.medium++;
              else if (q.difficulty === 'hard') stats.math.hard++;
            } else if (q.section === 'reading-writing') {
              stats.english.total++;
              if (q.difficulty === 'easy') stats.english.easy++;
              else if (q.difficulty === 'medium') stats.english.medium++;
              else if (q.difficulty === 'hard') stats.english.hard++;
            }
          });

          console.log('Final calculated stats:', stats);
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
