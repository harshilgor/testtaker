
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

        // Fetch user progress from all sources
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let totalAttempted = 0;

          // 1. Count from question_attempts_v2
          const { data: attempts } = await supabase
            .from('question_attempts_v2')
            .select('question_id')
            .eq('user_id', user.id);

          if (attempts) {
            totalAttempted += attempts.length;
            console.log(`Found ${attempts.length} attempts in question_attempts_v2`);
          }

          // 2. Count from quiz_results
          const { data: quizResults } = await supabase
            .from('quiz_results')
            .select('total_questions')
            .eq('user_id', user.id);

          if (quizResults) {
            const quizQuestions = quizResults.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0);
            totalAttempted += quizQuestions;
            console.log(`Found ${quizQuestions} questions from quiz_results`);
          }

          // 3. Count from marathon_sessions
          const { data: marathonSessions } = await supabase
            .from('marathon_sessions')
            .select('total_questions')
            .eq('user_id', user.id);

          if (marathonSessions) {
            const marathonQuestions = marathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);
            totalAttempted += marathonQuestions;
            console.log(`Found ${marathonQuestions} questions from marathon_sessions`);
          }

          // 4. Count from localStorage quiz results (fallback)
          try {
            const storedQuizzes = JSON.parse(localStorage.getItem('quizResults') || '[]');
            const localStorageQuestions = storedQuizzes.reduce((sum: number, quiz: any) => {
              if (quiz?.questions && Array.isArray(quiz.questions)) {
                return sum + quiz.questions.length;
              }
              return sum;
            }, 0);
            
            // Only add if we don't have this data in the database already
            if (localStorageQuestions > 0 && (!quizResults || quizResults.length === 0)) {
              totalAttempted += localStorageQuestions;
              console.log(`Found ${localStorageQuestions} questions from localStorage`);
            }
          } catch (e) {
            console.warn('Failed to parse localStorage quiz results:', e);
          }

          console.log(`Total questions attempted: ${totalAttempted}`);
          
          setUserProgress({
            questionsAttempted: totalAttempted,
            totalAvailable: allQuestions?.length || 0
          });
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
