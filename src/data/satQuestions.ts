
import { questionService, DatabaseQuestion } from '@/services/questionService';

export interface SATQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'grid-in';
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

// Cache for questions to avoid repeated database calls
const questionCache = new Map<string, SATQuestion[]>();
const cacheTimeout = 5 * 60 * 1000; // 5 minutes

export const getSATQuestions = async (
  section: 'reading-writing' | 'math', 
  module: 1 | 2,
  count: number = 27
): Promise<SATQuestion[]> => {
  const cacheKey = `${section}-${module}-${count}`;
  
  // Check cache first
  if (questionCache.has(cacheKey)) {
    const cached = questionCache.get(cacheKey)!;
    // Return cached questions if cache is still valid
    return cached;
  }

  try {
    const difficulty = module === 1 ? 'medium' : 'mixed'; // Module 1 is standard, Module 2 is adaptive
    
    const filters = {
      section,
      limit: count,
      ...(difficulty !== 'mixed' && { difficulty })
    };

    const dbQuestions = await questionService.getRandomQuestions(filters);
    const satQuestions = dbQuestions.map(q => questionService.convertToSATFormat(q));
    
    // Cache the results
    questionCache.set(cacheKey, satQuestions);
    setTimeout(() => questionCache.delete(cacheKey), cacheTimeout);
    
    return satQuestions;
  } catch (error) {
    console.error('Error fetching SAT questions:', error);
    // Return fallback questions if database fails
    return getFallbackQuestions(section, count);
  }
};

export const getAdaptiveQuestions = async (
  section: 'reading-writing' | 'math',
  performance: number, // 0-1 score from module 1
  count: number = 27
): Promise<SATQuestion[]> => {
  const difficulty = performance >= 0.7 ? 'hard' : performance >= 0.4 ? 'medium' : 'easy';
  
  try {
    const filters = {
      section,
      difficulty,
      limit: count
    };

    const dbQuestions = await questionService.getRandomQuestions(filters);
    const satQuestions = dbQuestions.map(q => questionService.convertToSATFormat(q));
    
    return satQuestions;
  } catch (error) {
    console.error('Error fetching adaptive questions:', error);
    return getFallbackQuestions(section, count);
  }
};

// Export all SAT questions for backward compatibility
export const allSATQuestions = {
  'reading-writing': [] as SATQuestion[],
  'math': [] as SATQuestion[]
};

// Fallback questions in case database is unavailable
const getFallbackQuestions = (section: 'reading-writing' | 'math', count: number): SATQuestion[] => {
  const fallbackQuestion: SATQuestion = {
    id: 'fallback-1',
    question: section === 'math' 
      ? 'If 2x + 5 = 13, what is the value of x?'
      : 'Which choice best maintains the sentence pattern established in the passage?',
    options: section === 'math' 
      ? ['2', '4', '8', '13']
      : ['However', 'Therefore', 'Additionally', 'In contrast'],
    correctAnswer: section === 'math' ? 1 : 0,
    explanation: section === 'math' 
      ? 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4'
      : 'The sentence pattern requires a contrasting transition word.',
    section,
    topic: section === 'math' ? 'Algebra' : 'Writing',
    difficulty: 'medium',
    type: 'multiple-choice'
  };

  return Array(count).fill(null).map((_, index) => ({
    ...fallbackQuestion,
    id: `fallback-${index + 1}`
  }));
};

// Track question usage for analytics
export const trackQuestionUsage = (questionId: string, sessionType: string) => {
  questionService.trackQuestionUsage(questionId, sessionType);
};

// Export the original functions for backward compatibility
export { questionService };
