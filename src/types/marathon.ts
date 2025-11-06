
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

export interface QuestionAttempt {
  questionId: string;
  subject: 'math' | 'english';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  showAnswerUsed: boolean;
  flagged: boolean;
  timestamp: Date;
}

export interface WeakTopic {
  topic: string;
  subject: 'math' | 'english';
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface MarathonSettings {
  subjects: ('math' | 'english' | 'both')[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timedMode: boolean;
  timeGoalMinutes?: number;
  calculatorEnabled: boolean;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  adaptiveLearning?: boolean;
  skill?: string; // Optional: specific skill for IRT-based marathon
}
