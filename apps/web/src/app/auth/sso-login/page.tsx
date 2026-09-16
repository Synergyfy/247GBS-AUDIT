'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { mcomService } from '@/services/mcom';

export default function SsoLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('No SSO token received');
      return;
    }

    const processHandshake = async () => {
      try {
        const result = await mcomService.completeHandshake(token);
        if (result.token) {
          setStatus('success');
          setTimeout(() => {
            router.push('/auth/callback?token=' + result.token + '&role=' + result.role);
          }, 1000);
        } else {
          throw new Error('No token received from handshake');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Handshake authentication failed');
      }
    };

    processHandshake();
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing SSO...</h2>
            <p className="text-slate-500 font-medium">Verifying your MCOM handshake token</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">SSO Verified!</h2>
            <p className="text-slate-500 font-medium">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">SSO Failed</h2>
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
