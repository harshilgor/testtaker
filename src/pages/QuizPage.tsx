
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Quiz from '@/components/Quiz';
import QuizSummaryPage from '@/components/QuizSummaryPage';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, loading } = useAuth();
  
  // Check if we should show summary for a reviewed session
  const { showSummary, sessionData } = location.state || {};

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

  // If showing summary for a reviewed session, display that instead
  if (showSummary && sessionData) {
    // Mock questions data for historical quiz review
    const mockQuestions = Array.from({ length: sessionData.total_questions || 10 }, (_, i) => ({
      id: i + 1,
      question: `Historical Question ${i + 1}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: 'This is a historical quiz question that was completed previously.',
      topic: Array.isArray(sessionData.topics) ? sessionData.topics[i % sessionData.topics.length] : sessionData.subject || 'Math',
      subject: sessionData.subject || 'Math',
      difficulty: 'medium'
    }));

    // Mock answers based on score percentage
    const correctCount = sessionData.correct_answers || Math.floor((sessionData.score_percentage / 100) * mockQuestions.length);
    const mockAnswers = mockQuestions.map((q, i) => 
      i < correctCount ? q.correctAnswer : (q.correctAnswer + 1) % 4
    );

    return (
      <QuizSummaryPage
        questions={mockQuestions}
        answers={mockAnswers}
        topics={Array.isArray(sessionData.topics) ? sessionData.topics : [sessionData.subject || 'Math']}
        timeElapsed={sessionData.time_taken || 300}
        onRetakeQuiz={() => navigate('/quiz')}
        onBackToDashboard={() => navigate('/')}
        userName={userName}
        subject={sessionData.subject || 'Math'}
      />
    );
  }

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
