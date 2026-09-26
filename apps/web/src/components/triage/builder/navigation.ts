import type {
  AdminTriageAnswer,
  AdminTriageQuestion,
  AnswerDestinationSnapshot,
} from "@/services/triage/types";
import { isChoiceType } from "@/services/triage/types";

/**
 * Response-based navigation helpers for the Business Triage builder.
 *
 * Each choice question may route every answer to a specific destination (the
 * next question, a particular question, or the end / submit of the form).
 * The feature is builder-scoped: "next question" is represented by the next
 * active question's stable id, so the existing runtime keeps applying the
 * stored per-option destinations. `config.responseNavigation` records whether
 * the toggle is on; `config.preservedNavigation` snapshots the routing that was
 * in place when the admin switched the toggle off, restored on re-enable.
 */

/** Select value for the linear default ("continue to the next question"). */
export const GO_TO_NEXT = "__next__";

/** Select/token prefix for terminal ("end of form") destinations. */
export const GO_TO_END_PREFIX = "__end_";

export function endTokenOf(destinationType: string | null | undefined): string {
  return destinationType ? `${GO_TO_END_PREFIX}${destinationType}` : "";
}

export function destinationOfEndToken(token: string): string | null {
  return token.startsWith(GO_TO_END_PREFIX)
    ? token.slice(GO_TO_END_PREFIX.length)
    : null;
}

/**
 * Whether a question currently uses response-based navigation. An explicit
 * `config.responseNavigation` value always wins; legacy questions without the
 * flag count as configured only when an option genuinely diverges from the
 * linear default (so plain "next question" routing shows the toggle OFF).
 */
export function responseNavigationOn(
  question: AdminTriageQuestion,
  ordered?: AdminTriageQuestion[]
): boolean {
  if (question.config?.responseNavigation === true) return true;
  if (question.config?.responseNavigation === false) return false;
  if (ordered) {
    const nextId = nextLinearId(question, ordered);
    return question.answers.some(
      (a) => a.isActive !== false && !isLinearDestination(a, nextId)
    );
  }
  return question.answers.some(
    (a) => a.isActive !== false && Boolean(a.nextQuestionId || a.auditType || a.destinationType)
  );
}

/** The active question that immediately follows `question` in the given order. */
export function nextLinearId(
  question: AdminTriageQuestion,
  ordered: AdminTriageQuestion[] | undefined
): string | null {
  if (!ordered) return null;
  const index = ordered.findIndex((q) => q.id === question.id);
  if (index < 0) return null;
  return ordered.slice(index + 1).find((q) => q.isActive)?.id ?? null;
}

/**
 * A destination is the linear default when the option simply advances to the
 * next active question, or ends the flow (human review) when there is none.
 */
export function isLinearDestination(
  answer: AdminTriageAnswer,
  nextId: string | null
): boolean {
  if (nextId) return answer.nextQuestionId === nextId && !answer.auditType && !answer.destinationType;
  return (
    !answer.nextQuestionId && !answer.auditType && answer.destinationType === "HUMAN_REVIEW"
  );
}

/**
 * Rewrites a draft answer to follow the linear default (next active question,
 * or "End / Submit" = human review when there is no following question).
 * Returns the same object when the answer is already linear.
 */
export function linearizeAnswer(
  answer: AdminTriageAnswer,
  nextId: string | null
): AdminTriageAnswer {
  if (nextId) {
    if (isLinearDestination(answer, nextId) && answer.destinationTarget == null) return answer;
    return {
      ...answer,
      nextQuestionId: nextId,
      auditType: null,
      destinationType: null,
      destinationTarget: null,
    };
  }
  if (isLinearDestination(answer, null) && answer.destinationTarget == null) return answer;
  return {
    ...answer,
    nextQuestionId: null,
    auditType: null,
    destinationType: "HUMAN_REVIEW",
    destinationTarget: null,
  };
}

/** Human label for a "go to" option, e.g. "Question 4 — Restaurant details". */
export function questionStepLabel(question: AdminTriageQuestion): string {
  const step = typeof question.order === "number" ? question.order : "?";
  return `Question ${step} — ${question.text?.trim() || "Untitled question"}`;
}

/** The builder select value that represents an answer's stored destination. */
export function goToValueOf(answer: AdminTriageAnswer): string {
  if (answer.nextQuestionId) return answer.nextQuestionId;
  const end = answer.destinationType ?? answer.auditType;
  return end ? endTokenOf(end) : GO_TO_NEXT;
}

/** Compact snapshot of an option's destination, preserved while nav is off. */
export function destinationSnapshotOf(
  answer: AdminTriageAnswer
): AnswerDestinationSnapshot {
  return {
    nextQuestionId: answer.nextQuestionId,
    auditType: answer.auditType,
    destinationType: answer.destinationType,
    destinationTarget: answer.destinationTarget,
  };
}

