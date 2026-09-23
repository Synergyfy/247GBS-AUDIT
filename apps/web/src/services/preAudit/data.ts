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

export async function ensureStartQuestion(): Promise<TriagePublicQuestion> {
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