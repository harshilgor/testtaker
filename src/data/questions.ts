
import { supabase } from '@/integrations/supabase/client';
import { questionService, DatabaseQuestion } from '@/services/questionService';

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  subject: 'math' | 'english';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  section?: string;
  type?: string;
  imageUrl?: string;
  rationales?: {
    correct: string;
    incorrect: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
    };
  };
}

export const getRandomQuestion = async (subject: 'math' | 'english'): Promise<Question> => {
  const filters = {
    section: subject === 'math' ? 'math' : 'reading-writing',
    limit: 1
  };
  
  const questions = await questionService.getRandomQuestions(filters);
  
  if (questions.length === 0) {
    throw new Error(`No questions available for ${subject}`);
  }
  
  return questionService.convertToLegacyFormat(questions[0]);
};

export const getQuestionsBySubject = async (
  subject: 'math' | 'english', 
  count: number = 10
): Promise<Question[]> => {
  const filters = {
    section: subject === 'math' ? 'math' : 'reading-writing',
    limit: count
  };
  
  const questions = await questionService.getRandomQuestions(filters);
  return questions.map(q => questionService.convertToLegacyFormat(q));
};

export const getQuestionsByTopics = async (
  subject: 'math' | 'english',
  topics: string[],
  count: number = 10
): Promise<Question[]> => {
  try {
    // If no specific topics, get all questions for the subject
    if (topics.length === 0) {
      return getQuestionsBySubject(subject, count);
    }

    // Get questions for specific topics from main_question_bank
    let query = supabase
      .from('main_question_bank')
      .select('*')
      .eq('section', subject === 'math' ? 'math' : 'reading-writing')
      .not('question_text', 'is', null);

    // Filter by topics if provided
    if (topics.length > 0) {
      query = query.in('skill', topics);
    }

    const { data, error } = await query.limit(count);

    if (error) {
      console.error('Error fetching questions by topics:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn(`No questions found for ${subject} with topics:`, topics);
      return [];
    }

    // Convert to DatabaseQuestion format and then to legacy format
    const dbQuestions: DatabaseQuestion[] = data.map(q => ({
      ...q,
      id: q.id?.toString() || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {}
    }));

    return dbQuestions.map(q => questionService.convertToLegacyFormat(q));
  } catch (error) {
    console.error('Error in getQuestionsByTopics:', error);
    return [];
  }
};

export { questionService };