/**
 * Local-first route status for one question, computed from the live draft
 * (never from the stale server `hasAuditPath` snapshot).
 *
 * - `next` — the question flows on to another question (linear default while
 *   response-based navigation is off, or an explicit default-next). No warning.
 * - `end` — the last step: the form ends / submits here. No warning.
 * - `ok` — explicit routing is configured and every destination is valid.
 * - `attention` — something genuinely needs the admin: a destination points
 *   to a deleted/inactive question, an answer has no destination where one is
 *   required, or the answers loop without reaching the end of the form.
 */
export type RouteStatus =
  | { kind: "next"; nextId: string }
  | { kind: "end" }
  | { kind: "ok" }
  | { kind: "attention"; reason: string };

/**
 * Whether the flow can progress from `question` to some terminal destination
 * through the draft's stored edges. Mirrors the backend audit-reachability
 * walk (any-path DFS with a cycle guard; a terminal is any answer or
 * question-level audit/destination type).
 */
export function canReachTerminal(
  question: AdminTriageQuestion,
  ordered: AdminTriageQuestion[]
): boolean {
  const byId = new Map(ordered.map((q) => [q.id, q]));
  const nextIds = new Map<string, string[]>();
  const exits = new Set<string>();
  const pushEdge = (from: string, to: string | null | undefined) => {
    if (!to) return;
    const target = byId.get(to);
    if (!target || target.isActive === false) return;
    const bucket = nextIds.get(from) ?? [];
    bucket.push(to);
    nextIds.set(from, bucket);
  };
  for (const q of ordered) {
    if (q.isActive === false) continue;
    for (const a of q.answers) {
      if (a.isActive === false) continue;
      pushEdge(q.id, a.nextQuestionId);
      if (a.auditType || a.destinationType) exits.add(q.id);
    }
    if (q.defaultAuditType || q.defaultDestinationType) exits.add(q.id);
    pushEdge(q.id, q.defaultNextQuestionId);
  }
  const memo = new Map<string, boolean>();
  const dfs = (id: string, visiting: Set<string>): boolean => {
    if (memo.get(id)) return true;
    if (visiting.has(id)) return false;
    if (exits.has(id)) {
      memo.set(id, true);
      return true;
    }
    const next = nextIds.get(id) ?? [];
    if (next.length === 0) return false;
    visiting.add(id);
    for (const nid of next) {
      if (dfs(nid, visiting)) {
        visiting.delete(id);
        memo.set(id, true);
        return true;
      }
    }
    visiting.delete(id);
    return false;
  };
  return dfs(question.id, new Set());
}

export function routeStatusOf(
  question: AdminTriageQuestion,
  ordered?: AdminTriageQuestion[]
): RouteStatus | null {
  // Inactive questions don't participate in routing — the card already shows
  // an "Inactive" pill, so no route badge is rendered for them.
  if (question.isActive === false) return null;
  const list = ordered ?? [];
  const byId = new Map(list.map((q) => [q.id, q]));

  if (isChoiceType(question.type)) {
    const activeAnswers = question.answers.filter((a) => a.isActive !== false);
    if (activeAnswers.length === 0) {
      return {
        kind: "attention",
        reason: "This question has no options yet — add at least one option.",
      };
    }
    // Linear default: every answer continues to the next question (or ends
    // the form for the tail). This is always valid — never a warning.
    if (!responseNavigationOn(question, ordered)) {
      const nextId = nextLinearId(question, ordered);
      return nextId ? { kind: "next", nextId } : { kind: "end" };
    }
    for (const a of activeAnswers) {
      if (a.nextQuestionId) {
        if (a.nextQuestionId === question.id) {
          return {
            kind: "attention",
            reason: `Option "${a.text}" points back to this question.`,
          };
        }
        const target = byId.get(a.nextQuestionId);
        if (!target) {
          return {
            kind: "attention",
            reason: `Option "${a.text}" points to a question that no longer exists.`,
          };
        }
        if (target.isActive === false) {
          return {
            kind: "attention",
            reason: `Option "${a.text}" points to an inactive question.`,
          };
        }
      } else if (!a.auditType && !a.destinationType) {
        return {
          kind: "attention",
          reason: `Option "${a.text}" has no destination — choose where it leads.`,
        };
      }
    }
    if (!canReachTerminal(question, list)) {
      return {
        kind: "attention",
        reason: "These answers loop without reaching the end of the form.",
      };
    }
    return { kind: "ok" };
  }

  // Option-less questions route everything through one default destination.
  // Publish requires one (a question with nowhere to go dead-ends
  // respondents), so a missing default genuinely needs attention.
  if (question.defaultNextQuestionId) {
    if (question.defaultNextQuestionId === question.id) {
      return { kind: "attention", reason: "This question points back to itself." };
    }
    const target = byId.get(question.defaultNextQuestionId);
    if (!target) {
      return {
        kind: "attention",
        reason: "This question points to a question that no longer exists.",
      };
    }
    if (target.isActive === false) {
      return {
        kind: "attention",
        reason: "This question points to an inactive question.",
      };
    }
    return { kind: "next", nextId: target.id };
  }
  if (question.defaultAuditType || question.defaultDestinationType) {
    return { kind: "ok" };
  }
  return {
    kind: "attention",
    reason: "Set a default destination so respondents can continue.",
  };
}