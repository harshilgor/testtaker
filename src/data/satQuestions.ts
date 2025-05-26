
export interface SATQuestion {
  id: string;
  section: 'reading-writing' | 'math';
  module: 1 | 2;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  type: 'multiple-choice' | 'grid-in';
}

// Reading & Writing Questions
const readingWritingQuestions: SATQuestion[] = [
  // Module 1 - Mixed Difficulty
  {
    id: 'rw1-1',
    section: 'reading-writing',
    module: 1,
    difficulty: 'easy',
    topic: 'Information and Ideas',
    question: 'Based on the passage, which statement best describes the main idea?',
    options: ['The importance of renewable energy', 'The decline of fossil fuels', 'Environmental conservation methods', 'Economic impacts of climate change'],
    correctAnswer: 0,
    explanation: 'The passage primarily focuses on the importance and benefits of renewable energy sources.',
    type: 'multiple-choice'
  },
  {
    id: 'rw1-2',
    section: 'reading-writing',
    module: 1,
    difficulty: 'medium',
    topic: 'Craft and Structure',
    question: 'The author uses the phrase "economic watershed" to emphasize:',
    options: ['A turning point in financial policy', 'The literal meaning of water management', 'A gradual economic decline', 'The importance of natural resources'],
    correctAnswer: 0,
    explanation: 'The metaphor "economic watershed" indicates a significant turning point or dividing line in economic policy.',
    type: 'multiple-choice'
  },
  {
    id: 'rw1-3',
    section: 'reading-writing',
    module: 1,
    difficulty: 'hard',
    topic: 'Expression of Ideas',
    question: 'Which revision best improves the clarity and flow of the sentence?',
    options: ['No change needed', 'Move the dependent clause to the beginning', 'Split into two separate sentences', 'Remove the transitional phrase'],
    correctAnswer: 1,
    explanation: 'Moving the dependent clause to the beginning creates better sentence flow and clarity.',
    type: 'multiple-choice'
  },
  // Add more questions for complete 27-question modules...
];

// Math Questions
const mathQuestions: SATQuestion[] = [
  // Module 1 - Mixed Difficulty
  {
    id: 'm1-1',
    section: 'math',
    module: 1,
    difficulty: 'easy',
    topic: 'Algebra',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '5', '7', '15'],
    correctAnswer: 1,
    explanation: 'Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.',
    type: 'multiple-choice'
  },
  {
    id: 'm1-2',
    section: 'math',
    module: 1,
    difficulty: 'medium',
    topic: 'Advanced Math',
    question: 'What is the value of x² + 2x - 8 when x = 3?',
    correctAnswer: '7',
    explanation: 'Substitute x = 3: (3)² + 2(3) - 8 = 9 + 6 - 8 = 7.',
    type: 'grid-in'
  },
  {
    id: 'm1-3',
    section: 'math',
    module: 1,
    difficulty: 'hard',
    topic: 'Geometry',
    question: 'In a right triangle with legs of length 6 and 8, what is the length of the hypotenuse?',
    options: ['10', '12', '14', '16'],
    correctAnswer: 0,
    explanation: 'Using the Pythagorean theorem: √(6² + 8²) = √(36 + 64) = √100 = 10.',
    type: 'multiple-choice'
  },
  // Add more questions for complete 22-question modules...
];

// Generate additional questions to reach required counts
const generateAdditionalQuestions = () => {
  const additionalRW: SATQuestion[] = [];
  const additionalMath: SATQuestion[] = [];
  
  // Generate remaining Reading & Writing questions (24 more for Module 1, 27 for Module 2)
  for (let i = 4; i <= 27; i++) {
    additionalRW.push({
      id: `rw1-${i}`,
      section: 'reading-writing',
      module: 1,
      difficulty: i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy',
      topic: ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'][i % 4],
      question: `Reading and Writing question ${i}: Which choice best maintains the style and tone of the passage?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: i % 4,
      explanation: `This is the explanation for question ${i}.`,
      type: 'multiple-choice'
    });
  }
  
  // Generate Module 2 Reading & Writing questions
  for (let i = 1; i <= 27; i++) {
    additionalRW.push({
      id: `rw2-${i}`,
      section: 'reading-writing',
      module: 2,
      difficulty: i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy',
      topic: ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'][i % 4],
      question: `Reading and Writing Module 2 question ${i}: Which choice best completes the sentence?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: i % 4,
      explanation: `This is the explanation for Module 2 question ${i}.`,
      type: 'multiple-choice'
    });
  }
  
  // Generate remaining Math questions (19 more for Module 1, 22 for Module 2)
  for (let i = 4; i <= 22; i++) {
    additionalMath.push({
      id: `m1-${i}`,
      section: 'math',
      module: 1,
      difficulty: i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy',
      topic: ['Algebra', 'Advanced Math', 'Problem Solving', 'Geometry'][i % 4],
      question: `Math question ${i}: Solve for x in the equation.`,
      options: i % 3 === 0 ? undefined : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: i % 3 === 0 ? `${i}` : i % 4,
      explanation: `This is the explanation for math question ${i}.`,
      type: i % 3 === 0 ? 'grid-in' : 'multiple-choice'
    });
  }
  
  // Generate Module 2 Math questions
  for (let i = 1; i <= 22; i++) {
    additionalMath.push({
      id: `m2-${i}`,
      section: 'math',
      module: 2,
      difficulty: i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy',
      topic: ['Algebra', 'Advanced Math', 'Problem Solving', 'Geometry'][i % 4],
      question: `Math Module 2 question ${i}: Calculate the value.`,
      options: i % 3 === 0 ? undefined : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: i % 3 === 0 ? `${i + 10}` : i % 4,
      explanation: `This is the explanation for Math Module 2 question ${i}.`,
      type: i % 3 === 0 ? 'grid-in' : 'multiple-choice'
    });
  }
  
  return [...additionalRW, ...additionalMath];
};

export const allSATQuestions = [...readingWritingQuestions, ...mathQuestions, ...generateAdditionalQuestions()];

export const getSATQuestions = (section: 'reading-writing' | 'math', module: 1 | 2, difficulty?: 'easy' | 'medium' | 'hard') => {
  let questions = allSATQuestions.filter(q => q.section === section && q.module === module);
  
  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty);
  }
  
  return questions;
};

export const getAdaptiveQuestions = (section: 'reading-writing' | 'math', performance: number) => {
  // Performance-based difficulty selection for Module 2
  let targetDifficulty: 'easy' | 'medium' | 'hard';
  
  if (performance >= 0.7) {
    targetDifficulty = 'hard';
  } else if (performance >= 0.5) {
    targetDifficulty = 'medium';
  } else {
    targetDifficulty = 'easy';
  }
  
  return getSATQuestions(section, 2, targetDifficulty);
};
