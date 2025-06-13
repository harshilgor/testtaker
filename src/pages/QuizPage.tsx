
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Quiz from '@/components/Quiz';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, loading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && (!user || !session)) {
      navigate('/');
    }
  }, [user, session, loading, navigate]);

  // Set body styles for full-screen mode but allow scrolling
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden'; // Prevent horizontal scroll only
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflowX = '';
    };
  }, []);

  const handleBack = () => {
    navigate('/');
  };

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
        onBack={handleBack}
      />
    </div>
  );
};

export default QuizPage;
