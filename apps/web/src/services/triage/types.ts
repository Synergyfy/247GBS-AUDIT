export type TriageAuditType = "SHORT_FORM" | "LONG_FORM";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "checkbox"
  | "dropdown"
  | "number"
  | "date"
  | "time"
  | "yes_no"
  | "file"
  | "rating"
  | "linear_scale";

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

export const CHOICE_QUESTION_TYPES: ReadonlySet<QuestionType> = new Set<QuestionType>([
  "single_choice",
  "multiple_choice",
  "checkbox",
  "dropdown",
  "yes_no",
]);

export const MULTI_SELECT_QUESTION_TYPES: ReadonlySet<QuestionType> = new Set<QuestionType>([
  "multiple_choice",
  "checkbox",
]);

export function isChoiceType(type: QuestionType): boolean {
  return CHOICE_QUESTION_TYPES.has(type);
}

export function isMultiSelectType(type: QuestionType): boolean {
  return MULTI_SELECT_QUESTION_TYPES.has(type);
}

export interface TriagePublicAnswer {
  id: string;
  text: string;
  nextQuestionId: string | null;
  auditType: TriageAuditType | null;
}

export interface TriagePublicQuestion {
  id: string;
  text: string;
  type: QuestionType;
  description: string | null;
  hint: string | null;
  required: boolean;
  config: QuestionConfig;
  defaultNextQuestionId: string | null;
  defaultAuditType: TriageAuditType | null;
  answers: TriagePublicAnswer[];
}

export interface AdminTriageAnswer {
  id: string;
  questionId: string;
  text: string;
  nextQuestionId: string | null;
  auditType: TriageAuditType | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminTriageQuestion {
  id: string;
  text: string;
  type: QuestionType;
  description: string | null;
  hint: string | null;
  icon: string | null;
  required: boolean;
  config: QuestionConfig;
  defaultNextQuestionId: string | null;
  defaultAuditType: TriageAuditType | null;
  order: number;
  isActive: boolean;
  hasAuditPath: boolean;
  createdAt: string;
  answers: AdminTriageAnswer[];
}

export type AdminTriageResponse = AdminTriageQuestion[];

export type TriageDestinationType = "next" | "audit" | "";