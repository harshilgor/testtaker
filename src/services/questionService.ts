
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  correct_rationale: string;
  incorrect_rationale_a?: string;
  incorrect_rationale_b?: string;
  incorrect_rationale_c?: string;
  incorrect_rationale_d?: string;
  section: string;
  skill: string;
  difficulty: string;
  domain: string;
  test_name: string;
  question_type: string;
  metadata?: any;
}

export interface QuestionFilters {
  section?: string;
  difficulty?: string;
  skill?: string;
  domain?: string;
  limit?: number;
  excludeIds?: string[];
}

class QuestionService {
  async getRandomQuestions(filters: QuestionFilters = {}): Promise<DatabaseQuestion[]> {
    const { data, error } = await supabase.rpc('get_random_questions', {
      p_section: filters.section || null,
      p_difficulty: filters.difficulty || null,
      p_skill: filters.skill || null,
      p_domain: filters.domain || null,
      p_limit: filters.limit || 10,
      p_exclude_ids: filters.excludeIds || []
    });

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return data || [];
  }

  async getQuestionById(id: string): Promise<DatabaseQuestion | null> {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return null;
    }

    return data;
  }

  async importQuestions(questionsData: any[]): Promise<number> {
    const { data, error } = await supabase.rpc('import_questions_batch', {
      questions_data: questionsData
    });

    if (error) {
      console.error('Error importing questions:', error);
      throw error;
    }

    return data || 0;
  }

  async trackQuestionUsage(questionId: string, sessionType: string, sessionId?: string) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) return;

    const { error } = await supabase
      .from('question_usage')
      .insert({
        user_id: user.user.id,
        question_id: questionId,
        session_type: sessionType,
        session_id: sessionId
      });

    if (error) {
      console.error('Error tracking question usage:', error);
    }
  }

  // Convert database question to the format expected by existing components
  convertToLegacyFormat(dbQuestion: DatabaseQuestion) {
    return {
      id: dbQuestion.id,
      question: dbQuestion.question_text,
      options: [
        dbQuestion.option_a,
        dbQuestion.option_b,
        dbQuestion.option_c,
        dbQuestion.option_d
      ],
      correctAnswer: dbQuestion.correct_answer === 'A' ? 0 : 
                    dbQuestion.correct_answer === 'B' ? 1 :
                    dbQuestion.correct_answer === 'C' ? 2 : 3,
      explanation: dbQuestion.correct_rationale,
      subject: dbQuestion.section === 'math' ? 'math' : 'english',
      topic: dbQuestion.skill,
      difficulty: dbQuestion.difficulty,
      section: dbQuestion.section,
      type: dbQuestion.question_type,
      rationales: {
        correct: dbQuestion.correct_rationale,
        incorrect: {
          A: dbQuestion.incorrect_rationale_a,
          B: dbQuestion.incorrect_rationale_b,
          C: dbQuestion.incorrect_rationale_c,
          D: dbQuestion.incorrect_rationale_d
        }
      }
    };
  }

  // Convert database question to SAT format
  convertToSATFormat(dbQuestion: DatabaseQuestion) {
    return {
      id: dbQuestion.id,
      question: dbQuestion.question_text,
      options: dbQuestion.question_type === 'multiple-choice' ? [
        dbQuestion.option_a,
        dbQuestion.option_b,
        dbQuestion.option_c,
        dbQuestion.option_d
      ] : undefined,
      correctAnswer: dbQuestion.question_type === 'multiple-choice' ? 
        (dbQuestion.correct_answer === 'A' ? 0 : 
         dbQuestion.correct_answer === 'B' ? 1 :
         dbQuestion.correct_answer === 'C' ? 2 : 3) : 
        dbQuestion.correct_answer,
      explanation: dbQuestion.correct_rationale,
      section: dbQuestion.section as 'reading-writing' | 'math',
      topic: dbQuestion.skill,
      difficulty: dbQuestion.difficulty as 'easy' | 'medium' | 'hard',
      type: dbQuestion.question_type as 'multiple-choice' | 'grid-in',
      rationales: {
        correct: dbQuestion.correct_rationale,
        incorrect: {
          A: dbQuestion.incorrect_rationale_a,
          B: dbQuestion.incorrect_rationale_b,
          C: dbQuestion.incorrect_rationale_c,
          D: dbQuestion.incorrect_rationale_d
        }
      }
    };
  }
}

export const questionService = new QuestionService();
