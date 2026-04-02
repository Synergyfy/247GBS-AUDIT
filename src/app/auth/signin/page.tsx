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
    UserPlus
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
                router.push("/dashboard");
            }
        }
    };

    const displayError = localError || apiError;

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans selection:bg-orange-100">
            {/* Visual Branding Side */}
            <div className="relative w-full md:w-5/12 bg-slate-900 overflow-hidden flex flex-col justify-center p-12 lg:p-20 text-white">
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Bot size={14} className="text-orange-500" />
                            AI-Enhanced Strategy
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black leading-tight">
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
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Real-time Benchmarking</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Decorative background pulse */}
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center items-center py-20 px-6 lg:px-20 bg-slate-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <header className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Secure Sign In</h2>
                        <p className="text-slate-500 font-medium">Provide your credentials to enter the gateway.</p>
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
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@company.com"
                                        className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-orange-500 focus:shadow-xl focus:shadow-orange-100/50 transition-all font-bold text-slate-900"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Password</label>
                                    <a href="#" className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors">Forgot Access?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-orange-500 focus:shadow-xl focus:shadow-orange-100/50 transition-all font-bold text-slate-900"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${isLoading
                                ? "bg-slate-100 text-slate-400 cursor-wait"
                                : "bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-200 hover:-translate-y-1"
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
                                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <footer className="mt-12 text-center">
                        <p className="text-slate-500 font-medium mb-4">New to 247GBS Ecosystem?</p>
                        <Link
                            href="/auth/signup"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-100 rounded-full font-black text-xs uppercase tracking-widest text-slate-900 hover:border-orange-500 hover:text-orange-600 transition-all"
                        >
                            <UserPlus size={14} />
                            Sign Up
                        </Link>
                    </footer>
                </motion.div>
            </div>
        </div>
    );
}
