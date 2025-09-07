import { supabase } from '@/integrations/supabase/client';

interface Mistake {
  question_text?: string;
  time_spent: number;
  difficulty: string;
  error_type?: string;
  created_at: string;
  topic: string;
  subject: string;
  user_answer?: string;
  correct_answer?: string;
}

interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  correct_rationale: string;
  skill: string;
  difficulty: string;
  domain: string;
  test: string;
}

interface WeaknessQuizRequest {
  mistakes: Mistake[];
  userName: string;
  totalMistakes: number;
}

interface WeaknessQuizResponse {
  questions: QuizQuestion[];
  weaknessTopics: string[];
  totalQuestions: number;
  estimatedTime: string;
}

class WeaknessQuizService {
  async generateWeaknessQuiz(request: WeaknessQuizRequest): Promise<WeaknessQuizResponse> {
    try {
      const { mistakes } = request;
      
      // Analyze user's mistakes to identify weak topics
      const weaknessTopics = this.analyzeWeaknessTopics(mistakes);
      
      // Fetch questions from database based on weak topics
      const questions = await this.fetchQuestionsForWeaknesses(weaknessTopics, mistakes);
      
      return {
        questions,
        weaknessTopics,
        totalQuestions: questions.length,
        estimatedTime: `${Math.ceil(questions.length * 1.5)} minutes`
      };
    } catch (error) {
      console.error('Error generating weakness quiz:', error);
      throw error;
    }
  }

  private analyzeWeaknessTopics(mistakes: Mistake[]): string[] {
    // Count mistakes by topic
    const topicCounts = new Map<string, number>();
    
    mistakes.forEach(mistake => {
      const topic = mistake.topic || 'General';
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
    
    // Get top 3-5 weak topics
    const sortedTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
    
    return sortedTopics;
  }

  private async fetchQuestionsForWeaknesses(weaknessTopics: string[], mistakes: Mistake[]): Promise<QuizQuestion[]> {
    try {
      // Get difficulty progression for each topic
      const topicDifficulties = this.getTopicDifficultyProgression(mistakes);
      
      const allQuestions: QuizQuestion[] = [];
      
      // Fetch questions for each weak topic
      for (const topic of weaknessTopics) {
        const targetDifficulty = topicDifficulties.get(topic) || 'Medium';
        
        // Query questions from database
        const { data, error } = await supabase
          .from('question_bank')
          .select('*')
          .eq('skill', topic)
          .eq('difficulty', targetDifficulty)
          .limit(2); // Get 2 questions per topic
        
        if (error) {
          console.error(`Error fetching questions for topic ${topic}:`, error);
          continue;
        }
        
        if (data && data.length > 0) {
          allQuestions.push(...data);
        }
      }
      
      // If we don't have enough questions, fill with general questions
      if (allQuestions.length < 5) {
        const { data, error } = await supabase
          .from('question_bank')
          .select('*')
          .in('difficulty', ['Medium', 'Hard'])
          .limit(5 - allQuestions.length);
        
        if (!error && data) {
          allQuestions.push(...data);
        }
      }
      
      // Shuffle and limit to 5 questions
      return this.shuffleArray(allQuestions).slice(0, 5);
    } catch (error) {
      console.error('Error fetching questions from database:', error);
      return [];
    }
  }

  private getTopicDifficultyProgression(mistakes: Mistake[]): Map<string, string> {
    const topicDifficulties = new Map<string, string>();
    
    mistakes.forEach(mistake => {
      const topic = mistake.topic || 'General';
      const currentDifficulty = mistake.difficulty || 'Easy';
      
      // Progress difficulty: Easy -> Medium -> Hard
      let nextDifficulty = 'Medium';
      if (currentDifficulty === 'Medium') {
        nextDifficulty = 'Hard';
      } else if (currentDifficulty === 'Hard') {
        nextDifficulty = 'Hard'; // Stay at Hard but get different questions
      }
      
      topicDifficulties.set(topic, nextDifficulty);
    });
    
    return topicDifficulties;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const weaknessQuizService = new WeaknessQuizService();
export default weaknessQuizService;




