import { API_BASE_URL } from './api';

/**
 * Fired when the refresh session is definitively gone (HTTP 401 from
 * /auth/refresh). Listeners should drop their auth state; the AuthProvider
 * redirects to the sign-in page — but ONLY from genuinely protected routes
 * (see isProtectedRoute). Public pages and the dev-public /admin/* pages must
 * never be redirected; stale state is simply cleared.
 */
export const SESSION_EXPIRED_EVENT = '247gbs:session-expired';
export const USER_UPDATED_EVENT = '247gbs:user-updated';

/**
 * True when `pathname` is a customer/business route that genuinely requires a
 * live session and should redirect to sign-in after the session expires.
 *
 * /dashboard is currently the only protected customer area. /admin/* is
 * intentionally excluded while it is open for development, and every other
 * path (/, /auth/*, /audit/*, /pricing, ...) is intentionally public.
 */
export function isProtectedRoute(pathname?: string): boolean {
  const p = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  if (p === '/admin/login') return false;
  return p.startsWith('/dashboard') || p.startsWith('/admin');
}

const ACCESS_TOKEN_KEY = '247gbs_token';
const LEGACY_ACCESS_TOKEN_KEY = 'auth_token';
const USER_KEY = '247gbs_user';

/** Canonical session user — Context authoritative, Zustand mirrors. */
export interface SessionUserInput {
  email: string;
  name?: string | null;
  avatar?: string | null;
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  id?: string | null;
}

export interface SessionUser {
  email: string;
  name: string;
  avatar: string;
  role: string;
  firstName?: string;
  lastName?: string;
  id?: string;
}

function formatEmailPrefix(email: string): string {
  return email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Single normalizer — handles Context shape {name,avatar}, Prisma shape
 *  {firstName,lastName}, and Central Hub SSO shape. Always derives a display
 *  name instead of falling back to Guest. */
export function normalizeUser(input: SessionUserInput): SessionUser {
  const email = (input.email || '').trim();
  const firstName = (input.firstName || '').trim() || undefined;
  const lastName = (input.lastName || '').trim() || undefined;
  const explicitName = (input.name || '').trim() || undefined;
  const combinedName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || undefined;
  const name = explicitName || combinedName || (email ? formatEmailPrefix(email) : 'Guest');
  const avatar =
    (input.avatar || '').trim() ||
    `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(email || 'guest')}`;
  const out: SessionUser = {
    email,
    name,
    avatar,
    role: (input.role || '').trim() || 'User',
  };
  if (firstName) out.firstName = firstName;
  if (lastName) out.lastName = lastName;
  if (input.id) out.id = input.id;
  return out;
}

/** Build a session user from backend shapes (Prisma user, /users/profile,
 *  JWT payload, SSO JIT). Accepts loose input, always normalizes. */
export function buildSessionUser(input: Record<string, unknown> | null | undefined): SessionUser | null {
  if (!input) return null;
  const rec = input as Record<string, string | undefined>;
  const email = (rec.email || '').trim();
  if (!email) return null;
  return normalizeUser({
    email,
    name: rec.name,
    avatar: rec.avatar,
    role: rec.role,
    firstName: rec.firstName,
    lastName: rec.lastName,
    id: rec.id ?? rec.sub,
  });
}

/** Single-flight refresh: concurrent callers share ONE in-flight request so
 *  the rotating refresh cookie/token can never race against itself (a race
 *  would leave the browser with a cookie whose hash no longer matches the DB,
 *  hard-invalidating the session). */
let inFlightRefresh: Promise<string | null | false> | null = null;

export function persistAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    // The app's primary key is 247gbs_token (read by every admin/audit hook);
    // auth_token is kept in sync for the legacy apiClient. Refreshing used to
    // write ONLY auth_token, leaving 247gbs_token permanently stale — every
    // request then 401'd and triggered another refresh (amplifying the race).
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, token);
  } catch {
    // storage unavailable (private mode); the in-memory retry still uses the token
  }
}

/**
 * Clears all local auth state and notifies listeners that the session is over.
 * Safe to call multiple times.
 */
export function handleSessionExpired(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  } catch {
    // ignore
  }
}

async function refreshOnce(): Promise<string | null | false> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'GET',
      credentials: 'include', // send HttpOnly refresh cookie
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.status === 401 || res.status === 403) {
      // invalid/expired refresh session — tear down local state so listeners
      // (AuthContext) can move the user to the sign-in page.
      // 403 covers rotating-refresh mismatch (bcrypt compare fail -> Forbidden).
      handleSessionExpired();
      return false;
    }
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    const json = await res.json();
    const token = json?.accessToken;
    if (token) persistAccessToken(token);
    return token ?? null;
  } catch (err) {
    // Network/server hiccup — NOT a definitive expiry; don't clear the session.
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null | false> {
  if (inFlightRefresh) return inFlightRefresh;
  inFlightRefresh = refreshOnce().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

/** Single entry-point for sign-in persistence (AuthContext authoritative).
 *  Writes normalized user + both token keys so Zustand store and Context never
 *  diverge. Fires USER_UPDATED_EVENT for same-tab sync (StorageEvent only fires
 *  cross-tab natively). Returns normalized user or null if email missing. */
export function persistSession(user: unknown, token: string): void {
  if (typeof window === 'undefined') return;
  persistAccessToken(token);
  try {
    const normalized =
      (user as SessionUser)?.email
        ? normalizeUser(user as SessionUserInput)
        : buildSessionUser(user as Record<string, unknown>);
    if (!normalized) return;
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    try {
      window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT));
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}

/** Unified sign-in: normalize + persist + notify. Use this from every login
 *  entry point (callback, admin/login, useAuthActions) instead of raw
 *  localStorage.setItem. Does NOT touch React state directly — AuthContext
 *  and Zustand pick it up via USER_UPDATED_EVENT / storage listeners. */
export function signInSession(userInput: unknown, token: string): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const normalized =
    (userInput as SessionUser)?.email
      ? normalizeUser(userInput as SessionUserInput)
      : buildSessionUser(userInput as Record<string, unknown>);
  if (!normalized || !token) return null;
  persistSession(normalized, token);
  return normalized;
}

/** Single entry-point for sign-out. Clears user + both token keys. */
export function clearSession(): void {
  handleSessionExpired();
}

export default refreshAccessToken;