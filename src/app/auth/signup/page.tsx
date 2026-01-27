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
    User,
    Building2,
    CheckCircle2,
    ShieldAlert,
    ArrowLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock account creation and sign in
        setTimeout(() => {
            signIn(email);
            router.push("/audit/triage");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100">
            {/* Minimal Header */}
            <header className="h-20 flex items-center justify-between px-6 lg:px-12 bg-white border-b border-slate-100">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                        A
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900">247GBS Audit</span>
                </Link>
                <Link
                    href="/auth/signin"
                    className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-2"
                >
                    Already Registered? <ArrowRight size={16} />
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center py-20 px-6">
                <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side: Value Prop */}
                    <div className="hidden lg:block space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-600">
                            <ShieldCheck size={14} />
                            Membership Protocol
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 leading-tight">
                            Start Your Forensic <span className="text-orange-500">Journey</span> Today.
                        </h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            Join thousands of business owners using our ecological framework to reclaim lost margins.
                        </p>

                        <div className="space-y-4 pt-10">
                            {[
                                "Complete Forensic Audit Suite",
                                "AI-Powered Strategic Roadmaps",
                                "Specialist Consultation Credits",
                                "Seasonal Benchmarking Reports"
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                                >
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-10 lg:p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100"
                    >
                        <header className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Initialize Membership</h2>
                            <p className="text-slate-500 font-medium">Create your authoritative business profile.</p>
                        </header>

                        <form onSubmit={handleSignUp} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">First Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                placeholder="John"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Last Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Doe"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Business Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <Building2 size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Global Corp"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Secure Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••••••"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-200 text-orange-600 focus:ring-orange-500" />
                                    <span className="text-xs text-slate-500 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                                        I agree to the <span className="underline decoration-slate-200">247GBS Ethics Protocol</span> and the usage of my audit data for non-identifiable sector benchmarking.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden ${isLoading
                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-2xl shadow-orange-100"
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-slate-300 border-t-white rounded-full animate-spin" />
                                        <span>Allocating Vault...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Profile</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <ShieldAlert size={20} className="text-slate-400" />
                            <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                                Each profile is subjected to a manual integrity check by our sector specialists.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>

            <footer className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                © 2026 247 Global Business Solutions Ltd. Secure Encryption Enabled.
            </footer>
        </div>
    );
}
