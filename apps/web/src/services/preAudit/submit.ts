"use client";

import { API_BASE_URL } from "@/lib/api";
import { stepsOf } from "@/lib/preAudit/engine";
import type { PreAuditVisitedEntry } from "@/lib/preAudit/types";

export interface PreAuditSubmitResult {
  id: string;
  email: string | null;
  recommendedAuditType: "SHORT_FORM" | "LONG_FORM" | "NONE" | null;
  answeredCount: number;
  isDuplicate: boolean;
}

/**
 * Re-evaluation submission: the server walks the configured flow from the
 * start question, validates every answer and computes the recommended audit
 * itself. The client never sends destinations.
 */
export async function submitPreAudit(
  email: string,
  visited: PreAuditVisitedEntry[]
): Promise<PreAuditSubmitResult> {
  const body = { email: email.trim(), steps: stepsOf(visited) };
  const res = await fetch(`${API_BASE_URL}/pre-audit/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const errJson = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(
      errJson.message || `The pre-audit could not be submitted (${res.status}).`
    ) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  return res.json() as Promise<PreAuditSubmitResult>;
}