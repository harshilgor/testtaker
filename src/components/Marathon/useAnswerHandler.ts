
import { useCallback } from 'react';
import { recordQuestionAttempt, calculatePoints } from '@/services/pointsService';
import { DatabaseQuestion } from '@/services/questionService';
import { irtService } from '@/services/irtService';

interface UseAnswerHandlerProps {
  currentQuestion: DatabaseQuestion | null;
  timeSpent: number;
  session: any;
  sessionPoints: number;
  setSessionPoints: (points: number) => void;
  recordAttempt: (attempt: any) => void;
  loadUserPoints: () => Promise<void>;
  stopTimer: () => void;
  incrementQuestionsAttempted: () => void;
  recordAnswer?: (questionId: string, isCorrect: boolean, timeSpent: number, difficulty: 'easy' | 'medium' | 'hard', targetSkill?: string) => Promise<void>;
  irtMarathon?: {
    recordAnswer: (isCorrect: boolean, itemParams: { a: number; b: number }) => Promise<any>;
    shouldStop: () => { stop: boolean; reason?: string };
    masteryAchieved: boolean;
  } | null;
}

export const useAnswerHandler = ({
  currentQuestion,
  timeSpent,
  session,
  sessionPoints,
  setSessionPoints,
  recordAttempt,
  loadUserPoints,
  stopTimer,
  incrementQuestionsAttempted,
  recordAnswer,
  irtMarathon
}: UseAnswerHandlerProps) => {

  const handleAnswer = useCallback(async (selectedAnswer: string, showAnswerUsed: boolean = false) => {
    if (!currentQuestion) {
      console.log('useAnswerHandler: No current question for answer');
      return;
    }
    
    stopTimer();
    
    // Increment questions attempted immediately
    incrementQuestionsAttempted();
    
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
    
    // Calculate points (0 if show answer was used)
    const points = showAnswerUsed ? 0 : calculatePoints(attempt.difficulty, isCorrect);
    console.log('useAnswerHandler: Calculated points for answer:', points);
    
    if (points > 0) {
      const newSessionPoints = sessionPoints + points;
      console.log('useAnswerHandler: Updating session points from', sessionPoints, 'to', newSessionPoints);
      setSessionPoints(newSessionPoints);
    }
    
    // Record attempt and refresh points
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

      // Record IRT proficiency update if IRT marathon is active
      if (irtMarathon && currentQuestion.skill) {
        try {
          const itemParams = irtService.getItemParameters(currentQuestion.difficulty);
          const irtResult = await irtMarathon.recordAnswer(isCorrect, itemParams);
          console.log('🎯 IRT proficiency updated:', {
            theta: irtResult.newTheta,
            sigma: irtResult.newSigma,
            predictedProbability: irtResult.predictedProbability,
            informationGain: irtResult.informationGain,
          });

          // Check if mastery achieved or should stop
          const stopCheck = irtMarathon.shouldStop();
          if (stopCheck.stop) {
            console.log('🏆 Marathon stopping condition:', stopCheck.reason);
            // Note: This will be handled by the parent component
          }
        } catch (error) {
          console.error('❌ Error recording IRT answer:', error);
        }
      }

      // Record adaptive learning progress if enabled (non-IRT mode)
      if (recordAnswer && currentQuestion.metadata?.targetSkill && !irtMarathon) {
        await recordAnswer(
          currentQuestion.id,
          isCorrect,
          timeSpent,
          attempt.difficulty,
          currentQuestion.metadata.targetSkill as string
        );
        console.log('🧠 Recorded adaptive learning progress for skill:', currentQuestion.metadata.targetSkill);
      }
    } catch (error) {
      console.error('useAnswerHandler: Error recording question attempt:', error);
    }
  }, [currentQuestion, timeSpent, recordAttempt, setSessionPoints, sessionPoints, session, loadUserPoints, stopTimer, incrementQuestionsAttempted, recordAnswer, irtMarathon]);

  return { handleAnswer };
};
