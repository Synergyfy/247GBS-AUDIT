"use client";

import { AuditType } from "@/types/audit";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import {
    ShieldCheck,
    Layers,
    ArrowRight,
    Lock,
    Unlock,
    Cpu,
    ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditSelectionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Vault Protocols...</p>
                </div>
            </div>
        }>
            <AuditSelectionContent />
        </Suspense>
    );
}

function AuditSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Context from URL
    const auditId = searchParams.get("id");
    const triageType = searchParams.get("type") as AuditType | null;
    const sectorId = searchParams.get("sector");
    const hasStock = searchParams.get("stock");
    const hasCapacity = searchParams.get("capacity");

    const [selectedType, setSelectedType] = useState<AuditType | null>(triageType || null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);

    const handleContinue = () => {
        if (!selectedType) return;

        setIsVerifying(true);
        // Visual confirmation delay
        setTimeout(() => {
            setIsVerifying(false);
            setAccessGranted(true);
            
            setTimeout(() => {
                // Route to final flow with all collected context
                router.push(`/audit/flow?id=${auditId}&type=${selectedType}&sector=${sectorId}&stock=${hasStock}&capacity=${hasCapacity}`);
            }, 1200);
        }, 1800);
    };

    return (
        <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col font-sans selection:bg-orange-100">
            {/* Native-Feel Header */}
            <header className="h-16 md:h-24 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.back()}
                        className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-base md:text-xl shadow-lg">A</div>
                        <span className="font-bold text-sm md:text-lg tracking-tight text-slate-900">247GBS Audit</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 border border-slate-100 rounded-lg md:rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Security: High</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center py-10 md:py-20 px-4 max-w-6xl mx-auto w-full">
                
                {/* Triage Recommendation Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 w-full bg-slate-900 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-orange-500 pointer-events-none">
                        <Cpu size={120} />
                    </div>
                    <div className="flex items-center gap-4 md:gap-6 relative z-10">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                            <ShieldCheck size={24} className="md:w-8 md:h-8" />
                        </div>
                        <div>
                            <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-1">System Recommendation</div>
                            <div className="text-lg md:text-2xl font-bold">Priority: <span className="text-orange-500 uppercase">{triageType === 'LONG_FORM' ? 'Critical' : 'Tactical'}</span></div>
                        </div>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-400 max-w-sm md:text-right relative z-10">
                        "Based on your identified waste thresholds, we recommend the <strong>{triageType === 'LONG_FORM' ? 'Full Forensic' : 'Rapid Summary'}</strong> module to stabilize margins."
                    </p>
                </motion.div>

                <header className="text-center mb-10 md:mb-16 px-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Select Audit <span className="text-orange-500">Depth</span></h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm md:text-lg">Confirm the resolution required for your business lifecycle.</p>
                </header>

                <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-12 md:mb-16 w-full">
                    {/* Short Form Card */}
                    <button
                        onClick={() => setSelectedType("SHORT_FORM")}
                        disabled={accessGranted || isVerifying}
                        className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all relative overflow-hidden text-left group ${selectedType === "SHORT_FORM"
                            ? "border-orange-500 bg-white shadow-2xl scale-[1.02] z-10"
                            : "border-slate-100 bg-white hover:border-slate-300 shadow-sm"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors ${selectedType === "SHORT_FORM" ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500"}`}>
                                <Layers size={24} className="md:w-7 md:h-7" />
                            </div>
                            {triageType === "SHORT_FORM" && (
                                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                                    <Cpu size={10} className="md:w-3 md:h-3" />
                                    AI Pick
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">Short Form Audit</h2>
                        <p className="text-slate-500 font-medium mb-6 md:mb-8 text-xs md:text-base leading-relaxed">Rapid 10-minute assessment to identify immediate capacity leakage.</p>

                        <div className="space-y-2 md:space-y-3">
                            {["8-12 Key Questions", "Instant Summary", "Self-Service Only"].map(feat => (
                                <div key={feat} className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-slate-400">
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
                        className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all relative overflow-hidden text-left group ${selectedType === "LONG_FORM"
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02] z-10"
                            : "border-slate-100 bg-white hover:border-slate-300 shadow-sm"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors ${selectedType === "LONG_FORM" ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-900"}`}>
                                <ShieldCheck size={24} className="md:w-7 md:h-7" />
                            </div>
                            {triageType === "LONG_FORM" && (
                                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                                    <Cpu size={10} className="md:w-3 md:h-3" />
                                    AI Pick
                                </div>
                            )}
                        </div>
                        <h2 className={`text-xl md:text-2xl font-bold mb-2 md:mb-3 ${selectedType === 'LONG_FORM' ? 'text-white' : 'text-slate-900'}`}>Long Form Audit</h2>
                        <p className={`font-medium mb-6 md:mb-8 text-xs md:text-base leading-relaxed ${selectedType === 'LONG_FORM' ? 'text-slate-400' : 'text-slate-500'}`}>Deep 45-minute analysis with specialist logic and AI guidance.</p>

                        <div className="space-y-2 md:space-y-3">
                            {["Sector-Specific Logic", "Recovery Roadmap", "AI Assistant"].map(feat => (
                                <div key={feat} className={`flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold ${selectedType === 'LONG_FORM' ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </button>
                </div>

                {/* Final Confirmation UI */}
                <AnimatePresence mode="wait">
                    {selectedType && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center w-full max-w-md"
                        >
                            <div className={`mb-6 md:mb-8 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border w-full flex items-center gap-4 md:gap-6 transition-colors ${accessGranted ? "bg-green-50 border-green-100" : "bg-white border-slate-100"}`}>
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isVerifying ? "bg-slate-100 rotate-180 transition-transform duration-1000" : accessGranted ? "bg-green-500 text-white" : "bg-slate-900 text-white"}`}>
                                    {isVerifying ? <Lock size={20} className="animate-pulse md:w-6 md:h-6" /> : accessGranted ? <Unlock size={20} className="md:w-6 md:h-6" /> : <Lock size={20} className="md:w-6 md:h-6" />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Session Protocol</div>
                                    <div className="font-bold text-slate-900 text-sm md:text-base">
                                        {isVerifying ? "Confirming Session..." : accessGranted ? "Access Granted" : "Ready to Initialize"}
                                    </div>
                                    <div className="text-[8px] md:text-[10px] font-bold text-orange-600 uppercase mt-1">
                                        {accessGranted ? "ID: Verified" : "Module: " + selectedType.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>

                            {!accessGranted && (
                                <button
                                    onClick={handleContinue}
                                    disabled={isVerifying}
                                    className="w-full py-5 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-[2rem] font-bold text-lg md:text-2xl hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 md:gap-4"
                                >
                                    {isVerifying ? "Initializing..." : "Start Audit"}
                                    {!isVerifying && <ArrowRight size={20} className="md:w-6 md:h-6" />}
                                </button>
                            )}

                            {accessGranted && (
                                <div className="flex items-center gap-3 text-green-600 font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm animate-pulse">
                                    Loading Forensic Engine...
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                © 2026 247 Global Business Solutions Ltd. Secure Protocol Active.
            </footer>
        </div>
    );
}
