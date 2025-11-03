// Real-time performance data calculation service
// This service calculates actual user performance data for the topics and difficulty components

import { DifficultyData, DomainData, SubdomainData } from '@/types';

// Interface matching the actual data structure from DataContext
interface DataContextQuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  topic: string;
  difficulty: string;
  subject: string;
  time_spent: number;
  created_at: string;
  is_correct: boolean;
  session_id: string | null;
  session_type: string;
  points_earned: number;
}

export class RealTimePerformanceService {
  /**
   * Calculate difficulty performance data from question attempts
   */
  static calculateDifficultyData(attempts: DataContextQuestionAttempt[]): DifficultyData[] {
    // Debug: Log unique difficulty values found in attempts
    const uniqueDifficulties = [...new Set(attempts.map(a => a.difficulty))];
    console.log('🔍 Unique difficulty values found:', uniqueDifficulties);
    
    const difficultyStats = attempts.reduce((acc, attempt) => {
      // Normalize difficulty to ensure consistent casing
      const normalizedDifficulty = this.normalizeDifficulty(attempt.difficulty || 'Unknown');
      
      if (!acc[normalizedDifficulty]) {
        acc[normalizedDifficulty] = {
          difficulty: normalizedDifficulty,
          correct: 0,
          total: 0,
          accuracy: 0
        };
      }
      
      acc[normalizedDifficulty].total++;
      if (attempt.is_correct) {
        acc[normalizedDifficulty].correct++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Debug: Log the stats before processing
    console.log('📊 Difficulty stats before processing:', difficultyStats);

    // Calculate accuracy and format data, then sort by difficulty order
    const result = Object.values(difficultyStats).map((stat: any) => ({
      difficulty: stat.difficulty,
      correct: stat.correct,
      total: stat.total,
      accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
    }));

    // Debug: Log the result before sorting
    console.log('📈 Result before sorting:', result);

    // Remove duplicates by difficulty level (in case there are any)
    const uniqueResult = result.reduce((acc, item) => {
      const existing = acc.find(existing => existing.difficulty === item.difficulty);
      if (existing) {
        // Merge the data if there are duplicates
        existing.correct += item.correct;
        existing.total += item.total;
        existing.accuracy = existing.total > 0 ? Math.round((existing.correct / existing.total) * 100) : 0;
        console.log(`🔄 Merged duplicate ${item.difficulty}: ${item.correct}/${item.total} + ${existing.correct}/${existing.total} = ${existing.correct}/${existing.total}`);
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as DifficultyData[]);

    // Sort by difficulty order: Easy, Medium, Hard
    const sortedResult = uniqueResult.sort((a, b) => {
      const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Unknown': 4 };
      return (order[a.difficulty as keyof typeof order] || 4) - (order[b.difficulty as keyof typeof order] || 4);
    });

    // Debug: Log the final result
    console.log('🎯 Final sorted result:', sortedResult);

    return sortedResult;
  }

  /**
   * Calculate domain performance data for Reading and Writing
   */
  static calculateReadingWritingDomains(attempts: DataContextQuestionAttempt[]): DomainData[] {
    // Filter for Reading and Writing attempts
    const rwAttempts = attempts.filter(attempt => 
      attempt.subject?.toLowerCase().includes('english') ||
      attempt.subject?.toLowerCase().includes('reading') ||
      attempt.subject?.toLowerCase().includes('writing') ||
      attempt.session_type?.toLowerCase().includes('reading') ||
      attempt.session_type?.toLowerCase().includes('writing')
    );

    // Initialize all domains with 0 values
    const allDomains = ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'];
    const domainStats: Record<string, { correct: number; total: number }> = {};
    allDomains.forEach(domain => {
      domainStats[domain] = { correct: 0, total: 0 };
    });

    // Calculate stats from attempts
    rwAttempts.forEach(attempt => {
      const domain = this.mapTopicToDomain(attempt.topic);
      domainStats[domain].total++;
      if (attempt.is_correct) {
        domainStats[domain].correct++;
      }
    });

    // Format data
    return allDomains.map(domain => ({
      domain,
      correct: domainStats[domain].correct,
      total: domainStats[domain].total,
      accuracy: domainStats[domain].total > 0 ? Math.round((domainStats[domain].correct / domainStats[domain].total) * 100) : 0
    }));
  }

  /**
   * Calculate domain performance data for Math
   */
  static calculateMathDomains(attempts: DataContextQuestionAttempt[]): DomainData[] {
    // Filter for Math attempts
    const mathAttempts = attempts.filter(attempt => 
      attempt.subject?.toLowerCase().includes('math') ||
      attempt.session_type?.toLowerCase().includes('math')
    );

    // Initialize all domains with 0 values
    const allDomains = ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis'];
    const domainStats: Record<string, { correct: number; total: number }> = {};
    allDomains.forEach(domain => {
      domainStats[domain] = { correct: 0, total: 0 };
    });

    // Calculate stats from attempts
    mathAttempts.forEach(attempt => {
      const domain = this.mapTopicToMathDomain(attempt.topic);
      domainStats[domain].total++;
      if (attempt.is_correct) {
        domainStats[domain].correct++;
      }
    });

    // Format data
    return allDomains.map(domain => ({
      domain,
      correct: domainStats[domain].correct,
      total: domainStats[domain].total,
      accuracy: domainStats[domain].total > 0 ? Math.round((domainStats[domain].correct / domainStats[domain].total) * 100) : 0
    }));
  }

  /**
   * Calculate subdomain (skill) performance data for Reading and Writing
   */
  static calculateReadingWritingSubdomains(attempts: DataContextQuestionAttempt[]): SubdomainData[] {
    const rwAttempts = attempts.filter(attempt => 
      attempt.subject?.toLowerCase().includes('english') ||
      attempt.subject?.toLowerCase().includes('reading') ||
      attempt.subject?.toLowerCase().includes('writing') ||
      attempt.session_type?.toLowerCase().includes('reading') ||
      attempt.session_type?.toLowerCase().includes('writing')
    );

    // Initialize all possible skills for Reading and Writing from question_bank
    // This list should match what's available in the database
    const allSkills = [
      'Comprehension',
      'Command of Evidence',
      'Central Ideas and Details',
      'Words in Context',
      'Transitions',
      'Rhetorical Synthesis',
      'Form, Structure, and Sense',
      'Boundaries'
    ];

    // Initialize all skills with 0 values
    const subdomainStats: Record<string, { correct: number; total: number }> = {};
    allSkills.forEach(skill => {
      subdomainStats[skill] = { correct: 0, total: 0 };
    });

    // Add stats from attempts (including any skills not in our predefined list)
    rwAttempts.forEach(attempt => {
      const subdomain = attempt.topic || 'Unknown Skill';
      if (!subdomainStats[subdomain]) {
        subdomainStats[subdomain] = { correct: 0, total: 0 };
      }
      subdomainStats[subdomain].total++;
      if (attempt.is_correct) {
        subdomainStats[subdomain].correct++;
      }
    });

    // Format and return all skills
    return allSkills.map(skill => ({
      subdomain: skill,
      correct: subdomainStats[skill]?.correct || 0,
      total: subdomainStats[skill]?.total || 0,
      accuracy: subdomainStats[skill]?.total > 0 ? Math.round((subdomainStats[skill]!.correct / subdomainStats[skill]!.total) * 100) : 0
    }));
  }

  /**
   * Calculate subdomain (skill) performance data for Math
   */
  static calculateMathSubdomains(attempts: DataContextQuestionAttempt[]): SubdomainData[] {
    const mathAttempts = attempts.filter(attempt => 
      attempt.subject?.toLowerCase().includes('math') ||
      attempt.session_type?.toLowerCase().includes('math')
    );

    // Initialize all possible skills for Math from question_bank
    // This list should match what's available in the database
    const allSkills = [
      'Linear Equations',
      'Systems of Linear Equations',
      'Quadratic Equations',
      'Equivalent Expressions',
      'Nonlinear Equations in One Variable',
      'System of Equations in Two Variables',
      'Solving and Analyzing Radical Equations',
      'Operations with Polynomials',
      'Operations with Rational Expressions',
      'Operations with Exponential Expressions',
      'Operations with Rational and Irrational Numbers',
      'Rates and Proportional Relationships',
      'Ratios and Units',
      'Percentage',
      'Evaluate Statistical Claims',
      'Inference and Sampling',
      'Estimate Statistics',
      'Statistics',
      'Probability',
      'Geometry and Trigonometry',
      'Congruence, Similarity, and Angle Relationships',
      'Right Triangles and Trigonometry',
      'Circles',
      'Complex Numbers'
    ];

    // Initialize all skills with 0 values
    const subdomainStats: Record<string, { correct: number; total: number }> = {};
    allSkills.forEach(skill => {
      subdomainStats[skill] = { correct: 0, total: 0 };
    });

    // Add stats from attempts (including any skills not in our predefined list)
    mathAttempts.forEach(attempt => {
      const subdomain = attempt.topic || 'Unknown Skill';
      if (!subdomainStats[subdomain]) {
        subdomainStats[subdomain] = { correct: 0, total: 0 };
      }
      subdomainStats[subdomain].total++;
      if (attempt.is_correct) {
        subdomainStats[subdomain].correct++;
      }
    });

    // Format and return all skills
    return allSkills.map(skill => ({
      subdomain: skill,
      correct: subdomainStats[skill]?.correct || 0,
      total: subdomainStats[skill]?.total || 0,
      accuracy: subdomainStats[skill]?.total > 0 ? Math.round((subdomainStats[skill]!.correct / subdomainStats[skill]!.total) * 100) : 0
    }));
  }

  /**
   * Normalize difficulty string to ensure consistent casing and format
   */
  private static normalizeDifficulty(difficulty: string): string {
    if (!difficulty) return 'Unknown';
    
    const normalized = difficulty.toLowerCase().trim();
    
    // Debug: Log the normalization process
    console.log(`🔄 Normalizing difficulty: "${difficulty}" -> "${normalized}"`);
    
    // Map common variations to standard format
    switch (normalized) {
      case 'easy':
      case 'e':
      case '1':
        console.log(`✅ Mapped to: Easy`);
        return 'Easy';
      case 'medium':
      case 'med':
      case 'm':
      case '2':
        console.log(`✅ Mapped to: Medium`);
        return 'Medium';
      case 'hard':
      case 'h':
      case '3':
        console.log(`✅ Mapped to: Hard`);
        return 'Hard';
      default:
        console.log(`⚠️ Unknown difficulty, mapped to: Unknown`);
        return 'Unknown';
    }
  }

  /**
   * Map topic to Reading and Writing domain
   */
  static mapTopicToDomain(topic: string): string {
    if (!topic) return 'Unknown Domain';
    
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('central') || topicLower.includes('ideas') || 
        topicLower.includes('details') || topicLower.includes('evidence') ||
        topicLower.includes('inference') || topicLower.includes('data')) {
      return 'Information and Ideas';
    }
    
    if (topicLower.includes('words') || topicLower.includes('context') ||
        topicLower.includes('structure') || topicLower.includes('purpose') ||
        topicLower.includes('connections')) {
      return 'Craft and Structure';
    }
    
    if (topicLower.includes('rhetorical') || topicLower.includes('synthesis') ||
        topicLower.includes('transition')) {
      return 'Expression of Ideas';
    }
    
    if (topicLower.includes('punctuation') || topicLower.includes('sentence') ||
        topicLower.includes('verb') || topicLower.includes('tense') ||
        topicLower.includes('convention')) {
      return 'Standard English Conventions';
    }
    
    return 'Information and Ideas'; // Default fallback
  }

  /**
   * Map topic to Math domain
   */
  static mapTopicToMathDomain(topic: string): string {
    if (!topic) return 'Unknown Domain';
    
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('algebra') || topicLower.includes('equation') ||
        topicLower.includes('linear') || topicLower.includes('quadratic') ||
        topicLower.includes('system')) {
      return 'Algebra';
    }
    
    if (topicLower.includes('polynomial') || topicLower.includes('trigonometry') ||
        topicLower.includes('complex') || topicLower.includes('advanced')) {
      return 'Advanced Math';
    }
    
    if (topicLower.includes('statistics') || topicLower.includes('probability') ||
        topicLower.includes('data') || topicLower.includes('analysis')) {
      return 'Problem-Solving and Data Analysis';
    }
    
    return 'Algebra'; // Default fallback
  }

  /**
   * Calculate overall accuracy for a set of attempts
   */
  static calculateOverallAccuracy(attempts: DataContextQuestionAttempt[]): number {
    if (attempts.length === 0) return 0;
    
    const correctCount = attempts.filter(attempt => attempt.is_correct).length;
    return Math.round((correctCount / attempts.length) * 100);
  }

  /**
   * Get default empty data when no attempts exist
   */
  static getDefaultDifficultyData(): DifficultyData[] {
    return [
      { difficulty: 'Easy', correct: 0, total: 0, accuracy: 0 },
      { difficulty: 'Medium', correct: 0, total: 0, accuracy: 0 },
      { difficulty: 'Hard', correct: 0, total: 0, accuracy: 0 }
    ];
  }

  static getDefaultReadingWritingDomains(): DomainData[] {
    return [
      { domain: 'Information and Ideas', correct: 0, total: 0, accuracy: 0 },
      { domain: 'Craft and Structure', correct: 0, total: 0, accuracy: 0 },
      { domain: 'Expression of Ideas', correct: 0, total: 0, accuracy: 0 },
      { domain: 'Standard English Conventions', correct: 0, total: 0, accuracy: 0 }
    ];
  }

  static getDefaultMathDomains(): DomainData[] {
    return [
      { domain: 'Algebra', correct: 0, total: 0, accuracy: 0 },
      { domain: 'Advanced Math', correct: 0, total: 0, accuracy: 0 },
      { domain: 'Problem-Solving and Data Analysis', correct: 0, total: 0, accuracy: 0 }
    ];
  }
}
