// Unified question interfaces for all question types across the app

export interface BaseQuestion {
  id: string | number;
  content?: string;
  explanation?: string;
  imageUrl?: string;
  hasImage?: boolean;
  difficulty?: string;
  topic?: string;
  subject?: string;
}

export interface QuizQuestion extends BaseQuestion {
  id: number;
  question: string;
  content?: string; // Optional since it can be derived from question
  options: string[];
  correctAnswer: number;
  explanation?: string;
  question_prompt?: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  // Additional fields for incorrect answer rationales
  incorrect_rationale_a?: string;
  incorrect_rationale_b?: string;
  incorrect_rationale_c?: string;
  incorrect_rationale_d?: string;
}

export interface SATQuestion extends BaseQuestion {
  id: string;
  content: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  section: 'reading-writing' | 'math';
}

export interface MarathonQuestion extends BaseQuestion {
  id: string;
  content: string;
  subject: 'math' | 'english';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  correctAnswer?: string | number;
}

// Common navigation props
export interface NavigationProps {
  currentIndex: number;
  totalCount: number;
  onNavigate?: (index: number) => void;
}

// Common bottom navigation props
export interface BottomNavigationProps extends NavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  onComplete?: () => void;
  disabled?: boolean;
  showNavigation?: boolean;
  onToggleNavigation?: () => void;
}

// Common question panel props
export interface QuestionPanelProps<T = BaseQuestion> {
  question: T | null;
  isMobile?: boolean;
  isFlagged?: boolean;
  onToggleFlag?: () => void;
  showPrompt?: boolean;
}

// Common answer panel props
export interface AnswerPanelProps<T = BaseQuestion> {
  question: T | null;
  selectedAnswer: number | string | null;
  onAnswerSelect: (answer: number | string) => void;
  showFeedback?: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
}