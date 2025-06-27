
import { questionService } from './questionService';

export interface AdaptiveTestQuestion {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  module: 1 | 2;
  adaptivePath?: 'easy' | 'hard';
}

export interface ModulePerformance {
  section: 'reading-writing' | 'math';
  module: 1 | 2;
  correctCount: number;
  totalQuestions: number;
  performance: number;
  adaptivePath?: 'easy' | 'hard';
}

class AdaptiveTestService {
  // Question counts per section and module
  private readonly questionCounts = {
    'reading-writing': { module1: 27, module2: 27 },
    'math': { module1: 22, module2: 22 }
  };

  // Time limits per section and module (in seconds)
  private readonly timeLimits = {
    'reading-writing': { module1: 32 * 60, module2: 32 * 60 },
    'math': { module1: 35 * 60, module2: 35 * 60 }
  };

  // Performance thresholds for adaptive routing
  private readonly adaptiveThresholds = {
    'reading-writing': 0.7, // 70% for harder module 2
    'math': 0.75 // 75% for harder module 2
  };

  async getModuleQuestions(
    section: 'reading-writing' | 'math',
    module: 1 | 2,
    adaptivePath?: 'easy' | 'hard'
  ): Promise<AdaptiveTestQuestion[]> {
    const questionCount = this.questionCounts[section][`module${module}` as keyof typeof this.questionCounts[typeof section]];
    
    let difficulty: string;
    
    if (module === 1) {
      difficulty = 'mixed'; // Module 1 always has mixed difficulty
    } else {
      difficulty = adaptivePath === 'hard' ? 'hard' : 'easy';
    }

    try {
      const filters = {
        section: section === 'reading-writing' ? 'Reading and Writing' : 'Math',
        limit: questionCount,
        ...(difficulty !== 'mixed' && { difficulty })
      };

      const dbQuestions = await questionService.getRandomQuestions(filters);
      
      return dbQuestions.map(q => ({
        id: q.id,
        content: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctAnswer: q.correct_answer === 'A' ? 0 : 
                      q.correct_answer === 'B' ? 1 :
                      q.correct_answer === 'C' ? 2 : 3,
        explanation: q.correct_rationale,
        section,
        topic: q.skill,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        module,
        adaptivePath
      }));
    } catch (error) {
      console.error('Error fetching adaptive questions:', error);
      return this.getFallbackQuestions(section, module, questionCount, adaptivePath);
    }
  }

  calculateModulePerformance(
    section: 'reading-writing' | 'math',
    module: 1 | 2,
    answers: { [questionId: string]: number },
    questions: AdaptiveTestQuestion[]
  ): ModulePerformance {
    let correctCount = 0;
    
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const performance = correctCount / totalQuestions;
    const threshold = this.adaptiveThresholds[section];
    
    const adaptivePath = module === 1 ? (performance >= threshold ? 'hard' : 'easy') : undefined;

    return {
      section,
      module,
      correctCount,
      totalQuestions,
      performance,
      adaptivePath
    };
  }

  getTimeLimit(section: 'reading-writing' | 'math', module: 1 | 2): number {
    return this.timeLimits[section][`module${module}` as keyof typeof this.timeLimits[typeof section]];
  }

  calculateSATScore(modulePerformances: ModulePerformance[]): {
    readingWritingScore: number;
    mathScore: number;
    totalScore: number;
  } {
    const rwPerformances = modulePerformances.filter(p => p.section === 'reading-writing');
    const mathPerformances = modulePerformances.filter(p => p.section === 'math');

    // Calculate Reading & Writing score
    let rwScore = 200; // Base score
    if (rwPerformances.length > 0) {
      const totalCorrect = rwPerformances.reduce((sum, p) => sum + p.correctCount, 0);
      const totalQuestions = rwPerformances.reduce((sum, p) => sum + p.totalQuestions, 0);
      const rwPerformance = totalCorrect / totalQuestions;
      
      // Check if they took the hard path in module 2
      const tookHardPath = rwPerformances.some(p => p.module === 2 && p.adaptivePath === 'hard');
      const maxScore = tookHardPath ? 800 : 650; // Score ceiling based on adaptive path
      
      rwScore = Math.round(200 + (rwPerformance * (maxScore - 200)));
    }

    // Calculate Math score
    let mathScore = 200; // Base score
    if (mathPerformances.length > 0) {
      const totalCorrect = mathPerformances.reduce((sum, p) => sum + p.correctCount, 0);
      const totalQuestions = mathPerformances.reduce((sum, p) => sum + p.totalQuestions, 0);
      const mathPerformance = totalCorrect / totalQuestions;
      
      // Check if they took the hard path in module 2
      const tookHardPath = mathPerformances.some(p => p.module === 2 && p.adaptivePath === 'hard');
      const maxScore = tookHardPath ? 800 : 650; // Score ceiling based on adaptive path
      
      mathScore = Math.round(200 + (mathPerformance * (maxScore - 200)));
    }

    return {
      readingWritingScore: rwScore,
      mathScore: mathScore,
      totalScore: rwScore + mathScore
    };
  }

  private getFallbackQuestions(
    section: 'reading-writing' | 'math',
    module: 1 | 2,
    count: number,
    adaptivePath?: 'easy' | 'hard'
  ): AdaptiveTestQuestion[] {
    const fallbackQuestion: AdaptiveTestQuestion = {
      id: `fallback-${section}-m${module}-1`,
      content: section === 'math' 
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
      difficulty: adaptivePath === 'hard' ? 'hard' : adaptivePath === 'easy' ? 'easy' : 'medium',
      module,
      adaptivePath
    };

    return Array(count).fill(null).map((_, index) => ({
      ...fallbackQuestion,
      id: `fallback-${section}-m${module}-${index + 1}`
    }));
  }
}

export const adaptiveTestService = new AdaptiveTestService();
