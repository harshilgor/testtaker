
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
    // Use direct query to main_question_bank
    let query = supabase
      .from('main_question_bank')
      .select('*');

    // Apply filters
    if (filters.section) {
      query = query.eq('section', filters.section);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.skill) {
      query = query.eq('skill', filters.skill);
    }
    if (filters.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      // Convert string IDs to numbers for main_question_bank
      const numericIds = filters.excludeIds.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (numericIds.length > 0) {
        query = query.not('id', 'in', `(${numericIds.join(',')})`);
      }
    }

    // Filter out null questions and add ordering
    query = query.not('question_text', 'is', null).order('id');
    
    const { data, error } = await query.limit(filters.limit || 10);

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    // Convert bigint IDs to strings and add missing fields
    const questions = (data || []).map(q => ({
      ...q,
      id: q.id?.toString() || '',
      is_active: true, // main_question_bank doesn't have is_active, assume all active
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {}
    }));

    // Shuffle the results to get random questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, filters.limit || 10);
  }

  async getQuestionById(id: string): Promise<DatabaseQuestion | null> {
    // Convert string ID to number for main_question_bank
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      console.error('Invalid question ID:', id);
      return null;
    }

    const { data, error } = await supabase
      .from('main_question_bank')
      .select('*')
      .eq('id', numericId)
      .not('question_text', 'is', null)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      id: data.id?.toString() || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {}
    };
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
    // Map database section to expected subject type
    const getSubject = (section: string): 'math' | 'english' => {
      if (section === 'math') return 'math';
      if (section === 'reading-writing') return 'english';
      // Default fallback
      return 'english';
    };

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
      subject: getSubject(dbQuestion.section),
      topic: dbQuestion.skill,
      difficulty: dbQuestion.difficulty as 'easy' | 'medium' | 'hard',
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
      },
      // Include image URL from metadata
      imageUrl: dbQuestion.metadata?.image_url
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
      },
      // Include image URL from metadata
      imageUrl: dbQuestion.metadata?.image_url
    };
  }
}

export const questionService = new QuestionService();
