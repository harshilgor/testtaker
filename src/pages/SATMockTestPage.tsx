
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SATMockTest from '@/components/SATMockTest';

const SATMockTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !session)) {
      navigate('/');
    }
  }, [user, session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      <SATMockTest 
        userName={userName} 
        onBack={() => navigate('/')}
      />
    </div>
  );
};

export default SATMockTestPage;
