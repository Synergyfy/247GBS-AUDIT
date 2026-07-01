"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    ArrowRight,
    Mail,
    Lock,
    Bot,
    Zap,
    AlertCircle,
    UserPlus,
    Eye,
    EyeOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthActions } from "@/services/auth/useAuthActions";

export default function SignInPage() {
    const router = useRouter();
    const { signIn: contextSignIn } = useAuth();
    const { signIn, isLoading, error: apiError } = useAuthActions();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        if (!email || !password) {
            setLocalError("Please enter your email and password");
            return;
        }

        const { success, role } = await signIn({ email, password });
        if (success) {
            if (role === 'Administrator') {
                router.push("/admin");
            } else {
                router.push("/audit/welcome");
            }
        }
    };

    const displayError = localError || apiError;

    return (
        <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-orange-100">
            {/* Mobile Header - Visible only on mobile */}
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

            {/* Visual Branding Side - Hidden on mobile, beautiful on desktop */}
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

            {/* Form Side - Center focus on mobile */}
            <div className="flex-1 flex flex-col justify-center items-center py-10 md:py-20 px-6 lg:px-20 bg-white md:bg-slate-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[440px] bg-white md:p-12 md:rounded-[3rem] md:shadow-2xl md:shadow-slate-200/50 md:border md:border-slate-100"
                >
                    <header className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Secure Sign In</h2>
                        <p className="text-slate-500 font-medium">Enter your credentials to access the ecosystem.</p>
                    </header>

                    <form onSubmit={handleSignIn} className="space-y-6">
                        {displayError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                            >
                                <AlertCircle size={18} />
                                {displayError}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block ml-1">Work Email</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@company.com"
                                        className="w-full pl-14 pr-6 py-4 md:py-5 bg-slate-50 md:bg-white border-2 border-transparent md:border-slate-100 rounded-2xl md:rounded-[1.5rem] outline-none focus:border-orange-500 focus:bg-white focus:shadow-xl focus:shadow-orange-100/50 transition-all font-bold text-slate-900"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">Security Key</label>
                                    <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors">Forgot Access?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full pl-14 pr-14 py-4 md:py-5 bg-slate-50 md:bg-white border-2 border-transparent md:border-slate-100 rounded-2xl md:rounded-[1.5rem] outline-none focus:border-orange-500 focus:bg-white focus:shadow-xl focus:shadow-orange-100/50 transition-all font-bold text-slate-900"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-bold text-lg md:text-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${isLoading
                                ? "bg-slate-100 text-slate-400 cursor-wait"
                                : "bg-slate-900 text-white hover:bg-black shadow-xl md:shadow-2xl shadow-slate-200 active:scale-[0.98]"
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <footer className="mt-12 text-center">
                        <p className="text-slate-500 font-medium mb-4 text-sm">New to the 247GBS Ecosystem?</p>
                        <Link
                            href="/auth/signup"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-100 rounded-full font-bold text-[10px] uppercase tracking-widest text-slate-900 hover:border-orange-500 hover:text-orange-600 transition-all"
                        >
                            <UserPlus size={14} />
                            Create Account
                        </Link>
                    </footer>
                </motion.div>
            </div>
        </div>
    );
}
