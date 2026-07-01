"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    ArrowRight,
    Mail,
    Lock,
    User,
    Building2,
    CheckCircle2,
    ShieldAlert,
    ArrowLeft,
    Eye,
    EyeOff,
    Briefcase
} from "lucide-react";
import { useAuthActions } from "@/services/auth/useAuthActions";

export default function SignUpPage() {
    const router = useRouter();
    const { signUp, signIn, isLoading, error: apiError } = useAuthActions();
    const [step, setStep] = useState(1);
    
    // Auth State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Business State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [postcode, setPostcode] = useState("");
    const [address, setAddress] = useState("");
    
    const [localError, setLocalError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");
        if (password !== confirmPassword) {
            setLocalError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters.");
            return;
        }
        setStep(2);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        const { success, error } = await signUp({
            email,
            password,
            firstName,
            lastName,
            businessName
        });

        if (success) {
            const { success: signinSuccess } = await signIn({ email, password });
            if (signinSuccess) {
                router.push("/audit/welcome");
            } else {
                router.push("/auth/signin");
            }
        } else {
            setLocalError(error || "Signup failed. Please try again.");
        }
    };

    const displayError = localError || apiError;

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
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step {step} of 2</span>
                        <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <motion.div 
                                className="h-full bg-orange-500"
                                initial={{ width: "50%" }}
                                animate={{ width: step === 1 ? "50%" : "100%" }}
                            />
                        </div>
                    </div>
                </div>
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
                            {step === 1 
                                ? "First, let's secure your access with an authoritative account."
                                : "Now, provide the business context required for the audit engine."}
                        </p>

                        <div className="space-y-4 pt-10">
                            {[
                                "Complete Business Audit Suite",
                                "AI-Powered Strategic Roadmaps",
                                "Specialist Consultation Credits",
                                "London-Local Logistics Support"
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

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-[500px] mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/50 md:border md:border-slate-100"
                    >
                        <header className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                                {step === 1 ? "Create Account" : "Business Details"}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {step === 1 ? "Step 1: Account setup." : "Step 2: Business identification."}
                            </p>
                        </header>

                        {displayError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                            >
                                <ShieldAlert size={18} />
                                {displayError}
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleNext}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block ml-1">Email</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                    <Mail size={18} />
                                                </div>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="john@company.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block ml-1">Password</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                    <Lock size={18} />
                                                </div>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    placeholder="••••••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                    <Lock size={18} />
                                                </div>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    required
                                                    placeholder="••••••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 group shadow-xl shadow-slate-200"
                                    >
                                        Continue to Details
                                        <ArrowRight size={18} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleSignUp}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block ml-1">First Name</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                    <User size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="John"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                                />
                                            </div>
                                        </div>

                                        {firstName.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block ml-1">Last Name</label>
                                                <div className="relative group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                        <User size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Doe"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {lastName.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block ml-1">Business Name</label>
                                                <div className="relative group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                        <Building2 size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Global Solutions Ltd"
                                                        value={businessName}
                                                        onChange={(e) => setBusinessName(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {businessName.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 relative">
                                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block ml-1">Postcode</label>
                                                <div className="relative group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                                        <Briefcase size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. SE15 4PU"
                                                        value={postcode}
                                                        onChange={(e) => {
                                                            const val = e.target.value.toUpperCase();
                                                            setPostcode(val);
                                                            if (val.length >= 5) setAddress("12-14 Business Way, London, " + val);
                                                            else setAddress("");
                                                        }}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm"
                                                    />
                                                </div>

                                                {/* Auto-suggestions for Postcode */}
                                                {postcode.length > 0 && postcode.length < 4 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="absolute z-30 left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 p-2 space-y-1"
                                                    >
                                                        {[
                                                            { code: 'SE15', area: 'Peckham' },
                                                            { code: 'E1', area: 'Shoreditch' },
                                                            { code: 'EC2', area: 'Bishopsgate' },
                                                            { code: 'SW1', area: 'Westminster' },
                                                            { code: 'W1', area: 'Mayfair' },
                                                            { code: 'N1', area: 'Islington' }
                                                        ].filter(p => p.code.startsWith(postcode.toUpperCase())).map(suggestion => (
                                                            <button
                                                                key={suggestion.code}
                                                                type="button"
                                                                onClick={() => {
                                                                    setPostcode(suggestion.code + " ");
                                                                    setAddress("");
                                                                }}
                                                                className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-xl transition-colors flex items-center justify-between group"
                                                            >
                                                                <span className="font-bold text-slate-700 group-hover:text-orange-600">{suggestion.code}</span>
                                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{suggestion.area}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {address && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        Confirmed Address: {address}
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 bg-slate-50 text-slate-500 py-5 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 group shadow-xl shadow-slate-200 disabled:opacity-50"
                                        >
                                            {isLoading ? "Initializing..." : "Create Account"}
                                            <ArrowRight size={18} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

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