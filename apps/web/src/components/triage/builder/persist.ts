import type { AnswerPayload, QuestionPayload } from "@/services/triage/hooks";
import type {
  AdminTriageAnswer,
  AdminTriageQuestion,
  AnswerDestinationSnapshot,
  QuestionConfig,
} from "@/services/triage/types";

/**
 * Persistence diff for the local-first builder.
 *
 * The builder keeps a working draft (`AdminTriageQuestion[]`). On the explicit
 * Save action it diffs the draft against the last persisted snapshot
 * (`base`) and turns the changes into ordered create/update/delete calls that
 * can be sent to the API without any UI refetch in between.
 */

export const TEMP_PREFIX = "draft-";

let seq = 0;
/** Stable unique id for questions/answers created while editing locally. */
export function tempId(kind: "q" | "a"): string {
  seq += 1;
  return `${TEMP_PREFIX}${kind}-${Date.now()}-${seq}`;
}

export function isTempId(id: string | null | undefined): boolean {
  return !!id && id.startsWith(TEMP_PREFIX);
}

export interface AnswerCreateOp {
  questionId: string;
  answer: AdminTriageAnswer;
}

export interface AnswerUpdateOp {
  id: string;
  payload: Partial<AnswerPayload>;
}

export interface QuestionUpdateOp {
  id: string;
  payload: Partial<QuestionPayload>;
}

export interface SavePlan {
  createQuestions: AdminTriageQuestion[];
  updateQuestions: QuestionUpdateOp[];
  deleteQuestions: string[];
  createAnswers: AnswerCreateOp[];
  updateAnswers: AnswerUpdateOp[];
  deleteAnswers: string[];
}

const QUESTION_FIELDS: (keyof AdminTriageQuestion)[] = [
  "text",
  "type",
  "description",
  "hint",
  "icon",
  "required",
  "config",
  "order",
  "isActive",
  "defaultNextQuestionId",
  "defaultAuditType",
  "defaultDestinationType",
  "defaultDestinationTarget",
];

const ANSWER_FIELDS: (keyof AdminTriageAnswer)[] = [
  "text",
  "internalValue",
  "tag",
  "nextQuestionId",
  "auditType",
  "destinationType",
  "destinationTarget",
  "sortOrder",
  "isActive",
];

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

function questionPatch(base: AdminTriageQuestion, draft: AdminTriageQuestion): Partial<QuestionPayload> {
  const patch: Partial<QuestionPayload> = {};
  for (const field of QUESTION_FIELDS) {
    if (!same(base[field], draft[field])) (patch as Record<string, unknown>)[field] = draft[field];
  }
  return patch;
}

function answerPatch(base: AdminTriageAnswer, draft: AdminTriageAnswer): Partial<AnswerPayload> {
  const patch: Partial<AnswerPayload> = {};
  for (const field of ANSWER_FIELDS) {
    if (!same(base[field], draft[field])) (patch as Record<string, unknown>)[field] = draft[field];
  }
  return patch;
}

export function buildSavePlan(base: AdminTriageQuestion[], draft: AdminTriageQuestion[]): SavePlan {
  const plan: SavePlan = {
    createQuestions: [],
    updateQuestions: [],
    deleteQuestions: [],
    createAnswers: [],
    updateAnswers: [],
    deleteAnswers: [],
  };

  const baseIds = new Set(base.map((q) => q.id));
  const draftIds = new Set(draft.map((q) => q.id));

  for (const q of draft) {
    if (!baseIds.has(q.id)) {
      plan.createQuestions.push(q);
      continue;
    }
    const bq = base.find((other) => other.id === q.id);
    if (!bq) continue;
    const patch = questionPatch(bq, q);
    if (Object.keys(patch).length > 0) plan.updateQuestions.push({ id: q.id, payload: patch });
    diffAnswers(bq.answers, q.answers, q.id, plan);
  }

  for (const id of baseIds) {
    if (!draftIds.has(id)) plan.deleteQuestions.push(id);
  }

  return plan;
}

