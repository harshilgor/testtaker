
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Quiz from '@/components/Quiz';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !session)) {
      navigate('/');
    }
  }, [user, session, loading, navigate]);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflowX = '';
    };
  }, []);

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
      <Quiz
        userName={userName}
        onBack={() => navigate('/')}
      />
    </div>
  );
};

export default QuizPage;
