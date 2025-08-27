
import { supabase } from '@/integrations/supabase/client';

export interface QuestionAttempt {
  question_id: string;
  session_id: string;
  session_type: 'marathon' | 'quiz' | 'mocktest';
  is_correct: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
  time_spent?: number;
}

export const calculatePoints = (difficulty: string, isCorrect: boolean): number => {
  if (!isCorrect) return 0;
  
  switch (difficulty) {
    case 'easy':
      return 3;
    case 'medium':
      return 6;
    case 'hard':
      return 9;
    default:
      return 6; // Default to medium
  }
};

export const recordQuestionAttempt = async (attempt: QuestionAttempt): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const points = calculatePoints(attempt.difficulty, attempt.is_correct);

    const insertData = {
      user_id: user.id,
      question_id: attempt.question_id,
      session_id: attempt.session_id,
      session_type: attempt.session_type,
      is_correct: attempt.is_correct,
      points_earned: points,
      difficulty: attempt.difficulty,
      subject: attempt.subject,
      topic: attempt.topic,
      time_spent: attempt.time_spent || 0
    };

    const { data, error } = await supabase
      .from('question_attempts_v2')
      .insert(insertData)
      .select();

    if (error) {
      throw error;
    }
    
    // Trigger comprehensive leaderboard refresh (both all-time and periodic)
    if (points > 0) {
      try {
        console.log('Updating all leaderboard stats for user:', user.id);
        
        // Update all-time leaderboard stats
        await supabase.rpc('update_leaderboard_stats_v2', {
          target_user_id: user.id
        });
        
        // Update periodic stats (weekly and monthly)
        await supabase.rpc('update_periodic_leaderboard_stats', {
          target_user_id: user.id
        });
        
        console.log('Successfully updated all leaderboard stats');
      } catch (error) {
        console.error('Error updating leaderboard stats:', error);
        // Don't throw here - we don't want to fail the question attempt
      }
    }
    
    return points;
  } catch (error) {
    console.error('Error recording question attempt:', error);
    throw error;
  }
};

export const getUserTotalPoints = async (userId?: string): Promise<number> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) return 0;

    const { data, error } = await supabase.rpc('calculate_user_total_points', {
      target_user_id: targetUserId
    });

    if (error) {
      console.error('Error getting user points:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error getting user points:', error);
    return 0;
  }
};

export const getSessionTotalPoints = async (sessionId: string, sessionType: string): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return 0;

    const { data, error } = await supabase
      .from('question_attempts_v2')
      .select('points_earned')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .eq('session_type', sessionType);

    if (error) {
      console.error('Error getting session points:', error);
      return 0;
    }

    return data?.reduce((sum, attempt) => sum + (attempt.points_earned || 0), 0) || 0;
  } catch (error) {
    console.error('Error getting session points:', error);
    return 0;
  }
};
