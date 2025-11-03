import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Leaderboard from '@/components/Leaderboard';
import { useQuestTracking } from '@/hooks/useQuestTracking';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEvent } = useQuestTracking();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
  
  // Track leaderboard visit for quest completion
  useEffect(() => {
    if (user?.id) {
      trackEvent('visit_leaderboard');
    }
  }, [user?.id, trackEvent]);
  
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Leaderboard 
        userName={userName}
        onBack={handleBack}
      />
    </div>
  );
};

export default LeaderboardPage;
