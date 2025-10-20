import { useState, useCallback } from 'react';
import { infiniteQuestionService, InfiniteQuestionRequest } from '../services/infiniteQuestionService';
import { DatabaseQuestion } from '../services/questionService';

export interface UseInfiniteQuestionsReturn {
  questions: DatabaseQuestion[];
  loading: boolean;
  error: string | null;
  generateQuestions: (request: InfiniteQuestionRequest) => Promise<void>;
  clearQuestions: () => void;
  aiUsed: boolean;
}

export const useInfiniteQuestions = (): UseInfiniteQuestionsReturn => {
  const [questions, setQuestions] = useState<DatabaseQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiUsed, setAiUsed] = useState(false);

  const generateQuestions = useCallback(async (request: InfiniteQuestionRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await infiniteQuestionService.getInfiniteQuestions(request);
      
      setQuestions(response.questions);
      setAiUsed(response.ai_used);
      
      console.log(`Generated ${response.questions.length} questions (AI used: ${response.ai_used})`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
      console.error('Error generating questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearQuestions = useCallback(() => {
    setQuestions([]);
    setError(null);
    setAiUsed(false);
  }, []);

  return {
    questions,
    loading,
    error,
    generateQuestions,
    clearQuestions,
    aiUsed
  };
};

