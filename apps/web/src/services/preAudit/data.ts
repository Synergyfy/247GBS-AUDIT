"use client";

import { fetchTriageStart, fetchTriageQuestion } from "@/services/triage/flow";
import type { TriagePublicQuestion } from "@/services/triage/types";

/**
 * Client-side cache of every question fetched during the active pre-audit.
 * Kept in memory so back-navigation and branch recalculation can resolve
 * questions without additional network round-trips.
 */
const questionCache: Record<string, TriagePublicQuestion> = {};

export function getCachedQuestion(id: string): TriagePublicQuestion | null {
  return questionCache[id] ?? null;
}

/**
 * Returns the first question of the flow. A published-form override (the form's
 * own start question) is used when provided; otherwise the canonical start
 * question endpoint is fetched and cached.
 */
export async function ensureStartQuestion(
  override?: TriagePublicQuestion | null
): Promise<TriagePublicQuestion> {
  if (override) {
    if (override.id) questionCache[override.id] = override;
    questionCache.__start = override;
    return override;
  }
  if (questionCache.__start) return questionCache.__start;
  const question = await fetchTriageStart();
  questionCache[question.id] = question;
  return question;
}

export async function ensureQuestion(id: string): Promise<TriagePublicQuestion> {
  const cached = getCachedQuestion(id);
  if (cached) return cached;
  const question = await fetchTriageQuestion(id);
  questionCache[question.id] = question;
  return question;
}

export function hydrateCache(questions: TriagePublicQuestion[]): void {
  for (const question of questions) {
    if (question) questionCache[question.id] = question;
  }
}

export function resetCache(): void {
  for (const key of Object.keys(questionCache)) {
    delete questionCache[key];
  }
}