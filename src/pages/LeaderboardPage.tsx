import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Leaderboard from '@/components/Leaderboard';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
  
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
