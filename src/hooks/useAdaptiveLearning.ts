import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { adaptiveLearningService, SkillNode, WeaknessPattern, AdaptiveResponse } from '@/services/adaptiveLearningService';

export interface WeaknessScore {
  topic: string;
  subject: 'math' | 'english';
  score: number;
  accuracy: number;
  avgTime: number;
  totalAttempts: number;
  errorPatterns: string[];
}

export interface AdaptiveQuestion {
  id: string;
  topic: string;
  subject: 'math' | 'english';
  difficulty: 'easy' | 'medium' | 'hard';
  weight: number;
  targetSkill?: string;
  selectionReason?: string;
  adaptiveWeight?: number;
}

export const useAdaptiveLearning = () => {
  const [weaknessScores, setWeaknessScores] = useState<WeaknessScore[]>([]);
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>([]);
  const [weaknessPatterns, setWeaknessPatterns] = useState<WeaknessPattern[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);
  const [sessionProgress, setSessionProgress] = useState({
    questionsAnswered: 0,
    fatigueLevel: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0
  });

  // Initialize adaptive learning service
  const initializeAdaptiveLearning = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🚀 Initializing adaptive learning for user:', user.id);
      
      // Load user's progress from database
      await adaptiveLearningService.loadUserProgress(user.id);
      
      // Update state with current skill data
      const skills = adaptiveLearningService.getAllSkills();
      setSkillNodes(skills);
      
      // Get current weaknesses
      const weaknesses = adaptiveLearningService.identifyWeaknesses();
      setWeaknessPatterns(weaknesses);
      
      // Convert to legacy format for backward compatibility
      const legacyWeaknesses: WeaknessScore[] = weaknesses.map(w => {
        const skill = skills.find(s => s.id === w.skillId);
        return {
          topic: skill?.name || w.skillId,
          subject: skill?.subject || 'math',
          score: w.weaknessScore,
          accuracy: skill?.recentAccuracy || 0,
          avgTime: 60, // Default time
          totalAttempts: skill?.attempts || 0,
          errorPatterns: ['weakness']
        };
      });
      setWeaknessScores(legacyWeaknesses);
      
      setIsInitialized(true);
      console.log('✅ Adaptive learning initialized successfully');
      console.log('📊 Progress summary:', adaptiveLearningService.getProgressSummary());
      
    } catch (error) {
      console.error('❌ Error initializing adaptive learning:', error);
    }
  }, []);

  // Save progress to database
  const saveProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await adaptiveLearningService.saveUserProgress(user.id);
      console.log('💾 Progress saved successfully');
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
  }, []);

  // Legacy method for backward compatibility
  const calculateWeaknessScores = useCallback(async () => {
    if (isInitialized) {
      const weaknesses = adaptiveLearningService.identifyWeaknesses();
      setWeaknessPatterns(weaknesses);
      
      // Update legacy format
      const skills = adaptiveLearningService.getAllSkills();
      const legacyWeaknesses: WeaknessScore[] = weaknesses.map(w => {
        const skill = skills.find(s => s.id === w.skillId);
        return {
          topic: skill?.name || w.skillId,
          subject: skill?.subject || 'math',
          score: w.weaknessScore,
          accuracy: skill?.recentAccuracy || 0,
          avgTime: 60,
          totalAttempts: skill?.attempts || 0,
          errorPatterns: ['weakness']
        };
      });
      setWeaknessScores(legacyWeaknesses);
    } else {
      await initializeAdaptiveLearning();
    }
  }, [isInitialized, initializeAdaptiveLearning]);

  // Get adaptive questions using the new service
  const getAdaptiveQuestions = useCallback(async (
    availableQuestions: any[],
    sessionProgress: any,
    targetCount: number = 10,
    subject?: 'math' | 'english'
  ): Promise<AdaptiveQuestion[]> => {
    if (!isInitialized) {
      console.log('🔄 Adaptive learning not initialized, using random selection');
      return availableQuestions
        .slice(0, targetCount)
        .map(q => ({ 
          ...q, 
          weight: 1,
          selectionReason: 'not_initialized'
        }));
    }

    try {
      console.log('🧠 Getting adaptive questions:', { targetCount, subject, sessionHistory: sessionHistory.length });
      
      const adaptiveQuestions = await adaptiveLearningService.getAdaptiveQuestions(
        availableQuestions,
        sessionHistory,
        targetCount,
        subject
      );

      // Convert to expected format
      const formattedQuestions: AdaptiveQuestion[] = adaptiveQuestions.map(q => ({
        id: q.id,
        topic: q.skill || q.topic || 'unknown',
        subject: q.subject || (q.section?.includes('math') ? 'math' : 'english'),
        difficulty: q.difficulty || 'medium',
        weight: q.adaptiveWeight || 1,
        targetSkill: q.targetSkill,
        selectionReason: q.selectionReason,
        adaptiveWeight: q.adaptiveWeight
      }));

      console.log('📝 Selected adaptive questions:', {
        total: formattedQuestions.length,
        byReason: formattedQuestions.reduce((acc, q) => {
          acc[q.selectionReason || 'unknown'] = (acc[q.selectionReason || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      return formattedQuestions;
    } catch (error) {
      console.error('❌ Error getting adaptive questions:', error);
      // Fallback to random selection
      return availableQuestions
        .slice(0, targetCount)
        .map(q => ({ 
          ...q, 
          weight: 1,
          selectionReason: 'error_fallback'
        }));
    }
  }, [isInitialized, sessionHistory]);

  // Record answer and update skill proficiency
  const recordAnswer = useCallback(async (
    questionId: string,
    isCorrect: boolean,
    timeSpent: number,
    difficulty: 'easy' | 'medium' | 'hard',
    targetSkill?: string
  ) => {
    if (!isInitialized) return;

    // Add to session history
    setSessionHistory(prev => [...prev, questionId]);

    // Update traditional session progress
    setSessionProgress(prev => {
      const newProgress = {
        questionsAnswered: prev.questionsAnswered + 1,
        consecutiveCorrect: isCorrect ? prev.consecutiveCorrect + 1 : 0,
        consecutiveIncorrect: isCorrect ? 0 : prev.consecutiveIncorrect + 1,
        fatigueLevel: 0
      };

      // Calculate fatigue level based on performance patterns
      if (newProgress.questionsAnswered > 15) {
        newProgress.fatigueLevel = Math.min(1, (newProgress.questionsAnswered - 15) / 10);
      }

      if (newProgress.consecutiveIncorrect > 2) {
        newProgress.fatigueLevel = Math.min(1, newProgress.fatigueLevel + 0.2);
      }

      return newProgress;
    });

    // Update adaptive learning system
    if (targetSkill) {
      const expectedAccuracy = adaptiveLearningService.calculateExpectedAccuracy(targetSkill, difficulty);
      
      const response: AdaptiveResponse = {
        isCorrect,
        timeSpent,
        skillId: targetSkill,
        difficulty,
        expectedAccuracy
      };

      adaptiveLearningService.updateSkillProficiency(targetSkill, response);
      
      // Update state
      const skills = adaptiveLearningService.getAllSkills();
      setSkillNodes(skills);
      
      const weaknesses = adaptiveLearningService.identifyWeaknesses();
      setWeaknessPatterns(weaknesses);
      
      // Auto-save progress every 5 questions
      if (sessionProgress.questionsAnswered % 5 === 0) {
        await saveProgress();
      }

      console.log(`📊 Recorded answer for ${targetSkill}:`, { isCorrect, expectedAccuracy, timeSpent });
    }
  }, [isInitialized, sessionProgress.questionsAnswered, saveProgress]);

  // Legacy update method for backward compatibility
  const updateSessionProgress = useCallback((isCorrect: boolean, timeSpent: number) => {
    setSessionProgress(prev => {
      const newProgress = {
        questionsAnswered: prev.questionsAnswered + 1,
        consecutiveCorrect: isCorrect ? prev.consecutiveCorrect + 1 : 0,
        consecutiveIncorrect: isCorrect ? 0 : prev.consecutiveIncorrect + 1,
        fatigueLevel: 0
      };

      if (newProgress.questionsAnswered > 15) {
        newProgress.fatigueLevel = Math.min(1, (newProgress.questionsAnswered - 15) / 10);
      }

      if (newProgress.consecutiveIncorrect > 2) {
        newProgress.fatigueLevel = Math.min(1, newProgress.fatigueLevel + 0.2);
      }

      return newProgress;
    });
  }, []);

  // Get progress summary
  const getProgressSummary = useCallback((subject?: 'math' | 'english') => {
    if (!isInitialized) return null;
    return adaptiveLearningService.getProgressSummary(subject);
  }, [isInitialized]);

  // Get current skill to focus on
  const getNextSkillToFocus = useCallback((subject?: 'math' | 'english') => {
    if (!isInitialized) return null;
    return adaptiveLearningService.getNextSkill(subject);
  }, [isInitialized]);

  // Initialize on mount
  useEffect(() => {
    initializeAdaptiveLearning();
  }, [initializeAdaptiveLearning]);

  // Auto-save progress when component unmounts
  useEffect(() => {
    return () => {
      if (isInitialized) {
        saveProgress();
      }
    };
  }, [isInitialized, saveProgress]);

  return {
    // Legacy compatibility
    weaknessScores,
    sessionProgress,
    calculateWeaknessScores,
    updateSessionProgress,
    getAdaptiveQuestions,
    
    // New adaptive learning features
    skillNodes,
    weaknessPatterns,
    isInitialized,
    sessionHistory,
    recordAnswer,
    saveProgress,
    getProgressSummary,
    getNextSkillToFocus,
    initializeAdaptiveLearning
  };
};
