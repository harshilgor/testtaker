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
  image?: boolean;
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
    console.log('Getting random questions with filters:', filters);
    
    try {
      // Build optimized query to get all required fields from question_bank
      let query = supabase
        .from('question_bank')
        .select(`
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
        `)
        .not('question_text', 'is', null);

      // Apply filters for immediate optimization
      if (filters.section) {
        query = query.eq('assessment', filters.section);
      }
      
      if (filters.difficulty && filters.difficulty !== 'mixed') {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      if (filters.skill) {
        query = query.eq('skill', filters.skill);
      }
      
      if (filters.domain) {
        query = query.eq('domain', filters.domain);
      }

      // Optimized limit - get exact amount needed plus small buffer
      const limit = filters.limit || 10;
      
      const { data, error } = await query
        .order('id')
        .limit(limit * 2); // Get more to ensure we have enough after filtering

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No questions found with filters:', filters);
        return [];
      }

      // Quick shuffle for randomization and format the data
      const shuffled = data.sort(() => Math.random() - 0.5);
      const questions = shuffled.slice(0, limit).map(q => ({
        id: q.id?.toString() || '',
        question_text: q.question_text || '',
        option_a: q.option_a || '',
        option_b: q.option_b || '',
        option_c: q.option_c || '',
        option_d: q.option_d || '',
        correct_answer: q.correct_answer || '',
        correct_rationale: q.correct_rationale || '',
        incorrect_rationale_a: q.incorrect_rationale_a || '',
        incorrect_rationale_b: q.incorrect_rationale_b || '',
        incorrect_rationale_c: q.incorrect_rationale_c || '',
        incorrect_rationale_d: q.incorrect_rationale_d || '',
        section: q.assessment || '',
        skill: q.skill || '',
        difficulty: q.difficulty || 'medium',
        domain: q.domain || '',
        test_name: q.test || '',
        question_type: 'multiple-choice',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {},
        image: q.image === 'true' || q.image === 'True' || q.image === '1' || false
      }));

      console.log(`Successfully loaded ${questions.length} questions from question_bank`);
      return questions;
    } catch (error) {
      console.error('Error in getRandomQuestions:', error);
      return [];
    }
  }

  async getQuestionById(id: string): Promise<DatabaseQuestion | null> {
    console.log('Getting question by ID:', id);
    
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      console.error('Invalid question ID:', id);
      return null;
    }

    const { data, error } = await supabase
      .from('question_bank')
      .select(`
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
      `)
      .eq('id', numericId)
      .not('question_text', 'is', null)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id?.toString() || '',
      question_text: data.question_text || '',
      option_a: data.option_a || '',
      option_b: data.option_b || '',
      option_c: data.option_c || '',
      option_d: data.option_d || '',
      correct_answer: data.correct_answer || '',
      correct_rationale: data.correct_rationale || '',
      incorrect_rationale_a: data.incorrect_rationale_a || '',
      incorrect_rationale_b: data.incorrect_rationale_b || '',
      incorrect_rationale_c: data.incorrect_rationale_c || '',
      incorrect_rationale_d: data.incorrect_rationale_d || '',
      section: data.assessment || '',
      skill: data.skill || '',
      difficulty: data.difficulty || 'medium',
      domain: data.domain || '',
      test_name: data.test || '',
      question_type: 'multiple-choice',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {},
      image: data.image === 'true' || data.image === 'True' || data.image === '1' || false
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

  convertToLegacyFormat(dbQuestion: DatabaseQuestion) {
    const getSubject = (section: string): 'math' | 'english' => {
      if (section === 'math' || section === 'Math') return 'math';
      if (section === 'reading-writing' || section === 'Reading and Writing' || section === 'english' || section === 'English') return 'english';
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
      imageUrl: dbQuestion.image ? `https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${dbQuestion.id}.png` : undefined,
      hasImage: dbQuestion.image || false
    };
  }

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
      imageUrl: dbQuestion.image ? `https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${dbQuestion.id}.png` : undefined,
      hasImage: dbQuestion.image || false
    };
  }
}

export const questionService = new QuestionService();
