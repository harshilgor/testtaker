/**
 * Adaptive Quest Generation System
 * Based on Performance Index (PI) and Skill Score (SS) calculations
 */

export interface PerformanceData {
  rawScore: number; // 0-100
  errors: number;
  timestamp: Date;
  skill: 'Logic' | 'Memory' | 'Speed' | 'Focus';
}

export interface SkillScore {
  skill: 'Logic' | 'Memory' | 'Speed' | 'Focus';
  score: number; // 0-1
  attempts: number;
  recentAttempts: number; // Last 5 attempts
}

export interface Quest {
  title: string;
  description: string;
  points: number;
  targetSkill: 'Logic' | 'Memory' | 'Speed' | 'Focus';
  difficulty: 'Weak' | 'Mid' | 'Strong';
  objective: string;
  targetAccuracy: number;
  questionCount: number;
  timeLimit?: number; // in seconds
}

/**
 * Calculate Performance Index (PI) based on the formula:
 * PI = max(0.1, min(1.0, (rawScore/100) - (errors/10)))
 */
export function calculatePerformanceIndex(rawScore: number, errors: number): number {
  const normalizedScore = rawScore / 100;
  const errorPenalty = errors / 10;
  const pi = normalizedScore - errorPenalty;
  
  // Clamp between 0.1 and 1.0
  return Math.max(0.1, Math.min(1.0, pi));
}

/**
 * Calculate Skill Score (SS) with recent/historical weighting
 * Recent 5 attempts get 2x weight, historical get 1x weight
 */
export function calculateSkillScore(performanceData: PerformanceData[]): SkillScore[] {
  const skills: ('Logic' | 'Memory' | 'Speed' | 'Focus')[] = ['Logic', 'Memory', 'Speed', 'Focus'];
  const skillScores: SkillScore[] = [];

  skills.forEach(skill => {
    const skillData = performanceData.filter(p => p.skill === skill);
    
    if (skillData.length === 0) {
      // Untested skill - default to 0.5
      skillScores.push({
        skill,
        score: 0.5,
        attempts: 0,
        recentAttempts: 0
      });
      return;
    }

    // Sort by timestamp (most recent first)
    const sortedData = skillData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Separate recent (last 5) and historical attempts
    const recentAttempts = sortedData.slice(0, 5);
    const historicalAttempts = sortedData.slice(5);
    
    // Calculate PIs
    const recentPIs = recentAttempts.map(p => calculatePerformanceIndex(p.rawScore, p.errors));
    const historicalPIs = historicalAttempts.map(p => calculatePerformanceIndex(p.rawScore, p.errors));
    
    // Calculate weighted average
    const recentWeight = recentPIs.reduce((sum, pi) => sum + pi, 0) * 2; // 2x weight
    const historicalWeight = historicalPIs.reduce((sum, pi) => sum + pi, 0) * 1; // 1x weight
    const totalWeight = recentAttempts.length * 2 + historicalAttempts.length * 1;
    
    const skillScore = totalWeight > 0 ? (recentWeight + historicalWeight) / totalWeight : 0.5;
    
    skillScores.push({
      skill,
      score: skillScore,
      attempts: skillData.length,
      recentAttempts: recentAttempts.length
    });
  });

  return skillScores;
}

/**
 * Generate adaptive quest based on Priority Hierarchy
 * Priority 1: Untested skills (Exploration)
 * Priority 2: Lowest Skill Score (Improvement)
 */
export function generateAdaptiveQuest(skillScores: SkillScore[]): Quest {
  // Priority 1: Check for untested skills (attempts = 0)
  const untestedSkills = skillScores.filter(s => s.attempts === 0);
  
  if (untestedSkills.length > 0) {
    // Randomly select an untested skill for exploration
    const randomIndex = Math.floor(Math.random() * untestedSkills.length);
    const targetSkill = untestedSkills[randomIndex].skill;
    return generateExplorationQuest(targetSkill);
  }
  
  // Priority 2: Find skill with lowest SS
  const lowestSkill = skillScores.reduce((min, current) => 
    current.score < min.score ? current : min
  );
  
  return generateImprovementQuest(lowestSkill.skill, lowestSkill.score);
}

/**
 * Generate exploration quest for untested skills
 */
