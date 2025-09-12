import { supabase } from '@/integrations/supabase/client';

// Core interfaces for the adaptive learning system
export interface SkillNode {
  id: string;
  name: string;
  subject: 'math' | 'english';
  category: string; // e.g., 'algebra', 'geometry', 'reading'
  prerequisites: string[]; // Array of skill IDs that must be mastered first
  unlocked: boolean;
  proficiencyScore: number; // 0-100 ELO-like score
  masteryLevel: 'none' | 'learning' | 'practicing' | 'mastered';
  attempts: number;
  correctAttempts: number;
  recentAccuracy: number;
  lastUpdated: Date;
}

export interface QuestionRequest {
  questionId: string;
  skillId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAccuracy: number; // Based on question difficulty vs user skill
}

export interface AdaptiveResponse {
  isCorrect: boolean;
  timeSpent: number;
  skillId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAccuracy: number;
}

export interface WeaknessPattern {
  skillId: string;
  weaknessScore: number; // Higher = more urgent
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
}

export class AdaptiveLearningService {
  private readonly ALPHA = 0.3; // Decay weight for score updates
  private readonly K_FACTOR = 32; // ELO K-factor
  private readonly MASTERY_THRESHOLD = 80; // 80% accuracy for mastery
  private readonly MASTERY_ATTEMPTS = 10; // Minimum attempts for mastery
  private readonly WEAK_THRESHOLD = 70; // Below 70% is considered weak

