
export interface Question {
  id: string;
  subject: 'math' | 'english';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'multiple-choice' | 'grid-in';
  difficulty: 'easy' | 'medium' | 'hard';
}

// Math Questions
const mathQuestions: Question[] = [
  {
    id: 'm1',
    subject: 'math',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '5', '7', '15'],
    correctAnswer: 1,
    explanation: 'Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.',
    type: 'multiple-choice',
    difficulty: 'easy'
  },
  {
    id: 'm2',
    subject: 'math',
    question: 'What is the area of a circle with radius 4?',
    options: ['8π', '16π', '32π', '64π'],
    correctAnswer: 1,
    explanation: 'The area of a circle is πr². With r = 4, the area is π(4)² = 16π.',
    type: 'multiple-choice',
    difficulty: 'medium'
  },
  {
    id: 'm3',
    subject: 'math',
    question: 'If f(x) = 2x² - 3x + 1, what is f(2)?',
    options: ['3', '5', '7', '9'],
    correctAnswer: 0,
    explanation: 'f(2) = 2(2)² - 3(2) + 1 = 2(4) - 6 + 1 = 8 - 6 + 1 = 3.',
    type: 'multiple-choice',
    difficulty: 'medium'
  },
  {
    id: 'm4',
    subject: 'math',
    question: 'What is 25% of 80?',
    options: ['15', '20', '25', '30'],
    correctAnswer: 1,
    explanation: '25% = 0.25, so 25% of 80 = 0.25 × 80 = 20.',
    type: 'multiple-choice',
    difficulty: 'easy'
  },
  {
    id: 'm5',
    subject: 'math',
    question: 'If a triangle has sides of length 3, 4, and 5, what type of triangle is it?',
    options: ['Acute', 'Right', 'Obtuse', 'Isosceles'],
    correctAnswer: 1,
    explanation: 'Since 3² + 4² = 9 + 16 = 25 = 5², this satisfies the Pythagorean theorem, making it a right triangle.',
    type: 'multiple-choice',
    difficulty: 'medium'
  },
  {
    id: 'm6',
    subject: 'math',
    question: 'What is the slope of the line passing through points (2, 3) and (6, 11)?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1,
    explanation: 'Slope = (y₂ - y₁)/(x₂ - x₁) = (11 - 3)/(6 - 2) = 8/4 = 2.',
    type: 'multiple-choice',
    difficulty: 'hard'
  }
];

// English Questions
const englishQuestions: Question[] = [
  {
    id: 'e1',
    subject: 'english',
    question: 'Which word best completes the sentence? "The scientist\'s research was so _______ that it revolutionized the entire field."',
    options: ['mundane', 'groundbreaking', 'repetitive', 'confusing'],
    correctAnswer: 1,
    explanation: 'Groundbreaking means innovative or pioneering, which fits with research that revolutionized a field.',
    type: 'multiple-choice',
    difficulty: 'medium'
  },
  {
    id: 'e2',
    subject: 'english',
    question: 'In the sentence "Running through the park, the dog chased the ball," what is the subject?',
    options: ['Running', 'park', 'dog', 'ball'],
    correctAnswer: 2,
    explanation: 'The dog is performing the action (chased), making it the subject of the sentence.',
    type: 'multiple-choice',
    difficulty: 'easy'
  },
  {
    id: 'e3',
    subject: 'english',
    question: 'Which sentence uses correct parallel structure?',
    options: [
      'She likes hiking, swimming, and to bike.',
      'She likes hiking, swimming, and biking.',
      'She likes to hike, swimming, and biking.',
      'She likes to hike, to swim, and bike.'
    ],
    correctAnswer: 1,
    explanation: 'Parallel structure requires consistent grammatical forms. "Hiking, swimming, and biking" are all gerunds.',
    type: 'multiple-choice',
    difficulty: 'hard'
  },
  {
    id: 'e4',
    subject: 'english',
    question: 'What is the meaning of the word "ubiquitous"?',
    options: ['Rare', 'Present everywhere', 'Ancient', 'Mysterious'],
    correctAnswer: 1,
    explanation: 'Ubiquitous means existing or being everywhere at the same time; omnipresent.',
    type: 'multiple-choice',
    difficulty: 'medium'
  },
  {
    id: 'e5',
    subject: 'english',
    question: 'Which punctuation mark should replace the blank? "The weather was terrible___ therefore, we stayed inside."',
    options: [',', ';', ':', '!'],
    correctAnswer: 1,
    explanation: 'A semicolon is used to connect two independent clauses, especially when the second clause begins with a transitional word like "therefore."',
    type: 'multiple-choice',
    difficulty: 'hard'
  },
  {
    id: 'e6',
    subject: 'english',
    question: 'In literary analysis, what does "symbolism" refer to?',
    options: [
      'The chronological order of events',
      'The use of objects to represent deeper meanings',
      'The rhyme scheme of a poem',
      'The setting of a story'
    ],
    correctAnswer: 1,
    explanation: 'Symbolism is a literary device where objects, colors, or actions represent ideas or concepts beyond their literal meaning.',
    type: 'multiple-choice',
    difficulty: 'easy'
  }
];

// Mock Test Questions (Mixed)
export const mockTestQuestions: Question[] = [
  mathQuestions[0],
  englishQuestions[0],
  mathQuestions[1],
  englishQuestions[1],
  mathQuestions[2],
  englishQuestions[2],
  mathQuestions[3],
  englishQuestions[3],
  mathQuestions[4],
  englishQuestions[4]
];

export function getRandomQuestion(subject: 'math' | 'english'): Question {
  const questions = subject === 'math' ? mathQuestions : englishQuestions;
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}
