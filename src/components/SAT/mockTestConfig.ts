export type SatSectionId = 'reading-writing' | 'math';

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface ModulePathConfig {
  label: 'easy' | 'hard';
  distribution: DifficultyDistribution;
  description: string;
}

export interface SectionConfig {
  id: SatSectionId;
  title: string;
  moduleCount: number;
  moduleTimeSeconds: number;
  questionCountPerModule: number;
  maxSectionScore: number;
  topics: string[];
  module1Distribution: DifficultyDistribution;
  adaptivePaths: {
    easy: ModulePathConfig;
    hard: ModulePathConfig;
  };
}

export interface MockTestConfig {
  id: string;
  title: string;
  description: string;
  totalScore: number;
  sections: SectionConfig[];
}

const readingWritingSectionBase: SectionConfig = {
  id: 'reading-writing',
  title: 'Reading & Writing',
  moduleCount: 2,
  moduleTimeSeconds: 32 * 60,
  questionCountPerModule: 27,
  maxSectionScore: 800,
  topics: [
    'Information and Ideas',
    'Craft and Structure',
    'Expression of Ideas',
    'Standard English Conventions'
  ],
  module1Distribution: {
    easy: 0.3,
    medium: 0.5,
    hard: 0.2
  },
  adaptivePaths: {
    easy: {
      label: 'easy',
      distribution: {
        easy: 0.6,
        medium: 0.4,
        hard: 0
      },
      description: 'Focus on foundational and intermediate Reading & Writing questions.'
    },
    hard: {
      label: 'hard',
      distribution: {
        easy: 0,
        medium: 0.2,
        hard: 0.8
      },
      description: 'Challenging Reading & Writing questions for high performers.'
    }
  }
};

const mathSectionBase: SectionConfig = {
  id: 'math',
  title: 'Math',
  moduleCount: 2,
  moduleTimeSeconds: 35 * 60,
  questionCountPerModule: 22,
  maxSectionScore: 800,
  topics: [
    'Algebra',
    'Advanced Math',
    'Problem Solving & Data Analysis',
    'Geometry and Trigonometry'
  ],
  module1Distribution: {
    easy: 0.35,
    medium: 0.45,
    hard: 0.2
  },
  adaptivePaths: {
    easy: {
      label: 'easy',
      distribution: {
        easy: 0.55,
        medium: 0.45,
        hard: 0
      },
      description: 'Reinforce core math skills with moderate challenge.'
    },
    hard: {
      label: 'hard',
      distribution: {
        easy: 0,
        medium: 0.25,
        hard: 0.75
      },
      description: 'Advanced math problems to mirror the hardest SAT modules.'
    }
  }
};

const cloneSection = (section: SectionConfig): SectionConfig => ({
  ...section,
  topics: [...section.topics],
  module1Distribution: { ...section.module1Distribution },
  adaptivePaths: {
    easy: {
      label: section.adaptivePaths.easy.label,
      distribution: { ...section.adaptivePaths.easy.distribution },
      description: section.adaptivePaths.easy.description
    },
    hard: {
      label: section.adaptivePaths.hard.label,
      distribution: { ...section.adaptivePaths.hard.distribution },
      description: section.adaptivePaths.hard.description
    }
  }
});

export const MOCK_TEST_CONFIGS: Record<string, MockTestConfig> = {
  'reading-focus': {
    id: 'reading-focus',
    title: 'Reading & Writing Mock Test',
    description: 'Complete the Reading & Writing section of the digital SAT (two adaptive modules).',
    totalScore: 800,
    sections: [cloneSection(readingWritingSectionBase)]
  },
  'math-focus': {
    id: 'math-focus',
    title: 'Math Mock Test',
    description: 'Tackle the Math section of the digital SAT with adaptive difficulty.',
    totalScore: 800,
    sections: [cloneSection(mathSectionBase)]
  },
  'digital-sat-1': {
    id: 'digital-sat-1',
    title: 'Full Digital SAT Mock Test',
    description: 'Experience the full adaptive SAT with both Reading & Writing and Math sections.',
    totalScore: 1600,
    sections: [cloneSection(readingWritingSectionBase), cloneSection(mathSectionBase)]
  }
};

export type MockTestType = keyof typeof MOCK_TEST_CONFIGS;

