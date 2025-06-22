
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
    console.log('useMarathonNavigation: Ending marathon requested');
    stopTimer();
    setShowEndConfirmation(true);
  }, [setShowEndConfirmation, stopTimer]);

  const confirmEndMarathon = useCallback(async () => {
    console.log('useMarathonNavigation: Confirming marathon end');
    try {
      const sessionData = endSession();
      
      if (sessionData?.session) {
        // Save marathon session to Supabase
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          console.log('useMarathonNavigation: Saving session to database');
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
            console.error('useMarathonNavigation: Error saving marathon session:', error);
          } else {
            console.log('useMarathonNavigation: Marathon session saved successfully');
          }
        }
      }
      
      await loadUserPoints();
      await loadSessionStats();
      setShowSummary(true);
    } catch (error) {
      console.error('useMarathonNavigation: Error ending marathon:', error);
      setShowSummary(true);
    }
  }, [endSession, loadUserPoints, loadSessionStats, setShowSummary]);

  return {
    handleEndMarathon,
    confirmEndMarathon
  };
};
