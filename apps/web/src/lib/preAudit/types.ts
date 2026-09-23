import type { TriageAuditType, TriageDestinationType, TriagePublicQuestion, QuestionType } from "@/services/triage/types";

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
 *
 * For multi-branch travels (P5) the array stays flat and ordered in canonical
 * DFS order: every question appears at most once, a fork question records the
 * union of every selected option across all walked branches, and the first
 * entry of each branch after the first marks `branchStart` so the stored
 * progress can be re-healed correctly after a reload.
 */
export interface PreAuditVisitedEntry {
  questionId: string;
  questionText: string;
  questionType: PreAuditQuestionType;
  answerIds: string[];
  answerTexts: string[];
  value?: unknown;
  nextQuestionId: string | null;
  /** Terminal destination of this step (null while the flow continues). */
  destinationType: TriageDestinationType | null;
  destinationTarget: string | null;
  /** Legacy audit type derived from SHORT_FORM/LONG_FORM destinations. */
  auditType: TriageAuditType | null;
  /** True when this entry is the first step of an alternative (pending) branch. */
  branchStart?: boolean;
}

/**
 * A not-yet-walked alternative route selected on an earlier question. Multi-
 * select questions may pick options that lead to different destinations; the
 * lowest-sortOrder route is walked first and every other route is queued here
 * (a LIFO "pending branch" stack, one branch fully completed before the next).
 */
export interface PreAuditPendingBranch {
  forkQuestionId: string;
  optionIds: string[];
  optionTexts: string[];
  nextQuestionId: string | null;
  destinationType: TriageDestinationType | null;
  destinationTarget: string | null;
  auditType: TriageAuditType | null;
}

export type PreAuditPhase =
  | "loading"
  | "question"
  | "review"
  | "email"
  | "consent"
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
  destinationType: TriageDestinationType | null;
  destinationTarget: string | null;
  answeredCount: number;
  answers: PreAuditAnswerRecord[];
  completedAt: string;
  /** Truest label of the destination the server re-evaluated for us. */
  serverAuthoritative?: boolean;
  /** Present when the submission was also re-evaluated and stored server-side. */
  serverSessionId?: string;
  /** Server-confirmed consent timestamp, when the API was reachable. */
  consentGrantedAt?: string | null;
}

/** Snapshot persisted between visits so a user can continue where they left off. */
export interface PreAuditProgress {
  version: number;
  visited: PreAuditVisitedEntry[];
  email: string;
  currentQuestion: TriagePublicQuestion | null;
  phase: "question" | "review" | "email";
  updatedAt: string;
  /** Alternative routes still to walk (multi-branch traversal). */
  pendingBranches?: PreAuditPendingBranch[];
  /** The branch currently being walked (null outside branch travel). */
  currentBranch?: PreAuditPendingBranch | null;
}

export interface PreAuditEngineOptions {
  /** Where the flow navigates when the user exits before starting. */
  exitHref?: string;
  /** Where the flow navigates after completing the pre-audit. */
  afterSubmitHref?: string;
}