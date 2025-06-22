
import { useCallback } from 'react';
import { recordQuestionAttempt, calculatePoints } from '@/services/pointsService';

interface UseAnswerHandlerProps {
  currentQuestion: any;
  timeSpent: number;
  recordAttempt: (attempt: any) => void;
  setSessionPoints: (points: number) => void;
  sessionPoints: number;
  session: any;
  loadUserPoints: () => Promise<void>;
  stopTimer: () => void;
}

export const useAnswerHandler = ({
  currentQuestion,
  timeSpent,
  recordAttempt,
  setSessionPoints,
  sessionPoints,
  session,
  loadUserPoints,
  stopTimer
}: UseAnswerHandlerProps) => {

  const handleAnswer = useCallback(async (selectedAnswer: string, showAnswerUsed: boolean = false) => {
    if (!currentQuestion) {
      console.log('useAnswerHandler: No current question for answer');
      return;
    }
    
    stopTimer(); // Stop timer when answer is submitted
    
    // If show answer was used, mark as incorrect regardless of the actual answer
    const isCorrect = showAnswerUsed ? false : selectedAnswer === currentQuestion.correct_answer;
    console.log('useAnswerHandler: Recording answer', { selectedAnswer, isCorrect, timeSpent, showAnswerUsed });
    
    const attempt = {
      questionId: currentQuestion.id.toString(),
      subject: currentQuestion.section === 'Reading and Writing' ? 'english' : 'math',
      topic: currentQuestion.skill || 'general',
      difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
      isCorrect,
      timeSpent,
      hintsUsed: 0,
      showAnswerUsed,
      flagged: false,
      timestamp: new Date()
    };
    
    recordAttempt(attempt);
    
    // Calculate and record points (0 points if show answer was used)
    const points = showAnswerUsed ? 0 : calculatePoints(attempt.difficulty, isCorrect);
    console.log('useAnswerHandler: Calculated points for answer:', points);
    
    if (points > 0) {
      const newSessionPoints = sessionPoints + points;
      console.log('useAnswerHandler: Updating session points from', sessionPoints, 'to', newSessionPoints);
      setSessionPoints(newSessionPoints);
    }
    
    // Record the attempt in the database and refresh points in parallel
    try {
      await Promise.all([
        recordQuestionAttempt({
          question_id: currentQuestion.id.toString(),
          session_id: session.id,
          session_type: 'marathon',
          is_correct: isCorrect,
          difficulty: attempt.difficulty,
          subject: attempt.subject,
          topic: attempt.topic,
          time_spent: timeSpent
        }),
        loadUserPoints()
      ]);
    } catch (error) {
      console.error('useAnswerHandler: Error recording question attempt:', error);
    }
  }, [currentQuestion, timeSpent, recordAttempt, setSessionPoints, sessionPoints, session, loadUserPoints, stopTimer]);

  return { handleAnswer };
};
