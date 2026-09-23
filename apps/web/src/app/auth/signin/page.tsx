"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    Bot,
    Zap,
    AlertCircle,
    ExternalLink,
    Loader2,
    CheckCircle2,
} from "lucide-react";
import { mcomService } from "@/services/mcom";

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [localError, setLocalError] = useState("");
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoConfigured, setSsoConfigured] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const errorCode = searchParams.get('error');
        if (errorCode) {
            const messages: Record<string, string> = {
                oauth_failed: 'Central Hub SSO authentication failed. Please try again.',
                missing_code: 'Missing authorization code from Central Hub.',
                session_expired: 'Your session has expired. Please sign in again.',
                access_denied: 'Access denied. You may not have permission to access this platform.',
            };
            setLocalError(messages[errorCode] || 'Authentication error occurred.');
        }

        mcomService.getConfig().then(config => {
            setSsoConfigured(config.configured);
        }).catch((err) => {
            console.error('Failed to fetch SSO config:', err);
        }).finally(() => setChecking(false));
    }, [searchParams]);

    const handleSsoLogin = async () => {
        setSsoLoading(true);
        setLocalError("");
        try {
            await mcomService.startLogin();
        } catch (err: any) {
            setLocalError(err.message || 'Failed to start SSO login');
            setSsoLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-orange-100">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100 sticky top-0 z-20">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20">
                        A
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900">247GBS</span>
                </Link>
                <Link href="/" className="text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors px-3 py-1 bg-slate-50 rounded-full">
                    Cancel
                </Link>
            </div>

            {/* Visual Branding Side */}
            <div className="hidden md:flex relative w-full md:w-5/12 bg-slate-900 overflow-hidden flex-col justify-center p-12 lg:p-20 text-white">
                <div className="absolute top-0 right-0 p-20 opacity-10 text-orange-500">
                    <ShieldCheck size={300} strokeWidth={0.5} />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            A
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-orange-500 transition-colors">247GBS Audit</span>
                    </Link>

                    <div className="space-y-6 max-w-sm">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <Bot size={14} className="text-orange-500" />
                            AI-Enhanced Strategy
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Access Your <span className="text-orange-500">Intelligence</span> Vault.
                        </h1>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            Sign in to manage your business audits, view forensic recovery roadmaps, and connect with sector specialists.
                        </p>
                    </div>

                    <div className="mt-20 pt-10 border-t border-white/5 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Zap className="text-orange-500" size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold">Forensic Analysis</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Real-time Benchmarking</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center items-center py-10 md:py-20 px-6 lg:px-20 bg-white md:bg-slate-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[440px] bg-white md:p-12 md:rounded-[3rem] md:shadow-2xl md:shadow-slate-200/50 md:border md:border-slate-100"
                >
                    <header className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Secure Sign In</h2>
                        <p className="text-slate-500 font-medium">Authenticate via Central Hub Solutions to access the ecosystem.</p>
                    </header>

                    <div className="space-y-6">
                        {localError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                            >
                                <AlertCircle size={18} />
                                {localError}
                            </motion.div>
                        )}

                        {checking ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-orange-500" size={28} />
                            </div>
                        ) : ssoConfigured ? (
                            <button
                                type="button"
                                disabled={ssoLoading}
                                onClick={handleSsoLogin}
                                className="w-full py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-bold text-lg md:text-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
                            >
                                {ssoLoading ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-orange-300 border-t-white rounded-full animate-spin" />
                                        <span>Connecting to Central Hub...</span>
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink size={22} />
                                        <span>Sign in with Central Hub Solutions</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
                                <p className="text-slate-500 font-medium">Central Hub SSO is not configured.</p>
                                <p className="text-slate-400 text-sm mt-1">Contact your administrator to enable SSO.</p>
                            </div>
                        )}
                    </div>

                    <footer className="mt-12 text-center">
                        <p className="text-slate-500 font-medium mb-4 text-sm">New to the 247GBS Ecosystem?</p>
                        <Link
                            href="/auth/signup"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-100 rounded-full font-bold text-[10px] uppercase tracking-widest text-slate-900 hover:border-orange-500 hover:text-orange-600 transition-all"
                        >
                            <CheckCircle2 size={14} />
                            Create Account via Central Hub
                        </Link>
                    </footer>
                </motion.div>
            </div>
        </div>
    );
}
