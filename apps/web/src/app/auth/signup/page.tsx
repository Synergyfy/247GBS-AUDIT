"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Loader2,
    Bot,
    Zap,
    Users,
} from "lucide-react";
import { mcomService } from "@/services/mcom";

export default function SignUpPage() {
    const router = useRouter();
    const [ssoLoading, setSsoLoading] = useState(false);
    const [localError, setLocalError] = useState("");
    const [ssoConfigured, setSsoConfigured] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        mcomService.getConfig().then(config => {
            setSsoConfigured(config.configured);
        }).catch((err) => {
            console.error('Failed to fetch SSO config:', err);
        }).finally(() => setChecking(false));
    }, []);

    const handleSsoSignup = async () => {
        setSsoLoading(true);
        setLocalError("");
        try {
            await mcomService.startLogin();
        } catch (err: any) {
            setLocalError(err.message || 'Failed to start Central Hub signup');
            setSsoLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col font-sans selection:bg-orange-100">
            {/* Header */}
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform">
                        A
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-orange-500 transition-colors">247GBS Audit</span>
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center py-10 md:py-20 px-6">
                <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side: Value Prop */}
                    <div className="hidden lg:block space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-orange-600">
                            <ShieldCheck size={14} />
                            Membership Protocol
                        </div>
                        <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                            Start Your Business <span className="text-orange-500">Journey</span> Today.
                        </h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            Create your account via MCOM Solutions SSO to access the full audit platform.
                        </p>

                        <div className="space-y-4 pt-10">
                            {[
                                { icon: CheckCircle2, label: "Complete Business Audit Suite" },
                                { icon: Bot, label: "AI-Powered Strategic Roadmaps" },
                                { icon: Users, label: "Specialist Consultation Credits" },
                                { icon: Zap, label: "London-Local Logistics Support" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                                >
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                                        <item.icon size={16} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-[500px] mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/50 md:border md:border-slate-100"
                    >
                        <header className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Create Account</h2>
                            <p className="text-slate-500 font-medium">
                                Sign up through Central Hub Solutions to get started.
                            </p>
                        </header>

                        {localError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
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
                            <div className="space-y-6">
                                <button
                                    type="button"
                                    disabled={ssoLoading}
                                    onClick={handleSsoSignup}
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
                                            <span>Sign up with Central Hub Solutions</span>
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        You will be redirected to Central Hub to complete registration
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="mx-auto text-slate-300 mb-4" size={40} />
                                <p className="text-slate-500 font-medium">Central Hub SSO is not configured.</p>
                                <p className="text-slate-400 text-sm mt-1">Contact your administrator to enable SSO.</p>
                            </div>
                        )}

                        <footer className="mt-10 text-center">
                            <p className="text-slate-400 font-medium text-sm">
                                Already have a profile?{" "}
                                <Link href="/auth/signin" className="text-orange-500 font-bold hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </footer>
                    </motion.div>
                </div>
            </main>

            <footer className="hidden md:block py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                © 2026 247 Global Business Solutions Ltd. Secure Encryption Enabled.
            </footer>
        </div>
    );
}
