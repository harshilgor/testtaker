// Unified type definitions for the entire application
// This file consolidates all interfaces and types to eliminate duplication

// ============================================================================
// CORE QUESTION TYPES
// ============================================================================

export interface BaseQuestion {
  id: string | number;
  content?: string;
  explanation?: string;
  imageUrl?: string;
  hasImage?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  subject?: 'math' | 'english' | 'reading-writing';
}

export interface QuizQuestion extends BaseQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: 'math' | 'english';
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

export interface SATQuestion extends BaseQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  section: 'reading-writing' | 'math';
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

export interface GeneratedQuestion {
  passage?: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  rationales: {
    correct: string;
    A: string;
    B: string;
    C: string;
    D: string;
  };
  diagram_prompt?: string;
}

// ============================================================================
// PERFORMANCE & ANALYTICS TYPES
// ============================================================================

export interface QuestionAttempt {
  id: string;
  questionId: string;
  userAnswer: number | string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
  test?: string;
  assessment?: string;
  topic?: string;
  skill?: string;
  difficulty?: string;
}

export interface MarathonSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  showAnswerUsed: number;
  subjects: ('math' | 'english' | 'both')[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timedMode: boolean;
  timeGoalMinutes?: number;
  attempts?: QuestionAttempt[];
}

export interface PerformanceStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageAccuracy: number;
  totalSessions: number;
}

export interface TopicPerformance {
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number;
  avgTime: number;
}

export interface TrendData {
  date: string;
  accuracy: number;
  questions: number;
  timeSpent: number;
}

// ============================================================================
// AI & PROMPT TYPES
// ============================================================================

export interface QuestionPrompt {
  skill: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  version?: string;
  lastUpdated?: string;
}

export interface QuestionGenerationRequest {
  skill: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count?: number;
}

export interface QuestionGenerationResponse {
  questions: GeneratedQuestion[];
  success: boolean;
  error?: string;
}

// ============================================================================
// UI & COMPONENT TYPES
// ============================================================================

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface DifficultyData {
  difficulty: string;
  accuracy: number;
  total: number;
  correct: number;
}

export interface DomainData {
  domain: string;
  accuracy: number;
  total: number;
  correct: number;
}

export interface SubdomainData {
  subdomain: string;
  accuracy: number;
  total: number;
  correct: number;
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface DatabaseQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  skill?: string;
  domain?: string;
  rationales?: any;
}

export interface InfiniteQuestionRequest {
  subject: 'math' | 'english';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  count: number;
  excludeIds?: string[];
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface DataContextType {
  questionAttempts: QuestionAttempt[];
  marathonSessions: MarathonSession[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SubjectType = 'all' | 'math' | 'reading_and_writing';
export type MetricType = 'best' | 'worst' | 'time_intensive' | 'quick';
export type ViewMode = 'accuracy' | 'count';

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './question';
export * from './marathon';
