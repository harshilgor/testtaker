import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

// Unified navigation patterns used across components
export const useUnifiedNavigation = () => {
  const navigate = useNavigate();

  const navigateToQuiz = useCallback(() => {
    navigate('/quiz');
  }, [navigate]);

  const navigateToMarathon = useCallback(() => {
    navigate('/marathon');
  }, [navigate]);

  const navigateToSAT = useCallback(() => {
    navigate('/sat');
  }, [navigate]);

  const navigateToPerformance = useCallback(() => {
    navigate('/performance');
  }, [navigate]);

  const navigateToLeaderboard = useCallback(() => {
    navigate('/leaderboard');
  }, [navigate]);

  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const navigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const navigateToAuth = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  const navigateToResults = useCallback((type: 'quiz' | 'marathon' | 'sat', sessionId?: string) => {
    const baseRoute = type === 'quiz' ? '/quiz/results' : 
                     type === 'marathon' ? '/marathon/results' : 
                     '/sat/results';
    
    if (sessionId) {
      navigate(`${baseRoute}?sessionId=${sessionId}`);
    } else {
      navigate(baseRoute);
    }
  }, [navigate]);

  return {
    navigateToQuiz,
    navigateToMarathon,
    navigateToSAT,
    navigateToPerformance,
    navigateToLeaderboard,
    navigateToHome,
    navigateBack,
    navigateToAuth,
    navigateToResults
  };
};