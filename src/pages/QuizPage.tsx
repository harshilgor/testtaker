
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Quiz from '@/components/Quiz';
import QuizSummaryPage from '@/components/QuizSummaryPage';
import MistakesQuizView from '@/components/MistakesQuizView';
import QuizView from '@/components/QuizView';
import { Subject } from '@/types/common';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, loading } = useAuth();
  
  // Check URL parameters for mistakes mode
  const searchParams = new URLSearchParams(location.search);
  const quizMode = searchParams.get('mode');
  
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

  // Handle taking a similar quiz
  const handleTakeSimilarQuiz = () => {
    // Navigate to quiz page with similar parameters
    navigate('/quiz', {
      state: {
        similarQuiz: true,
        // You can add more parameters here based on the current quiz context
      }
    });
  };

  // Handle weakness practice mode
  if (quizMode === 'weakness-practice' || location.state?.mode === 'weakness-practice') {
    try {
      // First try to get practice data from location state
      let practiceData = location.state?.practiceData;
      
      // If not in state, try localStorage
      if (!practiceData) {
        const storedPracticeData = localStorage.getItem('weaknessPracticeData');
        if (storedPracticeData) {
          practiceData = JSON.parse(storedPracticeData);
        }
      }
      
      if (practiceData) {
        // Clear the stored practice data
        localStorage.removeItem('weaknessPracticeData');
        
        // Convert practice data to quiz format
        const quizQuestions = practiceData.questions.map((mistake, index) => ({
          id: index + 1,
          question: mistake.question_text || `Practice Question ${index + 1}`,
          options: mistake.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0, // We'll need to get this from the question bank
          explanation: mistake.explanation || 'Review this question carefully to understand the concept.',
          topic: mistake.topic,
          subject: mistake.subject,
          difficulty: mistake.difficulty,
          isWeaknessPractice: true
        }));

        return (
          <div className="min-h-screen bg-gray-50">
            <MistakesQuizView
              questions={quizQuestions}
              userName={userName}
              onBack={() => navigate('/performance-dashboard')}
              quizTitle="Weakness Practice Quiz"
              quizDescription={`Focus on improving your weakest areas: ${practiceData.focusTopics.join(', ')}. Target score: ${practiceData.targetScore}%`}
              practiceMode={{
                type: 'weakness-practice',
                focusTopics: practiceData.focusTopics,
                targetScore: practiceData.targetScore,
                estimatedDuration: practiceData.estimatedDuration,
                difficulty: practiceData.difficulty
              }}
            />
          </div>
        );
      }
    } catch (error) {
      console.error('Error loading weakness practice quiz:', error);
    }
    
    // If no practice data found, redirect back
    navigate('/performance-dashboard');
    return null;
  }

  // Handle target weakness mode
  if (quizMode === 'target-weakness' || location.state?.mode === 'target-weakness') {
    try {
      const questions = location.state?.questions || [];
      const targetWeakness = location.state?.targetWeakness;
      
      if (questions && questions.length > 0) {
        // Questions are already in the correct format from ReviewMistakes
        const quizQuestions = questions.map((q: any, index: number) => ({
          id: typeof q.id === 'number' ? q.id : (parseInt(String(q.id)) || index + 1),
          question: q.question || q.question_text || '',
          options: q.options || [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 
            (q.correct_answer === 'A' ? 0 : q.correct_answer === 'B' ? 1 : q.correct_answer === 'C' ? 2 : 3),
          explanation: q.explanation || q.correct_rationale || '',
          topic: q.topic || q.skill || '',
          subject: q.subject || 'english',
          difficulty: q.difficulty || 'medium'
        }));

        // Determine subject from questions
        const subject: Subject = quizQuestions[0]?.subject === 'math' ? 'math' : 'english';
        const topics = [...new Set(quizQuestions.map(q => q.topic).filter(Boolean))];

        return (
          <div className="min-h-screen bg-gray-50">
            <QuizView
              questions={quizQuestions}
              selectedTopics={topics.map((t, i) => `topic-${i}`)}
              feedbackPreference="immediate"
              onBack={() => navigate('/learn')}
              topics={topics}
              userName={userName}
              subject={subject}
              onBackToDashboard={() => navigate('/')}
            />
          </div>
        );
      }
    } catch (error) {
      console.error('Error loading target weakness quiz:', error);
    }
    
    // If no questions found, redirect back
    navigate('/learn');
    return null;
  }

  // Handle mistakes quiz mode
  if (quizMode === 'mistakes') {
    try {
      const mistakeQuizData = localStorage.getItem('currentMistakeQuiz');
      if (mistakeQuizData) {
        const quizData = JSON.parse(mistakeQuizData);
        
        // Clear the stored quiz data
        localStorage.removeItem('currentMistakeQuiz');
        
        return (
          <div className="min-h-screen bg-gray-50">
            <MistakesQuizView
              questions={quizData.questions}
              userName={userName}
              onBack={() => navigate('/')}
              quizTitle={quizData.title}
              quizDescription={quizData.description}
            />
          </div>
        );
      }
    } catch (error) {
      console.error('Error loading mistakes quiz:', error);
    }
    
    // If no mistakes quiz data found, redirect back
    navigate('/');
    return null;
  }

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
        onTakeSimilarQuiz={handleTakeSimilarQuiz}
      />
    </div>
  );
};

export default QuizPage;
