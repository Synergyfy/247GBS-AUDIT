import type { TriagePublicQuestion, TriageAuditType, QuestionType } from "@/services/triage/types";
import { isChoiceType } from "@/services/triage/types";
import type {
  PreAuditAnswerRecord,
  PreAuditPhase,
  PreAuditQuestionType,
  PreAuditSubmission,
  PreAuditVisitedEntry,
} from "./types";

/**
 * Hard cap guarding against misconfigured question graphs that loop forever.
 * Mirrors MAX_STEPS used by the existing triage page.
 */
export const PRE_AUDIT_MAX_STEPS = 50;

export const PRE_AUDIT_VERSION = 1;

export const DEFAULT_QUESTION_TYPE: QuestionType = "single_choice";

/** If the question declares a `type`, honour it; otherwise single-choice. */
export function resolveQuestionType(
  question: TriagePublicQuestion | null | undefined
): PreAuditQuestionType {
  const declared = question?.type;
  if (declared) return declared;
  return DEFAULT_QUESTION_TYPE;
}

/** Builds a visited entry for the chosen answer ids of a choice question. */
export function makeVisitedEntry(
  question: TriagePublicQuestion,
  selectedAnswerIds: string[]
): PreAuditVisitedEntry | null {
  const selected = question.answers.filter((a) => selectedAnswerIds.includes(a.id));
  if (selected.length === 0) return null;

  const first = selected[0];
  const allNextQuestionAgree = selected.every((a) => a.nextQuestionId === first.nextQuestionId);
  const allAuditTypeAgree = selected.every((a) => a.auditType === first.auditType);

  return {
    questionId: question.id,
    questionText: question.text,
    questionType: resolveQuestionType(question),
    answerIds: selected.map((a) => a.id),
    answerTexts: selected.map((a) => a.text),
    nextQuestionId: allNextQuestionAgree ? first.nextQuestionId : null,
    auditType: allAuditTypeAgree ? (first.auditType as TriageAuditType | null) : null,
  };
}

/**
 * Builds a visited entry for an option-less question (text/number/date/time/
 * file/rating/linear_scale). The destination comes from the question-level
 * default rather than from answer options.
 */
export function makeTypedVisitedEntry(
  question: TriagePublicQuestion,
  value: unknown
): PreAuditVisitedEntry {
  const displayText = value === null || value === undefined || value === "" ? "" : String(value);
  return {
    questionId: question.id,
    questionText: question.text,
    questionType: resolveQuestionType(question),
    answerIds: [],
    answerTexts: displayText ? [displayText] : [],
    value,
    nextQuestionId: question.defaultNextQuestionId ?? null,
    auditType: question.defaultAuditType ?? null,
  };
}

/**
 * Re-derives the active path from the persisted entries, walking the chain
 * from the first question and stopping as soon as an entry is inconsistent
 * (a prior branch answer no longer leads to the next entry). Used to
 * self-heal stored progress after back-navigation, question edits, or stale
 * branch answers — the "back navigation recalculates the branch path"
 * requirement.
 */
export function recomputeActiveVisited(
  visited: PreAuditVisitedEntry[],
  cache: Record<string, TriagePublicQuestion>
): PreAuditVisitedEntry[] {
  const active: PreAuditVisitedEntry[] = [];
  const seen = new Set<string>();

  for (const entry of visited) {
    if (seen.has(entry.questionId)) break;
    seen.add(entry.questionId);

    const previous = active[active.length - 1];
    if (previous && previous.nextQuestionId !== entry.questionId) break;

    const question = cache[entry.questionId];
    if (question && isChoiceType(resolveQuestionType(question))) {
      const validSelection = entry.answerIds.every((answerId) =>
        question.answers.some((a) => a.id === answerId)
      );
      if (!validSelection) break;
    }

    active.push(entry);
    if (!entry.nextQuestionId || entry.auditType) break;
    if (active.length >= PRE_AUDIT_MAX_STEPS) break;
  }

  return active;
}

/** The recommended audit type comes only from the seeded answer data. */
export function recommendedAuditOf(visited: PreAuditVisitedEntry[]): TriageAuditType | null {
  for (let i = visited.length - 1; i >= 0; i -= 1) {
    if (visited[i].auditType) return visited[i].auditType as TriageAuditType;
  }
  return null;
}

export function isTerminal(entry: PreAuditVisitedEntry | null | undefined): boolean {
  return Boolean(entry?.auditType || !entry?.nextQuestionId);
}

/** Human-friendly, non-technical wording for an answer choice. */
export function joinAnswerTexts(answerTexts: string[]): string {
  return answerTexts.join(", ");
}

function djb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/** Stable identity for a submission: email + every selected answer/value. */
export function fingerprintOf(email: string, visited: PreAuditVisitedEntry[]): string {
  const normalizedEmail = email.trim().toLowerCase();
  const parts = visited.map((entry) => {
    const selection = [...entry.answerIds].sort().join(",");
    const typed = entry.value === undefined || entry.value === null
      ? ""
      : `=${JSON.stringify(entry.value)}`;
    return `${entry.questionId}:${selection}${typed}`;
  });
  return djb2([normalizedEmail, ...parts].join("|"));
}

export function answerRecordsOf(visited: PreAuditVisitedEntry[]): PreAuditAnswerRecord[] {
  return visited.map((entry) => ({
    questionId: entry.questionId,
    questionText: entry.questionText,
    answerTexts: [...entry.answerTexts],
    value: entry.value,
  }));
}

/**
 * Ordered steps for the server-side "re-evaluate" submission endpoint. The
 * client only reports what was answered; the server recomputes routing.
 */
export function stepsOf(visited: PreAuditVisitedEntry[]) {
  return visited.map((entry) => ({
    questionId: entry.questionId,
    optionIds: entry.answerIds.length > 0 ? entry.answerIds : undefined,
    value: entry.answerIds.length === 0 ? entry.value ?? null : undefined,
  }));
}

export function buildSubmission(input: {
  email: string;
  visited: PreAuditVisitedEntry[];
  existingId?: string;
}): PreAuditSubmission {
  return {
    version: PRE_AUDIT_VERSION,
    id: input.existingId || createRecordId(),
    email: input.email.trim(),
    fingerprint: fingerprintOf(input.email, input.visited),
    recommendedAudit: recommendedAuditOf(input.visited),
    answeredCount: input.visited.length,
    answers: answerRecordsOf(input.visited),
    completedAt: new Date().toISOString(),
  };
}

export function createRecordId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pre-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type PreAuditPhaseExport = PreAuditPhase;