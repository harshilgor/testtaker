
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseMarathonActionsProps {
  session: any;
  currentQuestion: any;
  timeSpent: number;
  setCurrentQuestion: (question: any) => void;
  setTimeSpent: (time: number) => void;
  setLoading: (loading: boolean) => void;
  setSessionPoints: (points: number) => void;
  loadUserPoints: () => Promise<void>;
  loadSessionStats: () => Promise<void>;
  recordAttempt: (attempt: any) => void;
  endSession: () => any;
  setShowSummary: (show: boolean) => void;
  setShowEndConfirmation: (show: boolean) => void;
  sessionPoints: number;
}

export const useMarathonActions = ({
  session,
  currentQuestion,
  timeSpent,
  setCurrentQuestion,
  setTimeSpent,
  setLoading,
  setSessionPoints,
  loadUserPoints,
  loadSessionStats,
  recordAttempt,
  endSession,
  setShowSummary,
  setShowEndConfirmation,
  sessionPoints
}: UseMarathonActionsProps) => {

  const loadNextQuestion = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    
    try {
      const subjects = session.subjects.includes('both') ? ['math', 'english'] : session.subjects;
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      
      console.log('Loading question for subject:', randomSubject, 'difficulty:', session.difficulty);
      
      const { data: questions, error } = await supabase.rpc('get_unused_questions_for_session', {
        p_session_id: session.id,
        p_session_type: 'marathon',
        p_section: randomSubject,
        p_difficulty: session.difficulty === 'mixed' ? null : session.difficulty,
        p_limit: 1
      });

      if (error) {
        console.error('Error loading question:', error);
        return;
      }

      if (questions && questions.length > 0) {
        const question = questions[0];
        console.log('Loaded question:', question);
        setCurrentQuestion(question);
        setTimeSpent(0);
        
        await supabase.rpc('mark_question_used_in_session', {
          p_session_id: session.id,
          p_session_type: 'marathon',
          p_question_id: question.id.toString()
        });
      } else {
        console.log('No more questions available');
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error in loadNextQuestion:', error);
    } finally {
      setLoading(false);
    }
  }, [session, setCurrentQuestion, setTimeSpent, setLoading]);

  const handleAnswer = useCallback((selectedAnswer: string) => {
    if (!currentQuestion) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    const attempt = {
      questionId: currentQuestion.id.toString(),
      subject: currentQuestion.section as 'math' | 'english',
      topic: currentQuestion.skill || 'general',
      difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
      isCorrect,
      timeSpent,
      hintsUsed: 0,
      showAnswerUsed: false,
      flagged: false,
      timestamp: new Date()
    };
    
    console.log('Recording attempt:', attempt);
    recordAttempt(attempt);
    
    // Award points based on difficulty and correctness
    if (isCorrect) {
      const pointsMap = { easy: 3, medium: 6, hard: 9 };
      const points = pointsMap[attempt.difficulty] || 6;
      setSessionPoints(sessionPoints + points);
    }
  }, [currentQuestion, timeSpent, recordAttempt, setSessionPoints, sessionPoints]);

  const handleNext = useCallback(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  const handleEndMarathon = useCallback(() => {
    setShowEndConfirmation(true);
  }, [setShowEndConfirmation]);

  const confirmEndMarathon = useCallback(async () => {
    try {
      const sessionData = endSession();
      
      if (sessionData?.session) {
        // Save marathon session to Supabase
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
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
            console.error('Error saving marathon session:', error);
          } else {
            console.log('Marathon session saved successfully');
          }
        }
      }
      
      await loadUserPoints();
      await loadSessionStats();
      setShowSummary(true);
    } catch (error) {
      console.error('Error ending marathon:', error);
      setShowSummary(true);
    }
  }, [endSession, loadUserPoints, loadSessionStats, setShowSummary]);

  return {
    loadNextQuestion,
    handleAnswer,
    handleNext,
    handleEndMarathon,
    confirmEndMarathon
  };
};
