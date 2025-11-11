/**
 * IRT (Item Response Theory) Proficiency Tracking Service
 * 
 * Implements 2-parameter logistic IRT model for adaptive testing:
 * P(correct | θ, a, b) = 1 / (1 + exp(-a*(θ - b)))
 * 
 * where:
 * - θ (theta) = user proficiency estimate
 * - a = item discrimination
 * - b = item difficulty threshold
 */

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProficiencyState {
  theta: number; // User proficiency estimate
  sigma: number; // Uncertainty (standard deviation)
  lastUpdated: string; // ISO timestamp
  questionCount: number; // Total questions answered for this skill
  masteryAchieved: boolean;
  masteryTimestamp?: string;
}

export interface ItemParameters {
  a: number; // Discrimination (typically 0.5-2.0)
  b: number; // Difficulty threshold (-3 to +3 scale)
  c?: number; // Guessing parameter (optional, default 0)
}

export interface IRTUpdateResult {
  newTheta: number;
  newSigma: number;
  predictedProbability: number;
  informationGain: number;
}

// Default parameters
const DEFAULT_THETA = -1.0; // Below average for new users
const DEFAULT_SIGMA = 1.2;
const MIN_SIGMA = 0.2;
const MAX_SIGMA = 2.0;
const ALPHA_0 = 0.35; // Base learning rate
const SIGMA_DECAY = 0.95; // Uncertainty reduction factor
const MASTERY_THETA = 1.5; // Proficiency threshold for mastery
const MASTERY_CONFIDENCE = 0.35; // Max uncertainty for mastery

// Map difficulty strings to numeric values
const DIFFICULTY_MAP: Record<string, number> = {
  'easy': -1.5,
  'Easy': -1.5,
  'medium': 0.0,
  'Medium': 0.0,
  'hard': 1.5,
  'Hard': 1.5,
};

// Estimate discrimination (a) based on difficulty range
// Higher discrimination for items that better separate ability levels
function estimateDiscrimination(difficulty: string): number {
  // Medium difficulty items tend to have higher discrimination
  if (difficulty.toLowerCase() === 'medium') {
    return 1.2;
  } else if (difficulty.toLowerCase() === 'hard') {
    return 1.0;
  } else {
    return 0.8; // Easy items have lower discrimination
  }
}

class IRTService {
  private proficiencyCache: Map<string, ProficiencyState> = new Map();

  /**
   * Get proficiency state for a skill
   */
  async getProficiency(skill: string, userId: string): Promise<ProficiencyState> {
    const cacheKey = `${userId}:${skill}`;
    
    // Check cache first
    if (this.proficiencyCache.has(cacheKey)) {
      return this.proficiencyCache.get(cacheKey)!;
    }

    try {
      // Try to load from database
      const { data, error } = await supabase
        .from('skill_proficiency')
        .select('*')
        .eq('user_id', userId)
        .eq('skill', skill)
        .single();

      if (error || !data) {
        // New user or skill - return default state
        const defaultState: ProficiencyState = {
          theta: DEFAULT_THETA,
          sigma: DEFAULT_SIGMA,
          lastUpdated: new Date().toISOString(),
          questionCount: 0,
          masteryAchieved: false,
        };
        this.proficiencyCache.set(cacheKey, defaultState);
        return defaultState;
      }

      // Apply decay if significant time has passed
      const lastUpdated = new Date(data.last_updated);
      const daysSince = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = 0.02;
      const decayedTheta = data.mastery_achieved 
        ? data.theta // No decay for mastered skills
        : data.theta - (decayFactor * daysSince);

      const state: ProficiencyState = {
        theta: Math.max(-3, Math.min(3, decayedTheta)),
        sigma: Math.max(MIN_SIGMA, Math.min(MAX_SIGMA, data.sigma || DEFAULT_SIGMA)),
        lastUpdated: data.last_updated,
        questionCount: data.question_count || 0,
        masteryAchieved: data.mastery_achieved || false,
        masteryTimestamp: data.mastery_timestamp || undefined,
      };

      this.proficiencyCache.set(cacheKey, state);
      return state;
    } catch (error) {
      console.error('Error loading proficiency:', error);
      // Return default on error
      const defaultState: ProficiencyState = {
        theta: DEFAULT_THETA,
        sigma: DEFAULT_SIGMA,
        lastUpdated: new Date().toISOString(),
        questionCount: 0,
        masteryAchieved: false,
      };
      return defaultState;
    }
  }

