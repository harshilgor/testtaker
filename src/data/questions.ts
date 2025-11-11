
import { questionService } from '@/services/questionService';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: 'math' | 'english';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_prompt?: string;
  imageUrl?: string;
  hasImage?: boolean;
  imageAltText?: string;
  chartData?: any;
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

// Cache for questions
const questionCache = new Map<string, Question[]>();
const cacheTimeout = 5 * 60 * 1000; // 5 minutes

export const getRandomQuestion = async (subject: 'math' | 'english'): Promise<Question> => {
  const questions = await getQuestionsBySubject(subject, 1);
  return questions[0] || getFallbackQuestion(subject);
};

export const getQuestionsBySubject = async (
  subject: 'math' | 'english', 
  count: number = 10
): Promise<Question[]> => {
  const cacheKey = `${subject}-${count}`;
  
  if (questionCache.has(cacheKey)) {
    const cached = questionCache.get(cacheKey)!;
    return cached;
  }

  try {
    const section = subject === 'math' ? 'math' : 'reading-writing';
    const filters = {
      section,
      limit: count
    };

    const dbQuestions = await questionService.getRandomQuestions(filters);
    const questions = dbQuestions.map(q => {
      const converted = questionService.convertToLegacyFormat(q);
      // Ensure subject is properly typed
      return {
        ...converted,
        subject: converted.subject as 'math' | 'english'
      };
    });
    
    questionCache.set(cacheKey, questions);
    setTimeout(() => questionCache.delete(cacheKey), cacheTimeout);
    
    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return Array(count).fill(null).map(() => getFallbackQuestion(subject));
  }
};

export const getQuestionsByTopics = async (
  subject: 'math' | 'english',
  topics: string[],
  count: number = 10
): Promise<Question[]> => {
  try {
    const section = subject === 'math' ? 'math' : 'reading-writing';
    const allQuestions: Question[] = [];
    
    for (const topic of topics) {
      const filters = {
        section,
        skill: topic,
        limit: Math.ceil(count / topics.length)
      };

      const dbQuestions = await questionService.getRandomQuestions(filters);
      const questions = dbQuestions.map(q => {
        const converted = questionService.convertToLegacyFormat(q);
        // Ensure subject is properly typed
        return {
          ...converted,
          subject: converted.subject as 'math' | 'english'
        };
      });
      allQuestions.push(...questions);
    }
    
    // Shuffle and limit to requested count
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching questions by topics:', error);
    return Array(count).fill(null).map(() => getFallbackQuestion(subject));
  }
};

const getFallbackQuestion = (subject: 'math' | 'english'): Question => ({
  id: `fallback-${Date.now()}-${Math.random()}`,
  question: subject === 'math' 
    ? 'If 3x + 7 = 22, what is the value of x?'
    : 'Which sentence best supports the main idea?',
  options: subject === 'math' 
    ? ['3', '5', '7', '15']
    : ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: 1,
  explanation: subject === 'math' 
    ? 'Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.'
    : 'This option best supports the main argument.',
  subject,
  topic: subject === 'math' ? 'Algebra' : 'Reading Comprehension',
  difficulty: 'medium'
});

// Export mock test questions for backward compatibility
export const mockTestQuestions = {
  math: [] as Question[],
  english: [] as Question[]
};

// Export for backward compatibility
export { questionService };
