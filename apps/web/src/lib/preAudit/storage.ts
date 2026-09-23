import type { PreAuditProgress, PreAuditSubmission } from "./types";
import { PRE_AUDIT_VERSION } from "./engine";

export const PRE_AUDIT_PROGRESS_KEY = "247gbs_preaudit_progress";
export const PRE_AUDIT_RESULT_KEY = "247gbs_preaudit_result";
export const PRE_AUDIT_SUBMISSIONS_KEY = "247gbs_preaudit_submissions";

const MAX_STORED_SUBMISSIONS = 50;

function canUseStorage(): boolean {
  try {
    const probe = "__247gbs_preaudit_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function read<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures; the flow can still proceed in memory.
  }
}

export function saveProgress(progress: PreAuditProgress): boolean {
  return write(PRE_AUDIT_PROGRESS_KEY, progress);
}

export function loadProgress(): PreAuditProgress | null {
  const progress = read<PreAuditProgress>(PRE_AUDIT_PROGRESS_KEY);
  if (!progress || progress.version !== PRE_AUDIT_VERSION) return null;
  return progress;
}

export function clearProgress(): void {
  remove(PRE_AUDIT_PROGRESS_KEY);
}

export function loadLastResult(): PreAuditSubmission | null {
  return read<PreAuditSubmission>(PRE_AUDIT_RESULT_KEY);
}

export function loadSubmissions(): PreAuditSubmission[] {
  return read<PreAuditSubmission[]>(PRE_AUDIT_SUBMISSIONS_KEY) ?? [];
}

/**
 * Persists the completed pre-audit locally. Returns false when storage is
 * unavailable or full (surfaced to the user as a submission failure rather
 * than a silent success).
 */
export function saveSubmission(submission: PreAuditSubmission): boolean {
  if (!write(PRE_AUDIT_RESULT_KEY, submission)) return false;

  const submissions = loadSubmissions().filter((s) => s.fingerprint !== submission.fingerprint);
  submissions.unshift(submission);
  const trimmed = submissions.slice(0, MAX_STORED_SUBMISSIONS);

  return write(PRE_AUDIT_SUBMISSIONS_KEY, trimmed);
}

export function findDuplicateSubmission(
  fingerprint: string,
  submissions: PreAuditSubmission[] = loadSubmissions()
): PreAuditSubmission | undefined {
  return submissions.find((s) => s.fingerprint === fingerprint);
}