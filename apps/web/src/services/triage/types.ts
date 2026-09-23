export type TriageAuditType = "SHORT_FORM" | "LONG_FORM";

/**
 * Terminal destination of a pre-audit path (extensible model). See the API's
 * `destination-types.ts` for the canonical enum + labels.
 */
export type TriageDestinationType =
  | "SHORT_FORM"
  | "LONG_FORM"
  | "SECTOR"
  | "SUPPORT"
  | "FUND_OR_DONATE"
  | "MCOM"
  | "HUMAN_REVIEW"
  | "NO_ACTION"
  | "CUSTOM";

export const DESTINATION_TYPES: readonly TriageDestinationType[] = [
  "SHORT_FORM",
  "LONG_FORM",
  "SECTOR",
  "SUPPORT",
  "FUND_OR_DONATE",
  "MCOM",
  "HUMAN_REVIEW",
  "NO_ACTION",
  "CUSTOM",
];

export const DESTINATION_LABELS: Record<TriageDestinationType, string> = {
  SHORT_FORM: "Short Audit",
  LONG_FORM: "Long Audit",
  SECTOR: "Sector-specific Audit",
  SUPPORT: "Support & Information",
  FUND_OR_DONATE: "Fund / Donate",
  MCOM: "Other MCOM Service",
  HUMAN_REVIEW: "Human Review",
  NO_ACTION: "No Immediate Action",
  CUSTOM: "Custom Destination",
};

/** Maps a destination back to a legacy audit type (SHORT_FORM | LONG_FORM). */
export function destinationAuditType(
  type: string | null | undefined
): TriageAuditType | null {
  if (type === "SHORT_FORM") return "SHORT_FORM";
  if (type === "LONG_FORM") return "LONG_FORM";
  return null;
}

/** The builder uses this for its two-legacy-kind "next | audit | none" UI. */
export type BuilderDestinationKind = "next" | "audit" | "";

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
  destinationType: TriageDestinationType | null;
  destinationTarget: string | null;
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
  defaultDestinationType: TriageDestinationType | null;
  defaultDestinationTarget: string | null;
  answers: TriagePublicAnswer[];
}

export interface AdminTriageAnswer {
  id: string;
  questionId: string;
  text: string;
  nextQuestionId: string | null;
  auditType: TriageAuditType | null;
  destinationType: TriageDestinationType | null;
  destinationTarget: string | null;
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
  defaultDestinationType: TriageDestinationType | null;
  defaultDestinationTarget: string | null;
  order: number;
  isActive: boolean;
  hasAuditPath: boolean;
  createdAt: string;
  answers: AdminTriageAnswer[];
}

export type AdminTriageResponse = AdminTriageQuestion[];