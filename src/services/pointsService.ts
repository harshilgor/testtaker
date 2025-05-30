
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
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    const points = calculatePoints(attempt.difficulty, attempt.is_correct);
    console.log('Recording attempt with points:', points, 'for question:', attempt.question_id);

    const { error } = await supabase
      .from('question_attempts_v2')
      .insert({
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
      });

    if (error) {
      console.error('Error recording question attempt:', error);
      throw error;
    }

    console.log('Question attempt recorded successfully with', points, 'points');
    return points;
  } catch (error) {
    console.error('Error in recordQuestionAttempt:', error);
    throw error;
  }
};

export const getUserTotalPoints = async (userId?: string): Promise<number> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) {
      console.log('No user ID provided');
      return 0;
    }

    console.log('Calculating total points for user:', targetUserId);

    const { data, error } = await supabase.rpc('calculate_user_total_points', {
      target_user_id: targetUserId
    });

    if (error) {
      console.error('Error getting user points:', error);
      return 0;
    }

    const totalPoints = data || 0;
    console.log('User total points:', totalPoints);
    return totalPoints;
  } catch (error) {
    console.error('Error in getUserTotalPoints:', error);
    return 0;
  }
};
