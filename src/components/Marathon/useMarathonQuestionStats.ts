
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuestionStats {
  math: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  english: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  total: number;
}

interface UserProgress {
  questionsAttempted: number;
  totalAvailable: number;
}

export const useMarathonQuestionStats = () => {
  const [questionStats, setQuestionStats] = useState<QuestionStats>({
    math: { easy: 0, medium: 0, hard: 0, total: 0 },
    english: { easy: 0, medium: 0, hard: 0, total: 0 },
    total: 0
  });
  const [userProgress, setUserProgress] = useState<UserProgress>({
    questionsAttempted: 0,
    totalAvailable: 0
  });
  const [loading, setLoading] = useState(true);

  const loadQuestionStats = async () => {
    try {
      const { data: mathQuestions } = await supabase
        .from('question_bank')
        .select('difficulty')
        .eq('section', 'math')
        .eq('is_active', true);

      const { data: englishQuestions } = await supabase
        .from('question_bank')
        .select('difficulty')
        .eq('section', 'reading-writing')
        .eq('is_active', true);

      const { count: totalCount } = await supabase
        .from('question_bank')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const mathStats = { easy: 0, medium: 0, hard: 0, total: 0 };
      mathQuestions?.forEach(q => {
        if (q.difficulty === 'easy') mathStats.easy++;
        else if (q.difficulty === 'medium') mathStats.medium++;
        else if (q.difficulty === 'hard') mathStats.hard++;
        mathStats.total++;
      });

      const englishStats = { easy: 0, medium: 0, hard: 0, total: 0 };
      englishQuestions?.forEach(q => {
        if (q.difficulty === 'easy') englishStats.easy++;
        else if (q.difficulty === 'medium') englishStats.medium++;
        else if (q.difficulty === 'hard') englishStats.hard++;
        englishStats.total++;
      });

      setQuestionStats({
        math: mathStats,
        english: englishStats,
        total: totalCount || 0
      });
    } catch (error) {
      console.error('Error loading question stats:', error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: sessions } = await supabase
        .from('marathon_sessions')
        .select('total_questions')
        .eq('user_id', user.user.id);

      const questionsAttempted = sessions?.reduce((sum, session) => 
        sum + (session.total_questions || 0), 0) || 0;

      setUserProgress({
        questionsAttempted,
        totalAvailable: questionStats.total
      });
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionStats();
    loadUserProgress();
  }, []);

  return { questionStats, userProgress, loading };
};
