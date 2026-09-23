// ============================================================
// Cookie Helpers (no external deps)
// ============================================================

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ============================================================
// Typed progress helpers
// ============================================================

export interface TriageProgress {
  type: "triage";
  stage: string;
  data: Record<string, any>;
  sectorId?: string;
}

export interface AuditProgress {
  type: "audit";
  auditId: string;
  auditType: string;
  sectorId: string;
  groupId?: string;
  businessTypeId?: string;
  stock?: string;
  capacity?: string;
  currentStepIndex: number;
  answers: Record<string, any>;
}

export type SavedProgress = TriageProgress | AuditProgress;

const PROGRESS_KEY = "247gbs_progress";

export function saveProgress(progress: SavedProgress) {
  setCookie(PROGRESS_KEY, JSON.stringify(progress), 30);
}

export function getProgress(): SavedProgress | null {
  const raw = getCookie(PROGRESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedProgress;
  } catch {
    return null;
  }
}

export function clearProgress() {
  deleteCookie(PROGRESS_KEY);
}

// ============================================================
// Cookie consent
// ============================================================

const CONSENT_KEY = "247gbs_cookies_consent";

export function hasConsent(): boolean {
  return getCookie(CONSENT_KEY) === "true";
}

export function setConsent() {
  setCookie(CONSENT_KEY, "true", 365);
}

// ============================================================
// Assessment completed flag
// ============================================================

const COMPLETED_KEY = "247gbs_assessment_completed";

export function isAssessmentCompleted(): boolean {
  return getCookie(COMPLETED_KEY) === "true";
}

export function markAssessmentCompleted() {
  setCookie(COMPLETED_KEY, "true", 365);
}

export function clearAssessmentCompleted() {
  deleteCookie(COMPLETED_KEY);
}