function generateExplorationQuest(skill: 'Logic' | 'Memory' | 'Speed' | 'Focus'): Quest {
  const questTemplates = {
    Logic: {
      title: "Discover Logic Puzzles",
      description: "Explore logical reasoning with 5 introductory puzzles. Learn to identify patterns and solve problems step by step.",
      points: 30,
      objective: "Solve 5 logic puzzles with 80% accuracy",
      questionCount: 5,
      targetAccuracy: 80
    },
    Memory: {
      title: "Test Your Memory",
      description: "Challenge your memory with 8-item sequences. Practice recall techniques and improve retention.",
      points: 25,
      objective: "Complete 8-item recall sequence in 90 seconds",
      questionCount: 8,
      timeLimit: 90,
      targetAccuracy: 75
    },
    Speed: {
      title: "Speed Challenge",
      description: "Test your reaction time and quick thinking with 10 rapid-fire questions.",
      points: 35,
      objective: "Complete 10 questions with average response time under 15 seconds",
      questionCount: 10,
      timeLimit: 150,
      targetAccuracy: 70
    },
    Focus: {
      title: "Focus Training",
      description: "Build sustained attention with 15-minute focused practice session.",
      points: 40,
      objective: "Maintain focus for 15 minutes with 0 errors",
      questionCount: 15,
      timeLimit: 900,
      targetAccuracy: 100
    }
  };

  const template = questTemplates[skill];
  
  return {
    title: template.title,
    description: template.description,
    points: template.points,
    targetSkill: skill,
    difficulty: 'Weak',
    objective: template.objective,
    targetAccuracy: template.targetAccuracy,
    questionCount: template.questionCount,
    timeLimit: template.timeLimit
  };
}

/**
 * Generate improvement quest based on current Skill Score
 */
function generateImprovementQuest(skill: 'Logic' | 'Memory' | 'Speed' | 'Focus', currentSS: number): Quest {
  const isWeak = currentSS < 0.6;
  
  const questTemplates = {
    Logic: {
      weak: {
        title: "Strengthen Logic Skills",
        description: "Solve 5 logic puzzles with 20% higher complexity than your current average. Target 80% accuracy.",
        points: 35,
        objective: "Solve 5 advanced logic puzzles with 80% accuracy",
        questionCount: 5,
        targetAccuracy: 80
      },
      strong: {
        title: "Master Advanced Logic",
        description: "Tackle 10 advanced logical inference problems. Aim for PI improvement of +0.10 over your current score.",
        points: 50,
        objective: "Solve 10 advanced logic problems with 90% accuracy",
        questionCount: 10,
        targetAccuracy: 90
      }
    },
    Memory: {
      weak: {
        title: "Improve Memory Recall",
        description: "Complete 12-item recall sequence in under 90 seconds. Time limit based on your lowest historical speed.",
        points: 40,
        objective: "Recall 12-item sequence in 90 seconds",
        questionCount: 12,
        timeLimit: 90,
        targetAccuracy: 75
      },
      strong: {
        title: "Memory Mastery",
        description: "Memorize and recall 16-item sequence with 100% accuracy within 60 seconds.",
        points: 55,
        objective: "Perfect recall of 16-item sequence in 60 seconds",
        questionCount: 16,
        timeLimit: 60,
        targetAccuracy: 100
      }
    },
    Speed: {
      weak: {
        title: "Speed Training",
        description: "Complete reaction-time test where average response time is 15% faster than your overall speed average.",
        points: 45,
        objective: "Improve reaction time by 15%",
        questionCount: 15,
        timeLimit: 300,
        targetAccuracy: 80
      },
      strong: {
        title: "Speed Mastery",
        description: "Achieve lightning-fast responses with 20 rapid-fire questions.",
        points: 60,
        objective: "Complete 20 questions with 15% faster average time",
        questionCount: 20,
        timeLimit: 400,
        targetAccuracy: 85
      }
    },
    Focus: {
      weak: {
        title: "Build Focus Stamina",
        description: "Engage in 20-minute task requiring sustained attention. Achieve perfect accuracy.",
        points: 50,
        objective: "20-minute focused session with 0 errors",
        questionCount: 20,
        timeLimit: 1200,
        targetAccuracy: 100
      },
      strong: {
        title: "Focus Excellence",
        description: "Master extended focus with 30-minute intensive session. Maintain perfect accuracy throughout.",
        points: 70,
        objective: "30-minute perfect focus session",
        questionCount: 30,
        timeLimit: 1800,
        targetAccuracy: 100
      }
    }
  };

  const skillTemplate = questTemplates[skill];
  const template = isWeak ? skillTemplate.weak : skillTemplate.strong;
  
  return {
    title: template.title,
    description: template.description,
    points: template.points,
    targetSkill: skill,
    difficulty: isWeak ? 'Weak' : 'Strong',
    objective: template.objective,
    targetAccuracy: template.targetAccuracy,
    questionCount: template.questionCount,
    timeLimit: template.timeLimit
  };
}

/**
 * Track performance and update skill scores
 */
export function trackPerformance(
  rawScore: number,
  errors: number,
  skill: 'Logic' | 'Memory' | 'Speed' | 'Focus',
  currentSkillScores: SkillScore[]
): SkillScore[] {
  const pi = calculatePerformanceIndex(rawScore, errors);
  
  // Update the specific skill's performance data
  const updatedSkillScores = currentSkillScores.map(skillScore => {
    if (skillScore.skill === skill) {
      // This would typically update a database with the new performance data
      // For now, we'll simulate the update
      return {
        ...skillScore,
        attempts: skillScore.attempts + 1,
        recentAttempts: Math.min(skillScore.recentAttempts + 1, 5)
      };
    }
    return skillScore;
  });
  
  return updatedSkillScores;
}
