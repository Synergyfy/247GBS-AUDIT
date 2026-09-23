import type { TriagePublicAnswer, TriageDestinationType, TriagePublicQuestion, TriageAuditType, QuestionType } from "@/services/triage/types";
import { destinationAuditType, isChoiceType } from "@/services/triage/types";
import type {
  PreAuditAnswerRecord,
  PreAuditPendingBranch,
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

/** Consent text version the public flow records with every submission. */
export const PRE_AUDIT_CONSENT_VERSION = "1";

export const DEFAULT_QUESTION_TYPE: QuestionType = "single_choice";

/** If the question declares a `type`, honour it; otherwise single-choice. */
export function resolveQuestionType(
  question: TriagePublicQuestion | null | undefined
): PreAuditQuestionType {
  const declared = question?.type;
  if (declared) return declared;
  return DEFAULT_QUESTION_TYPE;
}

/**
 * Position of an answer within a question's canonical option order (the API
 * serves answers ordered by `sortOrder`, so array position is the canonical
 * order by which branch traversal is deterministic).
 */
export function canonicalIndexOf(question: TriagePublicQuestion, answerId: string): number {
  const index = question.answers.findIndex((a) => a.id === answerId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** Canonical route of an option: one next question OR one destination. */
function routeKeyOf(option: Pick<TriagePublicAnswer, "nextQuestionId" | "destinationType" | "destinationTarget" | "auditType">): string {
  return JSON.stringify([
    option.nextQuestionId ?? null,
    option.destinationType ?? option.auditType ?? null,
    option.destinationTarget ?? null,
  ]);
}

interface RouteGroup {
  options: TriagePublicAnswer[];
}

/** Groups the selected options by their resolved route (canonically ordered). */
function groupByRoute(
  question: TriagePublicQuestion,
  selected: TriagePublicAnswer[]
): RouteGroup[] {
  const ordered = [...selected].sort(
    (a, b) => canonicalIndexOf(question, a.id) - canonicalIndexOf(question, b.id)
  );
  const groups: RouteGroup[] = [];
  for (const option of ordered) {
    const route = routeKeyOf(option);
    let group = groups.find((g) => routeKeyOf(g.options[0]) === route);
    if (!group) {
      group = { options: [] };
      groups.push(group);
    }
    group.options.push(option);
  }
  return groups;
}

/**
 * Builds the visited entry (and any alternative branches) for a choice answer.
 *
 * When every selected option routes the same way the entry is the plain
 * single-path result. When the options diverge (multi-branch), the fork records
 * the union of every selected option and routes via the lowest-sortOrder route;
 * every other route is returned as a pending branch to be walked after the
 * primary branch is fully processed (canonical DFS order).
 */
export function makeChoiceAnswer(
  question: TriagePublicQuestion,
  selectedAnswerIds: string[]
): { entry: PreAuditVisitedEntry | null; branches: PreAuditPendingBranch[] } {
  const selected = question.answers.filter((a) => selectedAnswerIds.includes(a.id));
  if (selected.length === 0) return { entry: null, branches: [] };

  const groups = groupByRoute(question, selected);
  const primary = groups[0].options[0];
  const destinationType = (primary.destinationType ?? primary.auditType ?? null) as TriageDestinationType | null;

  const entry: PreAuditVisitedEntry = {
    questionId: question.id,
    questionText: question.text,
    questionType: resolveQuestionType(question),
    answerIds: selected.map((a) => a.id),
    answerTexts: selected.map((a) => a.text),
    nextQuestionId: primary.nextQuestionId ?? null,
    destinationType,
    destinationTarget: primary.destinationTarget ?? null,
    auditType: destinationAuditType(destinationType),
  };

  const branches: PreAuditPendingBranch[] = [];
  for (let i = 1; i < groups.length; i += 1) {
    const first = groups[i].options[0];
    branches.push({
      forkQuestionId: question.id,
      optionIds: groups[i].options.map((o) => o.id),
      optionTexts: groups[i].options.map((o) => o.text),
      nextQuestionId: first.nextQuestionId ?? null,
      destinationType: (first.destinationType ?? first.auditType ?? null) as TriageDestinationType | null,
      destinationTarget: first.destinationTarget ?? null,
      auditType: destinationAuditType(first.destinationType ?? first.auditType),
    });
  }

  return { entry, branches };
}

/**
 * Builds a visited entry for the chosen answer ids of a choice question,
 * ignoring any alternative branches (kept for backwards compatibility; new
 * code should use `makeChoiceAnswer` to drive multi-branch traversal).
 */
export function makeVisitedEntry(
  question: TriagePublicQuestion,
  selectedAnswerIds: string[]
): PreAuditVisitedEntry | null {
  return makeChoiceAnswer(question, selectedAnswerIds).entry;
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
  const defaultType =
    (question.defaultDestinationType ?? question.defaultAuditType ?? null) as TriageDestinationType | null;
  return {
    questionId: question.id,
    questionText: question.text,
    questionType: resolveQuestionType(question),
    answerIds: [],
    answerTexts: displayText ? [displayText] : [],
    value,
    nextQuestionId: question.defaultNextQuestionId ?? null,
    destinationType: defaultType,
    destinationTarget: question.defaultDestinationTarget ?? null,
    auditType: defaultType ? destinationAuditType(defaultType) : null,
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
    if (previous && !entry.branchStart && previous.nextQuestionId !== entry.questionId) break;

    const question = cache[entry.questionId];
    if (question && isChoiceType(resolveQuestionType(question))) {
      const validSelection = entry.answerIds.every((answerId) =>
        question.answers.some((a) => a.id === answerId)
      );
      if (!validSelection) break;
    }

    active.push(entry);
    if (active.length >= PRE_AUDIT_MAX_STEPS) break;
  }

  return active;
}

/**
 * Pops the next walkable pending branch (canonical DFS: LIFO across forks,
 * sibling branches pushed in reverse canonical order so the lowest walks
 * first). Branches that would rejoin an already-answered question or that
 * terminate at the fork itself contribute no further step and are skipped.
 */
export function resolvePendingBranch(
  pending: PreAuditPendingBranch[],
  visitedQuestionIds: ReadonlySet<string>
): { branch: PreAuditPendingBranch; rest: PreAuditPendingBranch[] } | null {
  const stack = [...pending];
  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    if (top.nextQuestionId && !visitedQuestionIds.has(top.nextQuestionId)) {
      return { branch: top, rest: stack.slice(0, -1) };
    }
    stack.pop();
  }
  return null;
}

/**
 * Pushes freshly-discovered sibling branches onto the pending stack. Reversed
 * so the canonical-first route pops next (stack = DFS).
 */
export function stackBranches(
  pending: PreAuditPendingBranch[],
  newBranches: PreAuditPendingBranch[]
): PreAuditPendingBranch[] {
  if (newBranches.length === 0) return pending;
  return [...newBranches].reverse().concat(pending);
}

export function isTerminal(entry: PreAuditVisitedEntry | null | undefined): boolean {
  return Boolean(entry?.destinationType || entry?.auditType || !entry?.nextQuestionId);
}

/** Resolved destination of the final step, falling back to any earlier one. */
export function recommendedDestinationOf(
  visited: PreAuditVisitedEntry[]
): { destinationType: TriageDestinationType | null; destinationTarget: string | null } {
  for (let i = visited.length - 1; i >= 0; i -= 1) {
    if (visited[i].destinationType) {
      return {
        destinationType: visited[i].destinationType as TriageDestinationType,
        destinationTarget: visited[i].destinationTarget ?? null,
      };
    }
  }
  return { destinationType: null, destinationTarget: null };
}

/** The recommended audit type comes only from the seeded answer data. */
export function recommendedAuditOf(visited: PreAuditVisitedEntry[]): TriageAuditType | null {
  for (let i = visited.length - 1; i >= 0; i -= 1) {
    if (visited[i].auditType) return visited[i].auditType as TriageAuditType;
  }
  return null;
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
  destinationType?: PreAuditSubmission["destinationType"];
  destinationTarget?: PreAuditSubmission["destinationTarget"];
  serverAuthoritative?: boolean;
  consentGrantedAt?: string | null;
}): PreAuditSubmission {
  const local = recommendedDestinationOf(input.visited);
  return {
    version: PRE_AUDIT_VERSION,
    id: input.existingId || createRecordId(),
    email: input.email.trim(),
    fingerprint: fingerprintOf(input.email, input.visited),
    recommendedAudit: recommendedAuditOf(input.visited),
    destinationType: input.destinationType ?? local.destinationType,
    destinationTarget: input.destinationTarget ?? local.destinationTarget,
    answeredCount: input.visited.length,
    answers: answerRecordsOf(input.visited),
    completedAt: new Date().toISOString(),
    ...(input.serverAuthoritative !== undefined ? { serverAuthoritative: input.serverAuthoritative } : {}),
    ...(input.consentGrantedAt !== undefined ? { consentGrantedAt: input.consentGrantedAt } : {}),
  };
}

export function createRecordId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pre-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type PreAuditPhaseExport = PreAuditPhase;