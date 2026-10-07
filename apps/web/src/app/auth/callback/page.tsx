'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { signInSession, refreshAccessToken } from '@/lib/auth';

interface TokenPayload {
  email: string;
  sub: string;
  role: string;
  isOnboarded?: boolean;
}

function parseJwt(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = async () => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      setStatus('error');
      setErrorMessage(message || 'Authentication failed');
      return;
    }

    // If MCOM Central redirected with code/state, redirect to backend callback
    // (matches affiliate project: browser redirect, not AJAX — cookies need to be sent)
    if (code && state) {
      const backendUrl = API_BASE_URL;
      window.location.href = `${backendUrl}/auth/sso/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      return;
    }

    // Cookie-based flow (no token in URL): backend set HttpOnly cookies and
    // redirected to /auth/callback. Recover the session via single-flight refresh + profile.
    if (!token) {
      try {
        // Use shared single-flight helper so this never races the 5m heartbeat
        // (rotating refresh consumed twice would hard-invalidate the session).
        const freshToken = await refreshAccessToken();
        if (typeof freshToken !== 'string' || !freshToken) throw new Error('No authentication token received');

        const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${freshToken}` },
          credentials: 'include',
        });
        if (!profileRes.ok) throw new Error('Could not load user profile');
        const profile = await profileRes.json();
        const userRole = profile?.role || 'User';
        // Single unified write: normalized user + both token keys + USER_UPDATED_EVENT.
        // AuthContext (authoritative) + Zustand (mirror) pick it up — no divergence.
        const signed = signInSession(profile, freshToken);
        if (!signed) throw new Error('No authentication token received');
        setStatus('success');
        const redirectMap: Record<string, string> = {
          Administrator: '/admin',
          admin: '/admin',
          agent: '/dashboard',
          account_manager: '/dashboard',
          consultant: '/dashboard',
        };
        timer = setTimeout(() => router.push(redirectMap[userRole] || '/dashboard'), 1500);
      } catch (e: unknown) {
        setStatus('error');
        setErrorMessage(e instanceof Error ? e.message : 'No authentication token received');
      }
      return;
    }

    const payload = parseJwt(token);
    if (!payload) {
      setStatus('error');
      setErrorMessage('Invalid authentication token');
      return;
    }

    const userRole = role || payload.role || 'User';
    // Prefer full profile (real Central Hub firstName/lastName) over JWT email-prefix.
    try {
      const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        const signed = signInSession({ ...profile, role: profile?.role || userRole }, token);
        if (signed) {
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch {
            // ignore
          }
          setStatus('success');
          const redirectMap: Record<string, string> = {
            Administrator: '/admin',
            admin: '/admin',
            agent: '/dashboard',
            account_manager: '/dashboard',
            consultant: '/dashboard',
          };
          timer = setTimeout(() => router.push(redirectMap[signed.role] || '/dashboard'), 1500);
          return;
        }
      }
    } catch {
      // fall through to JWT fallback
    }
    // JWT fallback (no profile reachable): derive name from email via normalizer.
    const fallback = signInSession(
      {
        id: payload.sub,
        email: payload.email,
        role: userRole,
      },
      token
    );
    if (!fallback) {
      setStatus('error');
      setErrorMessage('Invalid authentication token');
      return;
    }
    // Strip token from URL so it never lingers in history/logs.
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      // ignore
    }

    setStatus('success');

    const redirectMap: Record<string, string> = {
      Administrator: '/admin',
      admin: '/admin',
      agent: '/dashboard',
      account_manager: '/dashboard',
      consultant: '/dashboard',
    };

    const redirectPath = redirectMap[userRole] || '/dashboard';

    timer = setTimeout(() => {
      router.push(redirectPath);
    }, 1500);
    };
    run();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-md w-full mx-6 text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Loader2 className="text-orange-500 animate-spin" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Authenticating...</h2>
            <p className="text-slate-500 font-medium">Verifying your MCOM SSO credentials</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
            <p className="text-slate-500 font-medium">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Failed</h2>
            <p className="text-red-500 font-medium mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
            >
              Back to Sign In
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
