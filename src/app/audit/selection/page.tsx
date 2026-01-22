"use client";

import { AuditType } from "@/types/audit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    ShieldCheck,
    Layers,
    ArrowRight,
    Lock,
    Unlock,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditSelectionPage() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<AuditType | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);

    const handleContinue = () => {
        if (!selectedType) return;

        setIsVerifying(true);
        // Mocking token validation delay
        setTimeout(() => {
            setIsVerifying(false);
            setAccessGranted(true);
            // Auto-redirect after visual confirmation
            setTimeout(() => {
                router.push(`/audit/sector?type=${selectedType}`);
            }, 1500);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4 selection:bg-orange-100 font-sans">
            <div className="max-w-5xl w-full">

                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                        <ShieldCheck size={14} className="text-orange-500" />
                        Secure Audit Gateway
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Select Audit <span className="text-orange-500">Depth</span></h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">Choose the forensic resolution required for your current business lifecycle.</p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Short Form Card */}
                    <button
                        onClick={() => setSelectedType("SHORT_FORM")}
                        disabled={accessGranted || isVerifying}
                        className={`p-10 rounded-[2.5rem] border-3 text-left transition-all relative overflow-hidden group ${selectedType === "SHORT_FORM"
                            ? "border-orange-500 bg-white shadow-2xl scale-[1.02]"
                            : "border-transparent bg-white hover:border-orange-200 shadow-sm"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedType === "SHORT_FORM" ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500"}`}>
                                <Layers size={28} />
                            </div>
                            {selectedType === "SHORT_FORM" && (
                                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    Active
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">Short Form Audit</h2>
                        <p className="text-slate-500 font-medium mb-8">Rapid 10-minute assessment to identify immediate capacity leakage.</p>

                        <div className="space-y-3">
                            {["8-12 Key Questions", "Instant Automated Summary", "Self-Service Only"].map(feat => (
                                <div key={feat} className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </button>

                    {/* Long Form Card */}
                    <button
                        onClick={() => setSelectedType("LONG_FORM")}
                        disabled={accessGranted || isVerifying}
                        className={`p-10 rounded-[2.5rem] border-3 text-left transition-all relative overflow-hidden group ${selectedType === "LONG_FORM"
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02]"
                            : "border-transparent bg-white hover:border-slate-200 shadow-sm"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedType === "LONG_FORM" ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-900"}`}>
                                <ShieldCheck size={28} />
                            </div>
                            {selectedType === "LONG_FORM" && (
                                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    Forensic
                                </div>
                            )}
                        </div>
                        <h2 className={`text-2xl font-black mb-3 ${selectedType === 'LONG_FORM' ? 'text-white' : 'text-slate-900'}`}>Long Form Audit</h2>
                        <p className={`font-medium mb-8 ${selectedType === 'LONG_FORM' ? 'text-slate-400' : 'text-slate-500'}`}>Deep 45-minute forensic analysis with specialist logic and AI guidance.</p>

                        <div className="space-y-3">
                            {["Sector-Specific Logic", "Strategic Recovery Roadmap", "AI Implementation Assistant"].map(feat => (
                                <div key={feat} className={`flex items-center gap-3 text-xs font-bold ${selectedType === 'LONG_FORM' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </button>
                </div>

                {/* Token Access UI */}
                <AnimatePresence mode="wait">
                    {selectedType && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center"
                        >
                            <div className={`mb-8 p-6 rounded-[2rem] border w-full max-w-md flex items-center gap-6 transition-colors ${accessGranted ? "bg-green-50 border-green-100" : "bg-white border-slate-100"}`}>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isVerifying ? "bg-slate-100 rotate-180 transition-transform duration-1000" : accessGranted ? "bg-green-500 text-white" : "bg-slate-900 text-white"}`}>
                                    {isVerifying ? <Lock size={24} className="animate-pulse" /> : accessGranted ? <Unlock size={24} /> : <Lock size={24} />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vault Membership Check</div>
                                    <div className="font-black text-slate-900">
                                        {isVerifying ? "Verifying Token Balance..." : accessGranted ? "Access Granted: Directory Token" : "Requirement: 1 Audit Token"}
                                    </div>
                                    <div className="text-[10px] font-bold text-orange-600 uppercase mt-1">
                                        {accessGranted ? "Member ID: Verified" : "Membership Level: Bronze"}
                                    </div>
                                </div>
                            </div>

                            {!accessGranted && (
                                <button
                                    onClick={handleContinue}
                                    disabled={isVerifying}
                                    className="px-16 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl hover:bg-black shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4"
                                >
                                    {isVerifying ? "Verifying..." : "Initialize Session"}
                                    {!isVerifying && <ArrowRight size={24} />}
                                </button>
                            )}

                            {accessGranted && (
                                <div className="flex items-center gap-3 text-green-600 font-black uppercase tracking-[0.2em] text-sm italic">
                                    Redirecting to Sector Selection...
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