  // Skill dependency DAG structure
  private skillGraph: Map<string, SkillNode> = new Map([
    // Math skills
    ['basic_arithmetic', {
      id: 'basic_arithmetic',
      name: 'Basic Arithmetic',
      subject: 'math',
      category: 'fundamentals',
      prerequisites: [],
      unlocked: true,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    ['linear_equations', {
      id: 'linear_equations',
      name: 'Linear Equations',
      subject: 'math',
      category: 'algebra',
      prerequisites: ['basic_arithmetic'],
      unlocked: false,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    ['quadratic_equations', {
      id: 'quadratic_equations',
      name: 'Quadratic Equations',
      subject: 'math',
      category: 'algebra',
      prerequisites: ['linear_equations'],
      unlocked: false,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    ['systems_of_equations', {
      id: 'systems_of_equations',
      name: 'Systems of Equations',
      subject: 'math',
      category: 'algebra',
      prerequisites: ['linear_equations'],
      unlocked: false,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    ['geometry_basics', {
      id: 'geometry_basics',
      name: 'Basic Geometry',
      subject: 'math',
      category: 'geometry',
      prerequisites: ['basic_arithmetic'],
      unlocked: false,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    ['trigonometry', {
      id: 'trigonometry',
      name: 'Trigonometry',
      subject: 'math',
      category: 'geometry',
      prerequisites: ['geometry_basics'],
      unlocked: false,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    // English skills
    ['basic_reading', {
      id: 'basic_reading',
      name: 'Reading Comprehension',
      subject: 'english',
      category: 'reading',
      prerequisites: [],
      unlocked: true,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    ['text_analysis', {
      id: 'text_analysis',
      name: 'Text Analysis',
      subject: 'english',
      category: 'reading',
      prerequisites: ['basic_reading'],
      unlocked: false,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    ['grammar_basics', {
      id: 'grammar_basics',
      name: 'Grammar & Usage',
      subject: 'english',
      category: 'writing',
      prerequisites: [],
      unlocked: true,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }],
    ['advanced_grammar', {
      id: 'advanced_grammar',
      name: 'Advanced Grammar',
      subject: 'english',
      category: 'writing',
      prerequisites: ['grammar_basics'],
      unlocked: false,
      proficiencyScore: 50,
      masteryLevel: 'none',
      attempts: 0,
      correctAttempts: 0,
      recentAccuracy: 0,
      lastUpdated: new Date()
    }]
  ]);

  // Load user's skill progress from database
  async loadUserProgress(userId: string): Promise<void> {
    try {
      // TODO: Implement user_skill_progress table
      console.log('Loading user progress for:', userId);
      
      // Update unlocked skills based on prerequisites
      this.updateUnlockedSkills();
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }

  // Save user's skill progress to database
  async saveUserProgress(userId: string): Promise<void> {
    try {
      // TODO: Implement user_skill_progress table
      console.log('Saving user progress for:', userId);
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }

  // Update skill proficiency using ELO-like algorithm
  updateSkillProficiency(skillId: string, response: AdaptiveResponse): void {
    const skill = this.skillGraph.get(skillId);
    if (!skill) return;

    const { isCorrect, expectedAccuracy } = response;
    const actual = isCorrect ? 1 : 0;
    const expected = expectedAccuracy;

    // ELO-style update
    const eloChange = this.K_FACTOR * (actual - expected);
    skill.proficiencyScore = Math.max(0, Math.min(100, skill.proficiencyScore + eloChange));

    // Weighted average for recent accuracy
    const newAccuracy = isCorrect ? 1 : 0;
    skill.recentAccuracy = this.ALPHA * newAccuracy + (1 - this.ALPHA) * skill.recentAccuracy;

    // Update attempt counts
    skill.attempts++;
    if (isCorrect) skill.correctAttempts++;

    // Check for mastery
    this.checkMastery(skill);

    // Update timestamp
    skill.lastUpdated = new Date();

    console.log(`Updated skill ${skillId}: score=${skill.proficiencyScore}, accuracy=${skill.recentAccuracy}, mastery=${skill.masteryLevel}`);
  }

  // Check if skill has reached mastery
  private checkMastery(skill: SkillNode): void {
    if (skill.attempts >= this.MASTERY_ATTEMPTS && 
        skill.recentAccuracy >= this.MASTERY_THRESHOLD / 100 &&
        skill.proficiencyScore >= this.MASTERY_THRESHOLD) {
      skill.masteryLevel = 'mastered';
      this.updateUnlockedSkills();
      console.log(`🎉 Skill mastered: ${skill.name}`);
    } else if (skill.attempts >= 5 && skill.recentAccuracy >= 0.6) {
      skill.masteryLevel = 'practicing';
    } else if (skill.attempts >= 2) {
      skill.masteryLevel = 'learning';
    }
  }

  // Update which skills are unlocked based on prerequisites
  private updateUnlockedSkills(): void {
    for (const skill of this.skillGraph.values()) {
      if (skill.unlocked) continue;

      const allPrereqsMastered = skill.prerequisites.every(prereqId => {
        const prereq = this.skillGraph.get(prereqId);
        return prereq?.masteryLevel === 'mastered';
      });

      if (allPrereqsMastered) {
        skill.unlocked = true;
        console.log(`🔓 Skill unlocked: ${skill.name}`);
      }
    }
  }

  // Identify weak skills that need practice
  identifyWeaknesses(subject?: 'math' | 'english'): WeaknessPattern[] {
    const weaknesses: WeaknessPattern[] = [];

    for (const skill of this.skillGraph.values()) {
      if (subject && skill.subject !== subject) continue;
      if (!skill.unlocked) continue;

      // Calculate weakness score
      const accuracyFactor = 1 - skill.recentAccuracy;
      const proficiencyFactor = (100 - skill.proficiencyScore) / 100;
      const attemptFactor = skill.attempts > 0 ? Math.min(1, skill.attempts / 10) : 0.1;
      
      const weaknessScore = (accuracyFactor * 0.4 + proficiencyFactor * 0.4 + (1 - attemptFactor) * 0.2) * 100;

      // Only include skills that are actually weak
      if (skill.proficiencyScore < this.WEAK_THRESHOLD || skill.recentAccuracy < 0.6) {
        let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
        let recommendedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';

        if (weaknessScore > 80) {
          priority = 'critical';
          recommendedDifficulty = 'easy';
        } else if (weaknessScore > 60) {
          priority = 'high';
          recommendedDifficulty = 'easy';
        } else if (weaknessScore > 40) {
          priority = 'medium';
          recommendedDifficulty = 'medium';
        }

        weaknesses.push({
          skillId: skill.id,
          weaknessScore,
          priority,
          recommendedDifficulty
        });
      }
    }

    // Sort by weakness score (highest first)
    return weaknesses.sort((a, b) => b.weaknessScore - a.weaknessScore);
  }

  // Get next skill to focus on (highest priority weakness or next unlocked skill)
  getNextSkill(subject?: 'math' | 'english'): SkillNode | null {
    const weaknesses = this.identifyWeaknesses(subject);
    
    if (weaknesses.length > 0) {
      // Focus on the weakest skill
      return this.skillGraph.get(weaknesses[0].skillId) || null;
    }

    // Find next unlocked skill that isn't mastered
    for (const skill of this.skillGraph.values()) {
      if (subject && skill.subject !== subject) continue;
      if (skill.unlocked && skill.masteryLevel !== 'mastered') {
        return skill;
      }
    }

    return null;
  }

  // Adaptive question selection using epsilon-greedy multi-armed bandit
  async getAdaptiveQuestions(
    availableQuestions: any[],
    sessionHistory: string[] = [],
    targetCount: number = 10,
    subject?: 'math' | 'english'
  ): Promise<any[]> {
    const selectedQuestions: any[] = [];
    const weaknesses = this.identifyWeaknesses(subject);
    
    // Distribution: 70% weak focus, 20% harder progression, 10% review
    const weakFocusCount = Math.floor(targetCount * 0.7);
    const progressionCount = Math.floor(targetCount * 0.2);
    const reviewCount = targetCount - weakFocusCount - progressionCount;

    // Filter out recently used questions
    const unusedQuestions = availableQuestions.filter(q => 
      !sessionHistory.includes(q.id.toString())
    );

    // 1. Select questions for weak areas
    for (let i = 0; i < weakFocusCount && weaknesses.length > 0; i++) {
      const weakness = weaknesses[i % weaknesses.length];
      const skill = this.skillGraph.get(weakness.skillId);
      
      if (skill) {
        const matchingQuestions = unusedQuestions.filter(q => 
          this.mapQuestionToSkill(q) === skill.id &&
          q.difficulty === weakness.recommendedDifficulty
        );

        if (matchingQuestions.length > 0) {
          const question = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
          selectedQuestions.push({
            ...question,
            adaptiveWeight: weakness.weaknessScore,
            targetSkill: skill.id,
            selectionReason: 'weakness_focus'
          });
        }
      }
    }

    // 2. Select progression questions (slightly harder)
    for (let i = 0; i < progressionCount; i++) {
      const nextSkill = this.getNextSkill(subject);
      if (nextSkill) {
        const hardQuestions = unusedQuestions.filter(q => 
          this.mapQuestionToSkill(q) === nextSkill.id &&
          q.difficulty === 'hard'
        );

        if (hardQuestions.length > 0) {
          const question = hardQuestions[Math.floor(Math.random() * hardQuestions.length)];
          selectedQuestions.push({
            ...question,
            adaptiveWeight: 1.5,
            targetSkill: nextSkill.id,
            selectionReason: 'progression'
          });
        }
      }
    }

    // 3. Select review questions (from strong areas)
    for (let i = 0; i < reviewCount; i++) {
      const strongSkills = Array.from(this.skillGraph.values())
        .filter(skill => 
          skill.unlocked && 
          skill.proficiencyScore >= 80 &&
          (!subject || skill.subject === subject)
        );

      if (strongSkills.length > 0) {
        const skill = strongSkills[Math.floor(Math.random() * strongSkills.length)];
        const matchingQuestions = unusedQuestions.filter(q => 
          this.mapQuestionToSkill(q) === skill.id
        );

        if (matchingQuestions.length > 0) {
          const question = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
          selectedQuestions.push({
            ...question,
            adaptiveWeight: 0.5,
            targetSkill: skill.id,
            selectionReason: 'review'
          });
        }
      }
    }

    // Fill remaining slots with random questions if needed
    while (selectedQuestions.length < targetCount && unusedQuestions.length > 0) {
      const remainingQuestions = unusedQuestions.filter(q => 
        !selectedQuestions.some(sq => sq.id === q.id)
      );
      
      if (remainingQuestions.length > 0) {
        const question = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
        selectedQuestions.push({
          ...question,
          adaptiveWeight: 1.0,
          targetSkill: this.mapQuestionToSkill(question),
          selectionReason: 'random_fill'
        });
      } else {
        break;
      }
    }

    console.log('Adaptive question selection:', {
      total: selectedQuestions.length,
      weakFocus: selectedQuestions.filter(q => q.selectionReason === 'weakness_focus').length,
      progression: selectedQuestions.filter(q => q.selectionReason === 'progression').length,
      review: selectedQuestions.filter(q => q.selectionReason === 'review').length,
      randomFill: selectedQuestions.filter(q => q.selectionReason === 'random_fill').length
    });

    return selectedQuestions;
  }

  // Map question to skill based on topic/skill field
  private mapQuestionToSkill(question: any): string {
    const skill = question.skill?.toLowerCase() || question.topic?.toLowerCase() || '';
    
    // Math mappings
    if (skill.includes('arithmetic') || skill.includes('basic')) return 'basic_arithmetic';
    if (skill.includes('linear') || skill.includes('equation')) return 'linear_equations';
    if (skill.includes('quadratic')) return 'quadratic_equations';
    if (skill.includes('system')) return 'systems_of_equations';
    if (skill.includes('geometry')) return 'geometry_basics';
    if (skill.includes('trigonometry') || skill.includes('trig')) return 'trigonometry';
    
    // English mappings
    if (skill.includes('reading') || skill.includes('comprehension')) return 'basic_reading';
    if (skill.includes('analysis') || skill.includes('inference')) return 'text_analysis';
    if (skill.includes('grammar') || skill.includes('usage')) return 'grammar_basics';
    if (skill.includes('advanced') && skill.includes('grammar')) return 'advanced_grammar';

    // Default based on subject
    if (question.subject === 'math' || question.section?.includes('math')) {
      return 'basic_arithmetic';
    } else {
      return 'basic_reading';
    }
  }

  // Calculate expected accuracy for a question based on user skill and question difficulty
  calculateExpectedAccuracy(skillId: string, difficulty: 'easy' | 'medium' | 'hard'): number {
    const skill = this.skillGraph.get(skillId);
    if (!skill) return 0.5;

    const difficultyELO = { easy: 1000, medium: 1300, hard: 1600 };
    const userELO = (skill.proficiencyScore / 100) * 1600 + 400; // Map 0-100 to 400-2000
    const questionELO = difficultyELO[difficulty];

    // ELO expected score formula
    return 1 / (1 + Math.pow(10, (questionELO - userELO) / 400));
  }

  // Get user's overall progress summary
  getProgressSummary(subject?: 'math' | 'english'): {
    totalSkills: number;
    unlockedSkills: number;
    masteredSkills: number;
    overallProficiency: number;
    nextSkillToFocus: string | null;
    weakestAreas: WeaknessPattern[];
  } {
    const skills = Array.from(this.skillGraph.values())
      .filter(skill => !subject || skill.subject === subject);

    const totalSkills = skills.length;
    const unlockedSkills = skills.filter(s => s.unlocked).length;
    const masteredSkills = skills.filter(s => s.masteryLevel === 'mastered').length;
    
    const overallProficiency = skills.reduce((sum, skill) => 
      sum + (skill.unlocked ? skill.proficiencyScore : 0), 0
    ) / Math.max(1, unlockedSkills);

    const nextSkill = this.getNextSkill(subject);
    const weakestAreas = this.identifyWeaknesses(subject).slice(0, 3);

    return {
      totalSkills,
      unlockedSkills,
      masteredSkills,
      overallProficiency,
      nextSkillToFocus: nextSkill?.name || null,
      weakestAreas
    };
  }

  // Get all skills (for debugging/admin)
  getAllSkills(): SkillNode[] {
    return Array.from(this.skillGraph.values());
  }

  // Reset all progress (for testing)
  resetProgress(): void {
    for (const skill of this.skillGraph.values()) {
      skill.proficiencyScore = 50;
      skill.masteryLevel = 'none';
      skill.attempts = 0;
      skill.correctAttempts = 0;
      skill.recentAccuracy = 0;
      skill.unlocked = skill.prerequisites.length === 0;
      skill.lastUpdated = new Date();
    }
  }
}

// Singleton instance
export const adaptiveLearningService = new AdaptiveLearningService();
export default adaptiveLearningService;
