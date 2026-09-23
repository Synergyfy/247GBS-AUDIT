import type { PreAuditAnswerRecord } from "./types";
import type { Question } from "@/types/audit";

/**
 * Confidence-gated Pre-Audit -> Audit answers mapping (P5).
 *
 * The pre-audit collects triage answers; the audit collects detailed metrics.
 * There is no guaranteed 1:1 relationship, so prefill is BEST-EFFORT and only
 * fills an audit question when the question text matches confidently AND the
 * answer can be coerced into the audit question's shape. Anything below the
 * thresholds is left for the visitor to answer normally.
 *
 * Curated pairs are optional and keyed by a normalized pre-audit question text
 * (lowercase, non-alphanumerics turned to spaces). They win over fuzzy
 * matching; add pairs here when you know the exact triage wording for a
 * question. With no curated pair the fuzzy matcher is used.
 */
export const CURATED_PRE_ANSWER_MAP: Record<string, string> = {
  // Example: "average number of staff with no active tasks during shift?" -> "idle_staff_general"
};

export interface PreAuditPrefillResult {
  answers: Record<string, any>;
  filled: number;
}

const QUESTION_MATCH_THRESHOLD = 0.55;
const CONTAINMENT_MIN_LENGTH = 10;

export function normalizePrefillText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(normalizePrefillText(text).split(" ").filter(Boolean));
}

function jaccard(a: string, b: string): number {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (A.size === 0 || B.size === 0) return 0;
  let intersection = 0;
  for (const token of A) if (B.has(token)) intersection += 1;
  const union = A.size + B.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function containsScore(a: string, b: string): boolean {
  const na = normalizePrefillText(a);
  const nb = normalizePrefillText(b);
  return (
    (na.length >= CONTAINMENT_MIN_LENGTH && na.includes(nb)) ||
    (nb.length >= CONTAINMENT_MIN_LENGTH && nb.includes(na))
  );
}

/** Best-fitting audit question for a pre-audit answer record, or null when below threshold. */
function bestAuditQuestion(
  record: PreAuditAnswerRecord,
  candidates: Question[]
): Question | null {
  const curated = CURATED_PRE_ANSWER_MAP[normalizePrefillText(record.questionText)];
  if (curated) {
    const found = candidates.find((q) => q.id === curated);
    if (found) return found;
  }

  let best: Question | null = null;
  let bestScore = 0;
  for (const question of candidates) {
    const score = jaccard(record.questionText, question.text);
    if (score > bestScore) {
      bestScore = score;
      best = question;
    }
  }
  if (!best) return null;
  if (bestScore >= QUESTION_MATCH_THRESHOLD) return best;
  if (containsScore(record.questionText, best.text)) return best;
  return null;
}

function labelMatches(label: string, answerText: string): boolean {
  const nl = normalizePrefillText(label);
  const na = normalizePrefillText(answerText);
  if (!nl || !na) return false;
  if (nl === na) return true;
  return nl.includes(na) || na.includes(nl);
}

function matchOption(question: Question, answerText: string): string | null {
  const match = (question.options ?? []).find(
    (opt) => labelMatches(opt.label, answerText) || (opt.sub ? labelMatches(opt.sub, answerText) : false)
  );
  return match ? match.id : null;
}

function extractNumber(record: PreAuditAnswerRecord): number | null {
  const raw = typeof record.value === "number" ? String(record.value) : (record.value as string);
  if (typeof raw === "string") {
    const match = raw.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    if (match) {
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  for (const text of record.answerTexts) {
    const match = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return null;
}

/**
 * Coerces a pre-audit answer into the audit question's value shape. Returns
 * `undefined` when the answer cannot map safely onto the question.
 */
function coerceAnswer(question: Question, record: PreAuditAnswerRecord): any {
  const firstText = record.answerTexts[0] ?? "";
  switch (question.type) {
    case "number":
    case "percentage":
    case "currency": {
      const number = extractNumber(record);
      if (number === null) return undefined;
      const q = question as Question & { min?: number; max?: number };
      if (q.min !== undefined && number < q.min) return q.min;
      if (q.max !== undefined && number > q.max) return q.max;
      return question.type === "percentage" ? Math.min(100, Math.max(0, number)) : number;
    }
    case "boolean": {
      const text = normalizePrefillText(
        typeof record.value === "string" ? record.value : firstText
      );
      if (text.startsWith("yes") || text === "true") return "yes";
      if (text.startsWith("no") || text === "false") return "no";
      return undefined;
    }
    case "multiple-choice":
    case "rating": {
      const matched = matchOption(question, record.answerTexts.length > 0 ? record.answerTexts[0] : "");
      return matched ?? undefined;
    }
    case "multi-select": {
      const matched: string[] = [];
      for (const text of record.answerTexts) {
        const optionId = matchOption(question, text);
        if (optionId && !matched.includes(optionId)) matched.push(optionId);
      }
      return matched.length > 0 ? matched : undefined;
    }
    case "text":
    case "long-text": {
      const value =
        typeof record.value === "string" && record.value.trim() !== ""
          ? record.value
          : record.answerTexts.join(", ");
      return value.trim() !== "" ? value.trim() : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Best-effort mapping of completed pre-audit answers onto the audit questions
 * the flow will actually show. Only confident, coercible answers are returned;
 * unmapped questions stay unanswered for the visitor.
 */
export function buildPreAuditPrefill(
  preAuditAnswers: PreAuditAnswerRecord[],
  auditQuestions: Question[]
): PreAuditPrefillResult {
  const answers: Record<string, any> = {};
  let filled = 0;

  for (const record of preAuditAnswers) {
    const question = bestAuditQuestion(record, auditQuestions);
    if (!question) continue;
    if (question.id in answers) continue;

    const value = coerceAnswer(question, record);
    if (value === undefined) continue;

    answers[question.id] = value;
    filled += 1;
    if (filled >= Math.min(200, auditQuestions.length)) break;
  }

  return { answers, filled };
}