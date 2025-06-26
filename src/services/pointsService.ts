
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
    console.log('recordQuestionAttempt: Starting with attempt:', attempt);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('recordQuestionAttempt: User not authenticated');
      throw new Error('User not authenticated');
    }

    const points = calculatePoints(attempt.difficulty, attempt.is_correct);
    console.log('recordQuestionAttempt: Calculated points:', points);

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

    console.log('recordQuestionAttempt: Inserting data:', insertData);

    const { data, error } = await supabase
      .from('question_attempts_v2')
      .insert(insertData)
      .select();

    if (error) {
      console.error('recordQuestionAttempt: Database error:', error);
      throw error;
    }

    console.log('recordQuestionAttempt: Successfully recorded:', data);
    console.log('recordQuestionAttempt: Points earned:', points);
    
    // Trigger leaderboard refresh by updating user stats
    if (points > 0) {
      console.log('recordQuestionAttempt: Triggering leaderboard refresh');
      await supabase.rpc('update_leaderboard_stats_v2', {
        target_user_id: user.id
      });
    }
    
    return points;
  } catch (error) {
    console.error('recordQuestionAttempt: Error:', error);
    throw error;
  }
};

export const getUserTotalPoints = async (userId?: string): Promise<number> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) {
      console.log('getUserTotalPoints: No user ID provided');
      return 0;
    }

    console.log('getUserTotalPoints: Calculating total points for user:', targetUserId);

    const { data, error } = await supabase.rpc('calculate_user_total_points', {
      target_user_id: targetUserId
    });

    if (error) {
      console.error('getUserTotalPoints: Error getting user points:', error);
      return 0;
    }

    const totalPoints = data || 0;
    console.log('getUserTotalPoints: User total points:', totalPoints);
    return totalPoints;
  } catch (error) {
    console.error('getUserTotalPoints: Error:', error);
    return 0;
  }
};

// NEW: Function to get session total points from database
export const getSessionTotalPoints = async (sessionId: string, sessionType: string): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('getSessionTotalPoints: No user authenticated');
      return 0;
    }

    console.log('getSessionTotalPoints: Getting points for session:', sessionId, sessionType);

    const { data, error } = await supabase
      .from('question_attempts_v2')
      .select('points_earned')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .eq('session_type', sessionType);

    if (error) {
      console.error('getSessionTotalPoints: Database error:', error);
      return 0;
    }

    const totalPoints = data?.reduce((sum, attempt) => sum + (attempt.points_earned || 0), 0) || 0;
    console.log('getSessionTotalPoints: Session total points from database:', totalPoints);
    return totalPoints;
  } catch (error) {
    console.error('getSessionTotalPoints: Error:', error);
    return 0;
  }
};