function diffAnswers(
  baseAnswers: AdminTriageAnswer[],
  draftAnswers: AdminTriageAnswer[],
  questionId: string,
  plan: SavePlan
): void {
  const baseMap = new Map(baseAnswers.map((a) => [a.id, a]));
  const active = draftAnswers.filter((a) => a.isActive !== false);
  const draftMap = new Map(active.map((a) => [a.id, a]));

  for (const a of active) {
    const baseAnswer = baseMap.get(a.id);
    if (!baseAnswer) {
      plan.createAnswers.push({ questionId: a.questionId || questionId, answer: a });
      continue;
    }
    const patch = answerPatch(baseAnswer, a);
    if (Object.keys(patch).length > 0) plan.updateAnswers.push({ id: a.id, payload: patch });
  }

  for (const baseAnswer of baseAnswers) {
    if (!draftMap.has(baseAnswer.id)) plan.deleteAnswers.push(baseAnswer.id);
  }
}

/** Replace draft-temp question ids inside a payload with persisted ids. */
export function translateRefs<T extends object>(payload: T, qidMap: ReadonlyMap<string, string>): T {
  const next = { ...payload } as Record<string, unknown>;
  for (const key of ["nextQuestionId", "defaultNextQuestionId"]) {
    const value = next[key];
    if (typeof value === "string") next[key] = qidMap.get(value) ?? value;
  }
  return next as T;
}

/**
 * Re-key a preserved-navigation snapshot so it survives a save: snapshot keys
 * are draft answer ids (remapped via aidMap) and each snapshot's nextQuestionId
 * may be a draft question id (remapped via qidMap). Returns the same reference
 * when nothing needs to change.
 */
export function remapNavigationConfig(
  config: QuestionConfig,
  qidMap: ReadonlyMap<string, string>,
  aidMap: ReadonlyMap<string, string>
): QuestionConfig {
  const preserved = config.preservedNavigation;
  if (!preserved) return config;

  let changed = false;
  const next: Record<string, AnswerDestinationSnapshot> = {};
  for (const [key, snapshot] of Object.entries(preserved)) {
    const nextKey = aidMap.get(key) ?? key;
    const target = snapshot.nextQuestionId;
    const snapshotNext = target && qidMap.has(target) ? (qidMap.get(target) as string) : target;
    if (nextKey !== key || snapshotNext !== target) changed = true;
    next[nextKey] = { ...snapshot, nextQuestionId: snapshotNext ?? null };
  }

  if (!changed) return config;
  return { ...config, preservedNavigation: next };
}

/** Build the full answer payload to send for a draft answer. */
export function answerPayloadOf(answer: AdminTriageAnswer, qidMap: ReadonlyMap<string, string>): AnswerPayload {
  return translateRefs(
    {
      text: answer.text,
      internalValue: answer.internalValue,
      tag: answer.tag,
      nextQuestionId: answer.nextQuestionId,
      auditType: answer.auditType,
      destinationType: answer.destinationType,
      destinationTarget: answer.destinationTarget,
      sortOrder: answer.sortOrder,
      isActive: answer.isActive ?? true,
    },
    qidMap
  );
}

/** Re-key the draft after a successful save so temp ids become server ids. */
export function remapQuestion(
  question: AdminTriageQuestion,
  qidMap: ReadonlyMap<string, string>,
  aidMap: ReadonlyMap<string, string>
): AdminTriageQuestion {
  const qid = qidMap.get(question.id) ?? question.id;
  return {
    ...question,
    id: qid,
    defaultNextQuestionId: qidMap.get(question.defaultNextQuestionId ?? "") ?? question.defaultNextQuestionId,
    config: remapNavigationConfig(question.config, qidMap, aidMap),
    answers: question.answers.map((a) => ({
      ...a,
      id: aidMap.get(a.id) ?? a.id,
      questionId: qid,
      nextQuestionId: qidMap.get(a.nextQuestionId ?? "") ?? a.nextQuestionId,
    })),
  };
}

export function cloneQuestions(questions: AdminTriageQuestion[]): AdminTriageQuestion[] {
  return JSON.parse(JSON.stringify(questions)) as AdminTriageQuestion[];
}