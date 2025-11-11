
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedQuizCreation from '@/components/UnifiedQuizCreation';
import QuizSummaryPage from '@/components/QuizSummaryPage';
import MistakesQuizView from '@/components/MistakesQuizView';
import QuizView from '@/components/QuizView';
import { Subject } from '@/types/common';
import { questionService } from '@/services/questionService';
import { QuizQuestion } from '@/types/question';

interface MockPracticeConfig {
  subject: Subject;
  section: string;
  skill?: string;
  questionCount: number;
  title?: string;
  description?: string;
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, loading } = useAuth();
  
  // Check URL parameters for mistakes mode
  const locationState = (location.state as any) || {};
  const searchParams = new URLSearchParams(location.search);
  const quizMode = searchParams.get('mode');
  
  // Check if we should show summary for a reviewed session
  const { showSummary, sessionData } = locationState;
  const [mockPracticeQuestions, setMockPracticeQuestions] = useState<QuizQuestion[] | null>(null);
  const [mockPracticeLoading, setMockPracticeLoading] = useState(false);
  const [mockPracticeError, setMockPracticeError] = useState<string | null>(null);

  const isMockPracticeMode = quizMode === 'mock-practice' || locationState?.mode === 'mock-practice';
  const mockPracticeConfig = (locationState?.testConfig || null) as MockPracticeConfig | null;

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

  useEffect(() => {
    const loadMockPracticeQuestions = async () => {
      if (!isMockPracticeMode) return;

      if (!mockPracticeConfig) {
        navigate('/sat-mock-test');
        return;
      }

      try {
        setMockPracticeLoading(true);
        setMockPracticeError(null);
        setMockPracticeQuestions(null);

        const dbQuestions = await questionService.getRandomQuestions({
          section: mockPracticeConfig.section,
          skill: mockPracticeConfig.skill,
          limit: mockPracticeConfig.questionCount
        });

        if (!dbQuestions || dbQuestions.length === 0) {
          setMockPracticeError('No questions available for this mock test right now.');
          return;
        }

      const formattedQuestions: QuizQuestion[] = dbQuestions.map((question, index) => {
          const options = [
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d
          ].filter(Boolean);

          while (options.length < 4) {
            options.push(`Option ${options.length + 1}`);
          }

          const correctAnswer = question.correct_answer
            ? ['A', 'B', 'C', 'D'].indexOf(question.correct_answer)
            : 0;

          return {
            id: index + 1,
            question: question.question_text || `Question ${index + 1}`,
            options,
            correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
            explanation: question.correct_rationale || '',
            question_prompt: question.question_prompt,
          subject: mockPracticeConfig.subject,
            topic: question.skill || mockPracticeConfig.skill || mockPracticeConfig.section,
            difficulty: question.difficulty || 'medium',
            incorrect_rationale_a: question.incorrect_rationale_a,
            incorrect_rationale_b: question.incorrect_rationale_b,
            incorrect_rationale_c: question.incorrect_rationale_c,
            incorrect_rationale_d: question.incorrect_rationale_d
          };
        });

        setMockPracticeQuestions(formattedQuestions);
      } catch (error) {
        console.error('Error loading mock practice questions:', error);
        setMockPracticeError('Something went wrong while loading the mock test. Please try again.');
      } finally {
        setMockPracticeLoading(false);
      }
    };

    loadMockPracticeQuestions();
  }, [isMockPracticeMode, mockPracticeConfig, navigate]);

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

  if (isMockPracticeMode) {
    if (mockPracticeError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Start Mock Practice</h2>
            <p className="text-gray-600 mb-4">{mockPracticeError}</p>
            <button
              onClick={() => navigate('/sat-mock-test')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Back to Mock Tests
            </button>
          </div>
        </div>
      );
    }

    if (mockPracticeLoading || !mockPracticeQuestions) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading practice questions...</p>
          </div>
        </div>
      );
    }

    const mockTopics = mockPracticeQuestions
      .map(question => question.topic || mockPracticeConfig?.title || 'Mock Test')
      .filter(Boolean);

    const uniqueTopics = Array.from(new Set(mockTopics));
    const isMarathonMode = (mockPracticeConfig?.questionCount || 0) >= 50;

    return (
      <div className="min-h-screen bg-gray-50">
        <QuizView
          questions={mockPracticeQuestions}
          selectedTopics={uniqueTopics.map((topic, index) => `mock-${index}`)}
          feedbackPreference="end"
          onBack={() => navigate('/sat-mock-test')}
          topics={uniqueTopics}
          userName={userName}
          subject={mockPracticeConfig?.subject || 'english'}
          onBackToDashboard={() => navigate('/')}
          onTakeSimilarQuiz={() => navigate('/quiz')}
          isMarathon={isMarathonMode}
          marathonSettings={isMarathonMode && mockPracticeConfig ? {
            subject: mockPracticeConfig.subject,
            skill: mockPracticeConfig.skill || mockPracticeConfig.section,
            questionCount: mockPracticeConfig.questionCount,
            domain: mockPracticeConfig.section
          } : undefined}
          allAvailableQuestions={mockPracticeQuestions}
        />
      </div>
    );
  }

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
  if (quizMode === 'weakness-practice' || locationState?.mode === 'weakness-practice') {
    try {
      // First try to get practice data from location state
      let practiceData = locationState?.practiceData;
      
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
  if (quizMode === 'target-weakness' || locationState?.mode === 'target-weakness') {
    try {
      const questions = locationState?.questions || [];
      const targetWeakness = locationState?.targetWeakness;
      
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
      <UnifiedQuizCreation
        userName={userName}
        onBack={() => navigate('/')}
        onBackToDashboard={() => navigate('/')}
        onTakeSimilarQuiz={handleTakeSimilarQuiz}
      />
    </div>
  );
};

export default QuizPage;
