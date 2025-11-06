/**
 * Hook for IRT-based adaptive marathon
 * Handles proficiency tracking, question selection, and mastery detection
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { irtService, ProficiencyState, IRTUpdateResult } from '@/services/irtService';
import { DatabaseQuestion } from '@/services/questionService';

interface UseIRTMarathonProps {
  skill: string;
  subject: 'math' | 'english';
}

interface MarathonState {
  proficiency: ProficiencyState | null;
  questionCount: number;
  recentAnswers: boolean[]; // Last 8 answers for consistency check
  phase: 'warmup' | 'adaptive' | 'mastery';
  masteryAchieved: boolean;
}

const WARMUP_ITEMS = 5;
const MAX_ITEMS = 40;
const MAX_TIME_MINUTES = 45;
const CONSISTENCY_WINDOW = 8;
const CONSISTENCY_THRESHOLD = 0.75;

export const useIRTMarathon = ({ skill, subject }: UseIRTMarathonProps) => {
  const { user } = useAuth();
  const [state, setState] = useState<MarathonState>({
    proficiency: null,
    questionCount: 0,
    recentAnswers: [],
    phase: 'warmup',
    masteryAchieved: false,
  });
  const [loading, setLoading] = useState(true);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

  // Load proficiency state on mount
  useEffect(() => {
    const loadProficiency = async () => {
      if (!user || !skill) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const proficiency = await irtService.getProficiency(skill, user.id);
        setState(prev => ({
          ...prev,
          proficiency,
          masteryAchieved: proficiency.masteryAchieved,
        }));
      } catch (error) {
        console.error('Error loading proficiency:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProficiency();
  }, [user, skill]);

  // Update proficiency after answer
  const recordAnswer = useCallback(async (
    isCorrect: boolean,
    itemParams: { a: number; b: number }
  ): Promise<IRTUpdateResult> => {
    if (!state.proficiency || !user) {
      throw new Error('Proficiency state not loaded');
    }

    const updateResult = irtService.updateProficiency(
      state.proficiency,
      isCorrect,
      itemParams
    );

    // Update recent answers
    const newRecentAnswers = [...state.recentAnswers, isCorrect].slice(-CONSISTENCY_WINDOW);
    
    // Calculate recent accuracy
    const recentAccuracy = newRecentAnswers.length > 0
      ? newRecentAnswers.filter(a => a).length / newRecentAnswers.length
      : 0;

    // Determine phase
    let newPhase = state.phase;
    if (state.questionCount < WARMUP_ITEMS) {
      newPhase = 'warmup';
    } else {
      newPhase = 'adaptive';
    }

    // Check mastery
    const masteryAchieved = irtService.checkMastery(
      {
        ...state.proficiency,
        theta: updateResult.newTheta,
        sigma: updateResult.newSigma,
      },
      newRecentAnswers.length >= CONSISTENCY_WINDOW ? recentAccuracy : undefined
    );

    if (masteryAchieved && !state.masteryAchieved) {
      newPhase = 'mastery';
    }

    const newProficiency: ProficiencyState = {
      ...state.proficiency,
      theta: updateResult.newTheta,
      sigma: updateResult.newSigma,
      lastUpdated: new Date().toISOString(),
      questionCount: state.proficiency.questionCount + 1,
      masteryAchieved,
      masteryTimestamp: masteryAchieved && !state.masteryAchieved
        ? new Date().toISOString()
        : state.proficiency.masteryTimestamp,
    };

    // Save to database
    await irtService.saveProficiency(skill, user.id, newProficiency);

    setState(prev => ({
      ...prev,
      proficiency: newProficiency,
      questionCount: prev.questionCount + 1,
      recentAnswers: newRecentAnswers,
      phase: newPhase,
      masteryAchieved,
    }));

    return updateResult;
  }, [state, user, skill]);

  // Select next question using IRT
  const selectNextQuestion = useCallback(async (
    availableQuestions: DatabaseQuestion[]
  ): Promise<DatabaseQuestion | null> => {
    if (!state.proficiency || availableQuestions.length === 0) {
      return null;
    }

    // Filter to skill-specific questions
    const skillQuestions = availableQuestions.filter(q => q.skill === skill);
    if (skillQuestions.length === 0) {
      // Fallback to all questions if no skill match
      console.warn(`No questions found for skill "${skill}", using all questions`);
      return null;
    }

    // Exclude used questions
    const unusedQuestions = skillQuestions.filter(q => !usedQuestionIds.has(q.id));
    if (unusedQuestions.length === 0) {
      // Reset used questions if all have been used
      console.log('All questions used, resetting used question set');
      setUsedQuestionIds(new Set());
      return skillQuestions[Math.floor(Math.random() * skillQuestions.length)];
    }

    const { theta, questionCount } = state.proficiency;

    // Determine target difficulty
    const phase = questionCount < WARMUP_ITEMS ? 'warmup' : 'adaptive';
    const targetDifficulty = irtService.getTargetDifficulty(theta, phase);

    // Score each question based on IRT selection criteria
    const scoredQuestions = unusedQuestions.map(question => {
      const itemParams = irtService.getItemParameters(question.difficulty);
      const score = irtService.calculateSelectionScore(
        itemParams,
        targetDifficulty,
        theta
      );
      return { question, score, itemParams };
    });

    // Sort by score (highest first)
    scoredQuestions.sort((a, b) => b.score - a.score);

    // Exploration: 15% chance to pick random question
    const explorationRate = 0.15;
    if (Math.random() < explorationRate && scoredQuestions.length > 1) {
      const randomIndex = Math.floor(Math.random() * scoredQuestions.length);
      const selected = scoredQuestions[randomIndex].question;
      setUsedQuestionIds(prev => new Set([...prev, selected.id]));
      return selected;
    }

    // Exploitation: pick top scored question
    // Occasionally mix in easier questions for confidence (1 out of 6)
    if (questionCount > 0 && questionCount % 6 === 0) {
      // Find easier questions
      const easierQuestions = scoredQuestions.filter(
        ({ itemParams }) => itemParams.b < targetDifficulty - 0.5
      );
      if (easierQuestions.length > 0) {
        const selected = easierQuestions[Math.floor(Math.random() * easierQuestions.length)].question;
        setUsedQuestionIds(prev => new Set([...prev, selected.id]));
        return selected;
      }
    }

    const selected = scoredQuestions[0].question;
    setUsedQuestionIds(prev => new Set([...prev, selected.id]));
    return selected;
  }, [state.proficiency, skill, usedQuestionIds]);

  // Check if marathon should stop
  const shouldStop = useCallback((): { stop: boolean; reason?: string } => {
    if (!state.proficiency) {
      return { stop: false };
    }

    // Mastery achieved
    if (state.masteryAchieved) {
      return { stop: true, reason: 'Mastery achieved!' };
    }

    // Max items reached
    if (state.questionCount >= MAX_ITEMS) {
      return { stop: true, reason: 'Maximum questions reached' };
    }

    // Check recent accuracy consistency (if we have enough data)
    if (state.recentAnswers.length >= CONSISTENCY_WINDOW) {
      const accuracy = state.recentAnswers.filter(a => a).length / state.recentAnswers.length;
      if (accuracy >= CONSISTENCY_THRESHOLD && state.proficiency.theta >= 1.5) {
        return { stop: true, reason: 'Consistent high performance achieved' };
      }
    }

    return { stop: false };
  }, [state]);

  return {
    proficiency: state.proficiency,
    loading,
    questionCount: state.questionCount,
    phase: state.phase,
    masteryAchieved: state.masteryAchieved,
    recordAnswer,
    selectNextQuestion,
    shouldStop,
    recentAccuracy: state.recentAnswers.length > 0
      ? state.recentAnswers.filter(a => a).length / state.recentAnswers.length
      : 0,
  };
};

