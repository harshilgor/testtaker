
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
        // Fetch question statistics from question_bank
        const { data: allQuestions } = await supabase
          .from('question_bank')
          .select('section, difficulty')
          .not('question_text', 'is', null);

        if (allQuestions) {
          const stats = {
            total: allQuestions.length,
            math: { total: 0, easy: 0, medium: 0, hard: 0 },
            english: { total: 0, easy: 0, medium: 0, hard: 0 }
          };

          allQuestions.forEach(q => {
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

          setQuestionStats(stats);
        }

        // Fetch user progress
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: attempts } = await supabase
            .from('question_attempts')
            .select('is_correct')
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