  /**
   * Save proficiency state to database
   */
  async saveProficiency(skill: string, userId: string, state: ProficiencyState): Promise<void> {
    const cacheKey = `${userId}:${skill}`;
    this.proficiencyCache.set(cacheKey, state);

    try {
      const { error } = await supabase
        .from('skill_proficiency')
        .upsert({
          user_id: userId,
          skill: skill,
          theta: state.theta,
          sigma: state.sigma,
          last_updated: state.lastUpdated,
          question_count: state.questionCount,
          mastery_achieved: state.masteryAchieved,
          mastery_timestamp: state.masteryTimestamp || null,
        }, {
          onConflict: 'user_id,skill'
        });

      if (error) {
        console.error('Error saving proficiency:', error);
      }
    } catch (error) {
      console.error('Error saving proficiency:', error);
    }
  }

  /**
   * Calculate probability of correct response using 2PL IRT model
   */
  calculateProbability(theta: number, itemParams: ItemParameters): number {
    const { a, b, c = 0 } = itemParams;
    const exponent = -a * (theta - b);
    const probability = c + (1 - c) / (1 + Math.exp(exponent));
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Get item parameters from question difficulty
   */
  getItemParameters(difficulty: string): ItemParameters {
    const b = DIFFICULTY_MAP[difficulty] ?? 0.0;
    const a = estimateDiscrimination(difficulty);
    return { a, b };
  }

  /**
   * Update proficiency estimate after a response
   * Uses simple gradient-based update rule
   */
  updateProficiency(
    currentState: ProficiencyState,
    isCorrect: boolean,
    itemParams: ItemParameters
  ): IRTUpdateResult {
    const { theta, sigma } = currentState;
    
    // Calculate predicted probability
    const p = this.calculateProbability(theta, itemParams);
    
    // Observed response (1 = correct, 0 = incorrect)
    const r = isCorrect ? 1 : 0;
    
    // Learning rate scaled by uncertainty
    const alpha = ALPHA_0 * sigma;
    
    // Update theta using gradient-like update
    const newTheta = theta + alpha * (r - p);
    
    // Reduce uncertainty (but not below minimum)
    const newSigma = Math.max(MIN_SIGMA, sigma * SIGMA_DECAY);
    
    // Calculate information gain (higher for items with optimal difficulty)
    const informationGain = Math.abs(r - p); // Larger when prediction was wrong
    
    return {
      newTheta: Math.max(-3, Math.min(3, newTheta)), // Clamp to reasonable range
      newSigma: newSigma,
      predictedProbability: p,
      informationGain,
    };
  }

  /**
   * Calculate target difficulty for next question
   * Target = theta + delta (slightly above current ability)
   */
  getTargetDifficulty(theta: number, phase: 'warmup' | 'adaptive' = 'adaptive'): number {
    if (phase === 'warmup') {
      // Warm-up phase: easier questions near current theta
      return theta + 0.3;
    }
    // Adaptive phase: slightly above current ability
    return theta + 0.3;
  }

  /**
   * Check if mastery has been achieved
   */
  checkMastery(state: ProficiencyState, recentAccuracy?: number): boolean {
    // Already mastered
    if (state.masteryAchieved) {
      return true;
    }

    // Check proficiency threshold
    const hasHighProficiency = state.theta >= MASTERY_THETA;
    const hasHighConfidence = state.sigma <= MASTERY_CONFIDENCE;

    // Optional: require recent accuracy consistency
    if (recentAccuracy !== undefined) {
      const hasConsistentAccuracy = recentAccuracy >= 0.75;
      return hasHighProficiency && hasHighConfidence && hasConsistentAccuracy;
    }

    return hasHighProficiency && hasHighConfidence;
  }

  /**
   * Get optimal difficulty for question selection
   */
  getOptimalDifficulty(targetDifficulty: number): string {
    // Map numeric difficulty to string
    if (targetDifficulty < -0.75) {
      return 'easy';
    } else if (targetDifficulty < 0.75) {
      return 'medium';
    } else {
      return 'hard';
    }
  }

  /**
   * Calculate question selection score (higher = better)
   * Balances informativeness and target difficulty proximity
   */
  calculateSelectionScore(
    itemParams: ItemParameters,
    targetDifficulty: number,
    theta: number
  ): number {
    const { a, b } = itemParams;
    
    // Informativeness: items with high discrimination near current theta are most informative
    const informativeness = a * Math.exp(-0.5 * Math.pow((theta - b) / 1.5, 2));
    
    // Target proximity: prefer items close to target difficulty
    const proximity = 1 / (1 + Math.abs(b - targetDifficulty));
    
    // Combined score (weighted)
    return 0.7 * informativeness + 0.3 * proximity;
  }
}

// Export singleton instance
export const irtService = new IRTService();







