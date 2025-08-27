
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseMarathonNavigationProps {
  setShowEndConfirmation: (show: boolean) => void;
  setShowSummary: (show: boolean) => void;
  endSession: () => any;
  loadUserPoints: () => Promise<void>;
  loadSessionStats: () => Promise<void>;
  stopTimer: () => void;
}

export const useMarathonNavigation = ({
  setShowEndConfirmation,
  setShowSummary,
  endSession,
  loadUserPoints,
  loadSessionStats,
  stopTimer
}: UseMarathonNavigationProps) => {

  const handleEndMarathon = useCallback(() => {
    stopTimer();
    setShowEndConfirmation(true);
  }, [setShowEndConfirmation, stopTimer]);

  const confirmEndMarathon = useCallback(async () => {
    try {
      const sessionData = endSession();
      
      if (sessionData?.session) {
        // Save marathon session to Supabase
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { error } = await supabase
            .from('marathon_sessions')
            .insert({
              user_id: user.user.id,
              total_questions: sessionData.session.totalQuestions,
              correct_answers: sessionData.session.correctAnswers,
              difficulty: sessionData.session.difficulty,
              subjects: sessionData.session.subjects,
              start_time: sessionData.session.startTime,
              end_time: sessionData.session.endTime || new Date(),
            });

          if (error) {
            console.error('Error saving marathon session:', error);
          } else {
            // Update both all-time and periodic leaderboards
            try {
              await Promise.all([
                supabase.rpc('update_leaderboard_stats_v2', {
                  target_user_id: user.user.id
                }),
                // Try to update periodic stats, but don't fail if function doesn't exist yet
                (supabase as any).rpc('update_periodic_leaderboard_stats', {
                  target_user_id: user.user.id
                }).then(() => {
                  console.log('Updated periodic leaderboard stats');
                }).catch((error: any) => {
                  console.log('Periodic leaderboard function not available yet:', error);
                })
              ]);
            } catch (error) {
              console.error('Error updating leaderboard stats:', error);
            }
          }
        }
      }
      
      await loadUserPoints();
      await loadSessionStats();
      setShowSummary(true);
    } catch (error) {
      console.error('Error ending marathon:', error);
      setShowSummary(true);
    }
  }, [endSession, loadUserPoints, loadSessionStats, setShowSummary]);

  return {
    handleEndMarathon,
    confirmEndMarathon
  };
};
