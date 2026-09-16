'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

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
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      setStatus('error');
      setErrorMessage(message || 'Authentication failed');
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMessage('No authentication token received');
      return;
    }

    const payload = parseJwt(token);
    if (!payload) {
      setStatus('error');
      setErrorMessage('Invalid authentication token');
      return;
    }

    const userRole = role || payload.role || 'User';
    setAuth(
      {
        id: payload.sub,
        email: payload.email,
        firstName: payload.email.split('@')[0],
        lastName: '',
        role: userRole,
        isOnboarded: payload.isOnboarded,
      },
      token
    );

    setStatus('success');

    const redirectMap: Record<string, string> = {
      Administrator: '/admin',
      admin: '/admin',
      agent: '/dashboard/agent',
      account_manager: '/dashboard/account-manager',
      consultant: '/dashboard/consultant',
    };

    const redirectPath = redirectMap[userRole] || '/audit/welcome';

    setTimeout(() => {
      router.push(redirectPath);
    }, 1500);
  }, [searchParams, setAuth, router]);

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
