import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

export const useAdaptiveLearning = () => {
  const [weaknessScores, setWeaknessScores] = useState<WeaknessScore[]>([]);
  const [sessionProgress, setSessionProgress] = useState({
    questionsAnswered: 0,
    fatigueLevel: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0
  });

  // Calculate weakness scores based on historical data
  const calculateWeaknessScores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent attempts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attempts } = await supabase
        .from('question_attempts_v2')
        .select('topic, subject, is_correct, time_spent, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!attempts) return;

      // Group attempts by topic
      const topicStats: { [key: string]: any } = {};
      
      attempts.forEach(attempt => {
        const topic = attempt.topic || 'unknown';
        const subject = attempt.subject || 'math';
        const key = `${subject}_${topic}`;
        
        if (!topicStats[key]) {
          topicStats[key] = {
            topic,
            subject,
            totalAttempts: 0,
            correctAttempts: 0,
            totalTime: 0,
            errorPatterns: []
          };
        }
        
        topicStats[key].totalAttempts++;
        if (attempt.is_correct) {
          topicStats[key].correctAttempts++;
        } else {
          topicStats[key].errorPatterns.push('incorrect');
        }
        topicStats[key].totalTime += attempt.time_spent || 0;
      });

      // Calculate weakness scores
      const scores: WeaknessScore[] = Object.values(topicStats).map((stat: any) => {
        const accuracy = stat.totalAttempts > 0 ? stat.correctAttempts / stat.totalAttempts : 0;
        const avgTime = stat.totalAttempts > 0 ? stat.totalTime / stat.totalAttempts : 0;
        
        // Weakness score formula: (1 - accuracy) * time_factor + error_frequency
        const timeFactor = avgTime > 120 ? 1.5 : avgTime > 90 ? 1.2 : 1.0; // Penalize slow responses
        const errorFrequency = stat.errorPatterns.length / stat.totalAttempts;
        const score = (1 - accuracy) * timeFactor + errorFrequency;
        
        return {
          topic: stat.topic,
          subject: stat.subject,
          score,
          accuracy,
          avgTime,
          totalAttempts: stat.totalAttempts,
          errorPatterns: stat.errorPatterns
        };
      });

      // Sort by weakness score (highest first)
      scores.sort((a, b) => b.score - a.score);
      setWeaknessScores(scores);
      
      console.log('Calculated weakness scores:', scores);
    } catch (error) {
      console.error('Error calculating weakness scores:', error);
    }
  };

  // Get adaptive questions based on current session and weakness scores
  const getAdaptiveQuestions = async (
    availableQuestions: any[],
    sessionProgress: any,
    targetCount: number = 10
  ): Promise<AdaptiveQuestion[]> => {
    if (weaknessScores.length === 0) {
      // Fallback to random selection if no weakness data
      return availableQuestions
        .slice(0, targetCount)
        .map(q => ({ ...q, weight: 1 }));
    }

    const adaptiveQuestions: AdaptiveQuestion[] = [];
    const fatigueLevel = sessionProgress.fatigueLevel || 0;
    const consecutiveCorrect = sessionProgress.consecutiveCorrect || 0;
    const consecutiveIncorrect = sessionProgress.consecutiveIncorrect || 0;

    // Determine question distribution based on performance
    let weakAreaPercentage = 0.7; // 70% weak areas by default
    let reinforcementPercentage = 0.3; // 30% reinforcement

    // Adjust based on fatigue and performance
    if (fatigueLevel > 0.7) {
      // High fatigue: more reinforcement, easier questions
      weakAreaPercentage = 0.4;
      reinforcementPercentage = 0.6;
    } else if (consecutiveIncorrect > 3) {
      // Multiple incorrect: more reinforcement
      weakAreaPercentage = 0.5;
      reinforcementPercentage = 0.5;
    } else if (consecutiveCorrect > 5) {
      // Multiple correct: more challenging weak areas
      weakAreaPercentage = 0.8;
      reinforcementPercentage = 0.2;
    }

    // Select questions from weak areas
    const weakAreaCount = Math.floor(targetCount * weakAreaPercentage);
    const reinforcementCount = targetCount - weakAreaCount;

    // Get top weak areas
    const topWeakAreas = weaknessScores.slice(0, 5);
    
    // Select questions from weak areas with weighted distribution
    for (let i = 0; i < weakAreaCount; i++) {
      const weakArea = topWeakAreas[i % topWeakAreas.length];
      const matchingQuestions = availableQuestions.filter(q => 
        q.topic?.toLowerCase().includes(weakArea.topic.toLowerCase()) &&
        q.subject === weakArea.subject
      );

      if (matchingQuestions.length > 0) {
        // Weight based on weakness score and current performance
        const weight = weakArea.score * (1 + (consecutiveIncorrect * 0.1));
        const question = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
        
        adaptiveQuestions.push({
          id: question.id,
          topic: question.topic,
          subject: question.subject,
          difficulty: question.difficulty,
          weight
        });
      }
    }

    // Select reinforcement questions (stronger areas)
    const strongAreas = weaknessScores.slice(-3); // Bottom 3 (strongest)
    
    for (let i = 0; i < reinforcementCount; i++) {
      const strongArea = strongAreas[i % strongAreas.length];
      const matchingQuestions = availableQuestions.filter(q => 
        q.topic?.toLowerCase().includes(strongArea.topic.toLowerCase()) &&
        q.subject === strongArea.subject
      );

      if (matchingQuestions.length > 0) {
        const question = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
        
        adaptiveQuestions.push({
          id: question.id,
          topic: question.topic,
          subject: question.subject,
          difficulty: question.difficulty,
          weight: 0.5 // Lower weight for reinforcement
        });
      }
    }

    // Shuffle and return
    return adaptiveQuestions.sort(() => Math.random() - 0.5);
  };

  // Update session progress after each question
  const updateSessionProgress = (isCorrect: boolean, timeSpent: number) => {
    setSessionProgress(prev => {
      const newProgress = {
        questionsAnswered: prev.questionsAnswered + 1,
        consecutiveCorrect: isCorrect ? prev.consecutiveCorrect + 1 : 0,
        consecutiveIncorrect: isCorrect ? 0 : prev.consecutiveIncorrect + 1,
        fatigueLevel: 0
      };

      // Calculate fatigue level based on performance patterns
      if (newProgress.questionsAnswered > 15) {
        // Fatigue increases after 15 questions
        newProgress.fatigueLevel = Math.min(1, (newProgress.questionsAnswered - 15) / 10);
      }

      // Fatigue increases with consecutive incorrect answers
      if (newProgress.consecutiveIncorrect > 2) {
        newProgress.fatigueLevel = Math.min(1, newProgress.fatigueLevel + 0.2);
      }

      return newProgress;
    });
  };

  // Initialize weakness scores on mount
  useEffect(() => {
    calculateWeaknessScores();
  }, []);

  return {
    weaknessScores,
    sessionProgress,
    getAdaptiveQuestions,
    updateSessionProgress,
    calculateWeaknessScores
  };
};
