export const QUESTION_TYPES = [
  'short_text',
  'long_text',
  'single_choice',
  'multiple_choice',
  'checkbox',
  'dropdown',
  'number',
  'date',
  'time',
  'yes_no',
  'file',
  'rating',
  'linear_scale',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const CHOICE_TYPES: ReadonlySet<string> = new Set<QuestionType>([
  'single_choice',
  'multiple_choice',
  'checkbox',
  'dropdown',
  'yes_no',
]);

export const OPTIONLESS_TYPES: ReadonlySet<string> = new Set<QuestionType>([
  'short_text',
  'long_text',
  'number',
  'date',
  'time',
  'file',
  'rating',
  'linear_scale',
]);

export const DEFAULT_QUESTION_TYPE: QuestionType = 'single_choice';

export const YES_NO_OPTIONS = ['Yes', 'No'] as const;

export function isChoiceType(type: string): boolean {
  return CHOICE_TYPES.has(type);
}

export function isOptionlessType(type: string): boolean {
  return OPTIONLESS_TYPES.has(type);
}

export function normalizeQuestionType(type?: string | null): QuestionType {
  if (type && QUESTION_TYPES.includes(type as QuestionType)) {
    return type as QuestionType;
  }
  return DEFAULT_QUESTION_TYPE;
}

export interface FileConfig {
  allowedTypes?: string[];
  maxFileSizeMb?: number;
  multipleFiles?: boolean;
}

export interface RatingConfig {
  min?: number;
  max?: number;
}

export interface LinearScaleConfig extends RatingConfig {
  minLabel?: string;
  maxLabel?: string;
}

export interface QuestionConfig {
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  multipleFiles?: boolean;
  allowedTypes?: string[];
  maxFileSizeMb?: number;
  minLabel?: string;
  maxLabel?: string;
}