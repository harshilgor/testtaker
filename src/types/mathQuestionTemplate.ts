export type VariableType = 'int' | 'calculate';

export interface IntVariableSpec {
  type: 'int';
  min: number;
  max: number;
  ensure_not_equal?: string;
}

export interface CalculatedVariableSpec {
  type: 'calculate';
  value: string;
}

export type VariableSpec = IntVariableSpec | CalculatedVariableSpec;

export interface TemplateDefinition {
  question_text: string;
  variables: Record<string, VariableSpec>;
  calculation?: string | string[];
  options: Record<string, string>;
  correct_option: 'A' | 'B' | 'C' | 'D';
  rationale: Record<string, string>;
}

export interface MathQuestionTemplate {
  id: string;
  domain: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  template: TemplateDefinition;
}


