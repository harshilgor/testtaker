import { supabase } from '@/integrations/supabase/client';

export interface WeaknessAnalysisResult {
  weakestSkill: string;
  nextDifficulty: 'Easy' | 'Medium' | 'Hard';
  questions: any[];
  subject: string;
}

/**
 * Analyzes user's past performance to identify weakest skill and determine next difficulty level
 */
export class WeaknessAnalysisService {
  /**
   * Analyze user performance and generate targeted quiz
   */
  async generateTargetedQuiz(
    userId: string,
    questionCount: number = 10
  ): Promise<WeaknessAnalysisResult | null> {
    try {
      // Step 1: Fetch user's question attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('question_attempts_v2')
        .select('question_id, topic, difficulty, is_correct, subject')
        .eq('user_id', userId);

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        return null;
      }

      if (!attempts || attempts.length === 0) {
        console.log('No attempts found for user');
        return null;
      }

      // Step 2: Calculate weakness scores for each skill
      const skillStats = new Map<
        string,
        {
          total: number;
          wrong: number;
          difficultyWrong: { Easy: number; Medium: number; Hard: number };
          subject?: string;
        }
      >();

      attempts.forEach((attempt) => {
        const skill = attempt.topic || 'Unknown';
        const stats = skillStats.get(skill) || {
          total: 0,
          wrong: 0,
          difficultyWrong: { Easy: 0, Medium: 0, Hard: 0 },
          subject: attempt.subject,
        };

        stats.total++;
        if (!attempt.is_correct) {
          stats.wrong++;
          // Track which difficulty level was wrong
          const difficulty = attempt.difficulty || 'Medium';
          if (difficulty === 'Easy' || difficulty === 'easy') {
            stats.difficultyWrong.Easy++;
          } else if (difficulty === 'Hard' || difficulty === 'hard') {
            stats.difficultyWrong.Hard++;
          } else {
            stats.difficultyWrong.Medium++;
          }
        }
        if (!stats.subject && attempt.subject) {
          stats.subject = attempt.subject;
        }
        skillStats.set(skill, stats);
      });

      // Step 3: Find weakest skill (only skills with at least 5 attempts)
      let weakestSkill: string | null = null;
      let highestWeaknessScore = 0;
      let weakestSkillStats: {
        total: number;
        wrong: number;
        difficultyWrong: { Easy: number; Medium: number; Hard: number };
        subject?: string;
      } | null = null;

      skillStats.forEach((stats, skill) => {
        if (stats.total >= 5) {
          const weaknessScore = stats.wrong / stats.total;
          if (weaknessScore > highestWeaknessScore) {
            highestWeaknessScore = weaknessScore;
            weakestSkill = skill;
            weakestSkillStats = stats;
          }
        }
      });

      if (!weakestSkill || !weakestSkillStats) {
        console.log('No skill with at least 5 attempts found');
        return null;
      }

      // Step 4: Determine next difficulty level
      const nextDifficulty = this.determineNextDifficulty(weakestSkillStats.difficultyWrong);

      // Step 5: Get already attempted question IDs to exclude
      // Convert to strings to handle both string and number IDs
      const attemptedQuestionIds = new Set(
        attempts
          .map((a) => a.question_id)
          .filter((id) => id != null)
          .map((id) => String(id))
      );

      // Step 6: Fetch 10 new questions
      const questions = await this.fetchTargetedQuestions(
        weakestSkill,
        nextDifficulty,
        attemptedQuestionIds,
        questionCount,
        weakestSkillStats.subject
      );

      if (questions.length === 0) {
        console.log('No new questions found for weakest skill');
        return null;
      }

      return {
        weakestSkill,
        nextDifficulty,
        questions,
        subject: weakestSkillStats.subject || 'math',
      };
    } catch (error) {
      console.error('Error in generateTargetedQuiz:', error);
      return null;
    }
  }

  /**
   * Determine next difficulty level based on what difficulty user got wrong
   */
  private determineNextDifficulty(
    difficultyWrong: { Easy: number; Medium: number; Hard: number }
  ): 'Easy' | 'Medium' | 'Hard' {
    const totalWrong = difficultyWrong.Easy + difficultyWrong.Medium + difficultyWrong.Hard;

    if (totalWrong === 0) {
      // If no wrong answers tracked, default to Medium
      return 'Medium';
    }

    // Find which difficulty has the most wrong answers
    const maxWrong = Math.max(difficultyWrong.Easy, difficultyWrong.Medium, difficultyWrong.Hard);

    if (difficultyWrong.Easy === maxWrong) {
      // User mostly got Easy wrong → choose Medium
      return 'Medium';
    } else if (difficultyWrong.Medium === maxWrong) {
      // User mostly got Medium wrong → choose Hard
      return 'Hard';
    } else {
      // User mostly got Hard wrong → keep Hard
      return 'Hard';
    }
  }

  /**
   * Fetch targeted questions from question_bank
   */
  private async fetchTargetedQuestions(
    skill: string,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    attemptedQuestionIds: Set<string>,
    limit: number,
    subject?: string
  ): Promise<any[]> {
    try {
      // Map difficulty to database format (capitalized)
      const difficultyMap: Record<string, string> = {
        Easy: 'Easy',
        Medium: 'Medium',
        Hard: 'Hard',
      };
      const dbDifficulty = difficultyMap[difficulty] || 'Medium';

      // Build query
      let query = supabase
        .from('question_bank')
        .select(
          `
          id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          correct_rationale,
          incorrect_rationale_a,
          incorrect_rationale_b,
          incorrect_rationale_c,
          incorrect_rationale_d,
          assessment,
          skill,
          difficulty,
          domain,
          test,
          question_prompt,
          image
        `
        )
        .eq('skill', skill)
        .eq('difficulty', dbDifficulty)
        .not('question_text', 'is', null)
        .not('option_a', 'is', null)
        .not('option_b', 'is', null)
        .not('option_c', 'is', null)
        .not('option_d', 'is', null)
        .not('correct_answer', 'is', null);

      // Apply subject filter if available
      if (subject) {
        const subjectLower = subject.toLowerCase();
        if (subjectLower === 'math') {
          query = query.or('test.ilike.%Math%,assessment.ilike.%Math%');
        } else if (subjectLower === 'english' || subjectLower.includes('reading') || subjectLower.includes('writing')) {
          query = query.or('test.ilike.%Reading%,test.ilike.%Writing%,assessment.ilike.%Reading%,assessment.ilike.%Writing%');
        }
      }

      // Get more questions than needed to ensure we have enough after filtering out attempted ones
      // Fetch 3x the limit to account for attempted questions being filtered out
      const { data, error } = await query.limit(Math.max(limit * 3, 50));

      if (error) {
        console.error('Error fetching questions:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log(`No questions found for skill: ${skill}, difficulty: ${dbDifficulty}`);
        return [];
      }

      // Filter out already attempted questions
      const newQuestions = data.filter((q) => {
        // question_id in question_attempts_v2 should match id in question_bank
        // Handle both string and number IDs
        const questionId = String(q.id);
        return !attemptedQuestionIds.has(questionId);
      });

      if (newQuestions.length === 0) {
        console.log(`All questions for skill ${skill} at difficulty ${dbDifficulty} have been attempted`);
        return [];
      }

      // Randomize and limit to requested count
      const shuffled = newQuestions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('Error in fetchTargetedQuestions:', error);
      return [];
    }
  }
}

export const weaknessAnalysisService = new WeaknessAnalysisService();

