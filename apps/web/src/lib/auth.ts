import { API_BASE_URL } from './api';

/**
 * Fired when the refresh session is definitively gone (HTTP 401 from
 * /auth/refresh). Listeners should drop their auth state; the AuthProvider
 * redirects to the sign-in page — but ONLY from genuinely protected routes
 * (see isProtectedRoute). Public pages and the dev-public /admin/* pages must
 * never be redirected; stale state is simply cleared.
 */
export const SESSION_EXPIRED_EVENT = '247gbs:session-expired';

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
  return p.startsWith('/dashboard');
}

const ACCESS_TOKEN_KEY = '247gbs_token';
const LEGACY_ACCESS_TOKEN_KEY = 'auth_token';
const USER_KEY = '247gbs_user';

/** Single-flight refresh: concurrent callers share ONE in-flight request so
 *  the rotating refresh cookie/token can never race against itself (a race
 *  would leave the browser with a cookie whose hash no longer matches the DB,
 *  hard-invalidating the session). */
let inFlightRefresh: Promise<string | null | false> | null = null;

function persistAccessToken(token: string): void {
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

    if (res.status === 401) {
      // invalid/expired refresh session — tear down local state so listeners
      // (AuthContext) can move the user to the sign-in page.
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

export default refreshAccessToken;