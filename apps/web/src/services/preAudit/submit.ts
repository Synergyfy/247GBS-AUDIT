"use client";

import { API_BASE_URL } from "@/lib/api";
import { stepsOf } from "@/lib/preAudit/engine";
import { PRE_AUDIT_CONSENT_VERSION } from "@/lib/preAudit/engine";
import type { PreAuditVisitedEntry } from "@/lib/preAudit/types";

export interface PreAuditSubmitResult {
  id: string;
  email: string | null;
  recommendedAuditType: "SHORT_FORM" | "LONG_FORM" | "NONE" | null;
  destinationType: string | null;
  destinationTarget: string | null;
  consentGrantedAt: string | null;
  answeredCount: number;
  isDuplicate: boolean;
}

/**
 * Re-evaluation submission: the server walks the configured flow from the
 * start question, validates every answer and computes the recommended
 * destination itself. The client never sends destinations; consent is
 * required and recorded server-authoritatively.
 */
export async function submitPreAudit(
  email: string,
  visited: PreAuditVisitedEntry[],
  consentGranted = true,
  consentVersion = PRE_AUDIT_CONSENT_VERSION
): Promise<PreAuditSubmitResult> {
  const body = {
    email: email.trim(),
    steps: stepsOf(visited),
    consentGranted,
    consentVersion,
  };
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