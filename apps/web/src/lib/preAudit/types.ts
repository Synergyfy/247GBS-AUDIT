import type { TriageAuditType, TriagePublicQuestion, QuestionType } from "@/services/triage/types";

/**
 * The kind of answer input a pre-audit question supports, driven by the
 * question's `type` field on the backend. The default is "single_choice" so
 * that existing questions keep working unchanged.
 */
export type PreAuditQuestionType = QuestionType;

/**
 * One answered question along the active (recalculated) path. Texts are
 * snapshotted so the review/confirmation screens work without re-fetching.
 * Choice questions populate `answerIds`/`answerTexts`; option-less questions
 * (text/number/date/time/file/rating/scale) populate `value` instead.
 */
export interface PreAuditVisitedEntry {
  questionId: string;
  questionText: string;
  questionType: PreAuditQuestionType;
  answerIds: string[];
  answerTexts: string[];
  value?: unknown;
  nextQuestionId: string | null;
  auditType: TriageAuditType | null;
}

export type PreAuditPhase =
  | "loading"
  | "question"
  | "email"
  | "review"
  | "submitting"
  | "confirmation"
  | "error";

/** Lightweight Q&A pair used by review + confirmation. */
export interface PreAuditAnswerRecord {
  questionId: string;
  questionText: string;
  answerTexts: string[];
  value?: unknown;
}

/** The locally-stored outcome of a completed pre-audit. */
export interface PreAuditSubmission {
  version: number;
  id: string;
  email: string;
  fingerprint: string;
  recommendedAudit: TriageAuditType | null;
  answeredCount: number;
  answers: PreAuditAnswerRecord[];
  completedAt: string;
  /** Present when the submission was also re-evaluated and stored server-side. */
  serverSessionId?: string;
}

/** Snapshot persisted between visits so a user can continue where they left off. */
export interface PreAuditProgress {
  version: number;
  visited: PreAuditVisitedEntry[];
  email: string;
  currentQuestion: TriagePublicQuestion | null;
  phase: "question" | "email" | "review";
  updatedAt: string;
}

export interface PreAuditEngineOptions {
  /** Where the flow navigates when the user exits before starting. */
  exitHref?: string;
  /** Where the flow navigates after completing the pre-audit. */
  afterSubmitHref?: string;
}