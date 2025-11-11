import { mathQuestionTemplates } from '@/data/mathQuestionTemplates';
import { cleanMathText } from '@/utils/mathText';
import { SATQuestion } from '@/data/satQuestions';
import {
  CalculatedVariableSpec,
  IntVariableSpec,
  MathQuestionTemplate,
  TemplateDefinition
} from '@/types/mathQuestionTemplate';

export interface GeneratedMathQuestion extends SATQuestion {
  metadata: {
    templateId: string;
    domain: string;
    skill: string;
    variables: Record<string, number>;
  };
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const evaluateExpression = (expression: string, context: Record<string, number>) => {
  const fn = new Function(...Object.keys(context), `return ${expression};`);
  return fn(...Object.values(context));
};

const executeCalculations = (
  calculations: string | string[] | undefined,
  context: Record<string, number>
) => {
  if (!calculations) return;
  const statements = Array.isArray(calculations) ? calculations : [calculations];

  statements.forEach((statement) => {
    const [rawTarget, rawExpression] = statement.split('=');
    if (!rawTarget || !rawExpression) {
      throw new Error(`Invalid calculation statement: ${statement}`);
    }
    const target = rawTarget.trim();
    const expression = rawExpression.trim();
    const value = evaluateExpression(expression, context);
    context[target] = Number.isFinite(value) ? Number(value) : value;
  });
};

const replacePlaceholders = (text: string, context: Record<string, number>) =>
  text.replace(/{{\s*([\w_]+)\s*}}/g, (_, key) => {
    const value = context[key];
    return value !== undefined ? String(value) : '';
  });

const buildOptions = (
  template: TemplateDefinition,
  context: Record<string, number>
) => {
  return LETTERS.map((letter) => {
    const expression = template.options[letter];
    if (expression === undefined) {
      throw new Error(`Missing option ${letter} in template.`);
    }
    const value = evaluateExpression(expression, context);
    return Number.isFinite(value) ? String(Number(value)) : String(value);
  });
};

export const generateMathQuestionFromTemplate = (
  template: MathQuestionTemplate
): GeneratedMathQuestion => {
  const values: Record<string, number> = {};

  const variableEntries = Object.entries(template.template.variables);

  const intVariables: Array<[string, IntVariableSpec]> = [];
  const calculatedVariables: Array<[string, CalculatedVariableSpec]> = [];

  variableEntries.forEach(([key, spec]) => {
    if (spec.type === 'int') {
      intVariables.push([key, spec]);
    } else if (spec.type === 'calculate') {
      calculatedVariables.push([key, spec]);
    } else {
      throw new Error(`Unsupported variable type: ${(spec as any).type}`);
    }
  });

  intVariables.forEach(([key, spec]) => {
    const { min, max, ensure_not_equal } = spec;
    let value = randomInt(min, max);
    if (ensure_not_equal) {
      const targetValue = values[ensure_not_equal];
      let attempts = 0;
      while (targetValue !== undefined && value === targetValue && attempts < 20) {
        value = randomInt(min, max);
        attempts += 1;
      }
      if (targetValue !== undefined && value === targetValue) {
        throw new Error(
          `Unable to generate value for ${key} different from ${ensure_not_equal}`
        );
      }
    }
    values[key] = value;
  });

  calculatedVariables.forEach(([key, spec]) => {
    const value = evaluateExpression(spec.value, values);
    values[key] = Number(value);
  });

  executeCalculations(template.template.calculation, values);

  const rawQuestionText = replacePlaceholders(template.template.question_text, values);
  const questionText = cleanMathText(rawQuestionText);
  const options = buildOptions(template.template, values).map((option) => cleanMathText(option));
  const correctIndex = LETTERS.indexOf(template.template.correct_option);
  const allRationales: {
    correct: string;
    incorrect: Record<string, string>;
  } = {
    correct:
      template.template.rationale[template.template.correct_option] !== undefined
        ? cleanMathText(
            replacePlaceholders(
              template.template.rationale[template.template.correct_option],
              values
            )
          )
        : '',
    incorrect: {}
  };

  LETTERS.forEach((letter) => {
    const rationale = template.template.rationale[letter];
    if (rationale && letter !== template.template.correct_option) {
      allRationales.incorrect[letter] = cleanMathText(replacePlaceholders(rationale, values));
    }
  });

  const idSuffix = Math.random().toString(36).slice(2, 8);

  return {
    id: `${template.id}-${Date.now()}-${idSuffix}`,
    question: questionText,
    options,
    correctAnswer: correctIndex,
    explanation: allRationales.correct,
    section: 'math',
    topic: template.skill,
    difficulty: template.difficulty,
    type: 'multiple-choice',
    rationales: allRationales,
    metadata: {
      templateId: template.id,
      domain: template.domain,
      skill: template.skill,
      variables: values
    }
  };
};

export const getMathTemplateById = (templateId: string) =>
  mathQuestionTemplates.find((template) => template.id === templateId);

export const generateMathQuestion = (
  templateId?: string,
  difficulty?: 'easy' | 'medium' | 'hard'
) => {
  let template: MathQuestionTemplate | undefined;

  if (templateId) {
    template = getMathTemplateById(templateId);
  } else if (difficulty) {
    const candidates = mathQuestionTemplates.filter(
      (candidate) => candidate.difficulty === difficulty
    );
    if (candidates.length > 0) {
      template = candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  if (!template) {
    template =
      mathQuestionTemplates[Math.floor(Math.random() * mathQuestionTemplates.length)];
  }

  if (!template) {
    throw new Error('No math question template available.');
  }

  return generateMathQuestionFromTemplate(template);
};

export const listMathQuestionTemplates = () => mathQuestionTemplates;


