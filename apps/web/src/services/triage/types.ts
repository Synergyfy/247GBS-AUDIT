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

/**
 * The stored destination of one answer option, captured so response-based
 * navigation can be toggled off without destroying the configured routing.
 */
export interface AnswerDestinationSnapshot {
  nextQuestionId?: string | null;
  auditType?: TriageAuditType | null;
  destinationType?: TriageDestinationType | null;
  destinationTarget?: string | null;
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
  /** Sanitised rich-text (HTML) version of the question text, rendered in the public form. */
  contentHtml?: string;
  /**
   * Response-based navigation ("go to question based on answer"). When on,
   * every choice option can point at a specific question or the end of the
   * form instead of the linear "next question" default.
   */
  responseNavigation?: boolean;
  /** Per-option destinations preserved while responseNavigation is off. */
  preservedNavigation?: Record<string, AnswerDestinationSnapshot>;
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
  internalValue: string | null;
  tag: string | null;
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

// ============================================================
// Form definition, publish state and responder settings
// ============================================================

export type TriageFormStatus = "draft" | "published";

export interface TriageFormSettings {
  acceptResponses: boolean;
  collectEmail: boolean;
  requireEmail: boolean;
  allowEditing: boolean;
  showProgressBar: boolean;
  showConfirmation: boolean;
  confirmationMessage: string;
}

export interface TriageForm {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  status: TriageFormStatus;
  settings: TriageFormSettings;
  publishedAt: string | null;
}

export interface PublishTriageFormResult {
  id: string;
  status: TriageFormStatus;
  slug: string | null;
  publicUrl: string | null;
  publishedAt: string | null;
}

export interface PublishValidationResult {
  ok: boolean;
  issues: { message: string }[];
  warnings: { message: string }[];
}

// ============================================================
// Responses (stored pre-audit submissions)
// ============================================================

export interface TriageResponseSummary {
  id: string;
  email: string | null;
  recommendedAuditType: string | null;
  destinationType: string | null;
  destinationTarget: string | null;
  answeredCount: number;
  completedAt: string | null;
  createdAt: string;
}

export interface TriageResponsesOverview {
  total: number;
  withEmail: number;
  uniqueEmails: number;
  submittedToday: number;
  byAuditType: Record<string, number>;
  byDestination: Record<string, number>;
  recent: TriageResponseSummary[];
}

export interface TriageResponseStep {
  questionId: string;
  questionText: string;
  answerTexts: string[];
  value?: unknown;
  nextQuestionId: string | null;
  destinationType: string | null;
  destinationTarget: string | null;
  auditType: string | null;
}

export interface TriageResponseDetail {
  id: string;
  email: string | null;
  recommendedAuditType: string | null;
  destinationType: string | null;
  destinationTarget: string | null;
  answeredCount: number;
  steps: TriageResponseStep[];
  consentGrantedAt: string | null;
  consentVersion: string;
  completedAt: string | null;
  createdAt: string;
}

// ============================================================
// Public responder (published form by slug)
// ============================================================

export interface PublicTriageForm {
  title: string;
  description: string | null;
  status: TriageFormStatus;
  settings: TriageFormSettings;
  startQuestion: TriagePublicQuestion | null;
}