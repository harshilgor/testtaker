import { MathQuestionTemplate } from '@/types/mathQuestionTemplate';

export const mathQuestionTemplates: MathQuestionTemplate[] = [
  {
    id: 'algebra-linear-function-evaluation-easy',
    domain: 'Algebra',
    skill: 'Linear Functions',
    difficulty: 'easy',
    template: {
      question_text:
        'The function f is defined by $f(x) = {{a}}x + {{b}}$. What is the value of $f(x)$ when $x = {{c}}$?',
      variables: {
        a: { type: 'int', min: 2, max: 50 },
        b: { type: 'int', min: 1, max: 60 },
        c: { type: 'int', min: 1, max: 5 }
      },
      calculation: 'f_value = a * c + b',
      options: {
        A: 'a * c',
        B: 'a + b + c',
        C: 'f_value',
        D: '(a + b) * c'
      },
      correct_option: 'C',
      rationale: {
        C: 'Substituting $x = {{c}}$ into $f(x) = {{a}}x + {{b}}$ gives $f({{c}}) = {{a}}({{c}}) + {{b}} = {{f_value}}.$',
        A: 'This is the value of ${{a}}({{c}})$, not ${{a}}({{c}}) + {{b}}.$',
        B: 'This adds ${{a}}, {{b}},$ and ${{c}}$ directly instead of substituting into the equation.',
        D: 'This evaluates $({{a}} + {{b}})({{c}})$, not ${{a}}({{c}}) + {{b}}.$'
      }
    }
  },
  {
    id: 'algebra-linear-function-solve-x-easy',
    domain: 'Algebra',
    skill: 'Linear Functions',
    difficulty: 'easy',
    template: {
      question_text:
        'The function f is defined by $f(x) = {{a}}x$. For what value of x does $f(x) = {{y}}$?',
      variables: {
        a: { type: 'int', min: 2, max: 12 },
        x_solution: { type: 'int', min: 3, max: 15, ensure_not_equal: 'a' },
        y: { type: 'calculate', value: 'a * x_solution' }
      },
      calculation: 'correct_answer = y / a',
      options: {
        A: 'a',
        B: 'correct_answer',
        C: 'a * a',
        D: 'y + a'
      },
      correct_option: 'B',
      rationale: {
        B: 'To find the value of x for which $f(x) = {{y}}$, set up the equation ${{a}}x = {{y}}$. Dividing both sides by {{a}} gives $x = {{y}} / {{a}} = {{correct_answer}}$.',
        A: 'This is the coefficient a in the function $f(x) = {{a}}x$, not the value of x.',
        C: 'This is the value of ${{a}}^2$, or ${{a}} \\times {{a}}$. This is not the correct value of x.',
        D: 'This is the value of $f(x) + a$, or ${{y}} + {{a}}$. This is not the correct value of x.'
      }
    }
  }
];

export const getMathTemplatesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') =>
  mathQuestionTemplates.filter((template) => template.difficulty === difficulty);


