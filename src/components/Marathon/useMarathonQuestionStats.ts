
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
        // Fetch question statistics
        const { data: allQuestions } = await supabase
          .from('question_bank')
          .select('section, difficulty')
          .eq('is_active', true);

        if (allQuestions) {
          const stats = {
            total: allQuestions.length,
            math: { total: 0, easy: 0, medium: 0, hard: 0 },
            english: { total: 0, easy: 0, medium: 0, hard: 0 }
          };

          allQuestions.forEach(q => {
            if (q.section === 'math') {
              stats.math.total++;
              stats.math[q.difficulty as keyof QuestionStats]++;
            } else if (q.section === 'reading-writing') {
              stats.english.total++;
              stats.english[q.difficulty as keyof QuestionStats]++;
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
