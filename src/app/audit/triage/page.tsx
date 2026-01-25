"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    Package,
    Clock,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    Zap,
    TrendingDown,
    Activity,
    Lock,
    Cpu,
    Briefcase,
    EyeOff,
    HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { TriageData, TriageStageId } from "@/types/audit";

export default function AuditTriagePage() {
    const router = useRouter();
    const [stage, setStage] = useState<TriageStageId>('stock-awareness');
    const [data, setData] = useState<TriageData>({});
    const [loading, setLoading] = useState(false);

    const updateData = (updates: Partial<TriageData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const nextStage = () => {
        switch (stage) {
            case 'stock-awareness':
                if (data.hasExcessStock === 'no') setStage('capacity-awareness');
                else setStage('stock-extent');
                break;
            case 'stock-extent':
                if ((data.stockExtent || 0) >= 7) setStage('stock-impact');
                else setStage('capacity-awareness');
                break;
            case 'stock-impact':
                setStage('capacity-awareness');
                break;
            case 'capacity-awareness':
                if (data.hasSpareCapacity === 'no') setStage('validation');
                else setStage('capacity-extent');
                break;
            case 'capacity-extent':
                if ((data.capacityExtent || 0) >= 7) setStage('capacity-impact');
                else setStage('validation');
                break;
            case 'capacity-impact':
                setStage('validation');
                break;
            case 'validation':
                setStage('financials');
                break;
            case 'financials':
                setStage('decision');
                break;
            case 'decision':
                setStage('readiness');
                break;
            case 'readiness':
                handleFinalRedirect();
                break;
        }
    };

    const prevStage = () => {
        // Simple back logic for now
        const stageOrder: TriageStageId[] = [
            'stock-awareness', 'stock-extent', 'stock-impact',
            'capacity-awareness', 'capacity-extent', 'capacity-impact',
            'validation', 'financials', 'decision', 'readiness'
        ];
        const idx = stageOrder.indexOf(stage);
        if (idx > 0) setStage(stageOrder[idx - 1]);
    };

    // Calculate Decision Engine Result
    const decision = useMemo(() => {
        const stock = data.stockExtent || 0;
        const capacity = data.capacityExtent || 0;
        const impactSerious = data.stockImpact === 'serious' || data.capacityImpact === 'serious';

        if (stock >= 31 || (stock >= 16 && impactSerious)) return 'CRITICAL';
        if (stock >= 16 || capacity >= 16 || impactSerious) return 'FULL_AUDIT';
        if (stock >= 7 || capacity >= 7) return 'PARTIAL_AUDIT';
        return 'NO_AUDIT';
    }, [data]);

    const handleFinalRedirect = () => {
        setLoading(true);
        setTimeout(() => {
            if (decision === 'NO_AUDIT') {
                router.push('/dashboard');
            } else {
                const type = (decision === 'CRITICAL' || decision === 'FULL_AUDIT') ? 'LONG_FORM' : 'SHORT_FORM';
                const hasStock = (data.stockExtent || 0) >= 7 || data.hasExcessStock === 'yes' ? 'true' : 'false';
                const hasCapacity = (data.capacityExtent || 0) >= 7 || data.hasSpareCapacity === 'yes' ? 'true' : 'false';

                // Redirect directly to sector selection, bypassing the manual selection page
                router.push(`/audit/sector?type=${type}&priority=${decision}&stock=${hasStock}&capacity=${hasCapacity}`);
            }
        }, 2000);
    };

    // Progress Calculation
    const progress = useMemo(() => {
        const stages: TriageStageId[] = ['stock-awareness', 'capacity-awareness', 'validation', 'financials', 'decision', 'readiness'];
        const idx = stages.indexOf(stage);
        return ((idx + 1) / stages.length) * 100;
    }, [stage]);

    // Validation for "Next" button
    const isStepValid = useMemo(() => {
        switch (stage) {
            case 'stock-awareness': return !!data.hasExcessStock;
            case 'stock-extent': return true; // Slider defaults to 0
            case 'stock-impact': return !!data.stockImpact;
            case 'capacity-awareness': return !!data.hasSpareCapacity;
            case 'capacity-extent': return true; // Slider defaults to 0
            case 'capacity-impact': return !!data.capacityImpact;
            case 'validation': return !!data.confidenceStock;
            case 'financials': return !!data.monthlyTurnover && !!data.stockValue;
            case 'decision': return true;
            case 'readiness': return !!data.isReady;
            default: return true;
        }
    }, [stage, data]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 flex flex-col">
            {/* Header / Progress Bar */}
            <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-200">
                        A
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight text-slate-900">247GBS Audit</span>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forensic Triage Protocol</div>
                    </div>
                </div>

                <div className="flex-1 max-w-2xl mx-12 hidden md:block">
                    <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">System Diagnostic Status</span>
                        <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node: Active</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200 rounded-full blur-[120px]" />
                </div>

                <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 relative z-10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    {/* Left Panel: Contextual Helper */}
                    <div className="w-full md:w-[350px] bg-slate-900 p-10 flex flex-col justify-between text-white relative">
                        <div className="absolute top-0 right-0 p-10 opacity-5 text-orange-500">
                            <Cpu size={120} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 italic">Diagnostic Aid</h3>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={stage}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <HelperContent stage={stage} data={data} />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="pt-10 border-t border-white/5 relative z-10">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                Our decision engine uses the **Henry Model** to determine the necessity and depth of your audit.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Questions */}
                    <div className="flex-1 p-10 lg:p-14 flex flex-col justify-between relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={stage}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="flex-1 flex flex-col"
                            >
                                <StageContent stage={stage} data={data} updateData={updateData} next={nextStage} />
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-12 flex justify-between items-center border-t border-slate-50 pt-8">
                            <button
                                onClick={prevStage}
                                disabled={stage === 'stock-awareness'}
                                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>

                            {/* Skip functionality mentioned in Stage 1/2 */}
                            <button
                                onClick={nextStage}
                                disabled={!isStepValid}
                                className={`px-10 py-5 rounded-2xl font-black text-sm flex items-center gap-3 transition-all active:scale-95 group ${isStepValid
                                    ? "bg-slate-900 text-white shadow-xl hover:bg-black hover:-translate-y-1"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                    }`}
                            >
                                {stage === 'readiness' ? 'Complete Triage' : 'Continue Diagnostic'}
                                <ChevronRight size={18} className={`transition-transform ${isStepValid ? "text-orange-500 group-hover:translate-x-1" : "text-slate-400"}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Processing Modal */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6"
                    >
                        <div className="max-w-md w-full text-center space-y-8">
                            <div className="relative">
                                <motion.div
                                    className="w-24 h-24 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cpu size={32} className="text-orange-500 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-white text-3xl font-black mb-4 tracking-tight">Simulating Forensic Depth</h2>
                                <p className="text-slate-400 font-medium italic">Assigning required audit protocols based on identified waste thresholds...</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function HelperContent({ stage, data }: { stage: TriageStageId, data: TriageData }) {
    if (stage.startsWith('stock')) {
        return (
            <>
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <Package size={24} />
                </div>
                <div>
                    <h4 className="text-xl font-black text-white mb-2">Stage 1: Excess Stock</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Excess inventory isn't just space—it's **trapped liquidity**. We need to determine if your leak is significant enough for a full forensic deep-dive.
                    </p>
                </div>
            </>
        );
    }
    if (stage.startsWith('capacity')) {
        return (
            <>
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <Clock size={24} />
                </div>
                <div>
                    <h4 className="text-xl font-black text-white mb-2">Stage 2: Spare Capacity</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Unused hours, empty seats, or idle machinery are **guaranteed losses**. We analyze these 'time-sensitive' assets to define your recovery potential.
                    </p>
                </div>
            </>
        );
    }
    if (stage === 'validation') {
        return (
            <>
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="text-xl font-black text-white mb-2">Stage 3: Validation</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Precision matters. We cross-verify your confidence levels to decide if the AI should ask clarifying forensic questions.
                    </p>
                </div>
            </>
        );
    }
    // Add more cases...
    return (
        <>
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                <Activity size={24} />
            </div>
            <div>
                <h4 className="text-xl font-black text-white mb-2">Strategic Mapping</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Finalizing the financial context to convert operational waste into a hard currency roadmap.
                </p>
            </div>
        </>
    );
}

function StageContent({
    stage,
    data,
    updateData,
    next
}: {
    stage: TriageStageId,
    data: TriageData,
    updateData: (u: Partial<TriageData>) => void,
    next: () => void
}) {
    switch (stage) {
        case 'stock-awareness':
            return (
                <div className="space-y-10 py-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Stock awareness screening</h2>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Do you believe your business currently has excess or slow-moving stock?
                        </p>
                    </div>
                    <div className="grid gap-4">
                        {[
                            { id: 'yes', label: 'Yes, definitely', icon: CheckCircle2, sub: 'I have identified specific items or ranges.' },
                            { id: 'not-sure', label: 'Not sure', icon: AlertCircle, sub: 'I suspect there is a leak but haven\'t measured it.' },
                            { id: 'no', label: 'No, my stock is lean', icon: TrendingUp, sub: 'I move inventory as fast as I get it.' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { updateData({ hasExcessStock: opt.id as any }); next(); }}
                                className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left group ${data.hasExcessStock === opt.id
                                    ? "bg-orange-50 border-orange-500"
                                    : "bg-white border-slate-100 hover:border-slate-300"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${data.hasExcessStock === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                    }`}>
                                    <opt.icon size={24} />
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 text-lg">{opt.label}</div>
                                    <div className="text-sm text-slate-400 font-medium italic">{opt.sub}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'stock-extent':
            return (
                <div className="space-y-12 py-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Quantifying the Leak</h2>
                        <p className="text-slate-500 text-lg font-medium">
                            What do you estimate is the extent of your excess or unsold stock?
                        </p>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-12">
                        <div className="text-center">
                            <span className="text-7xl font-black text-slate-900 italic">{data.stockExtent || 0}%</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mt-4">Calculated Extent</p>
                        </div>

                        <div className="relative pt-10">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                                value={data.stockExtent || 0}
                                onChange={(e) => updateData({ stockExtent: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-between mt-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Minimum Leak</span>
                                <span>High Priority Leak</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-500 leading-relaxed italic">
                            <Zap size={20} className="text-orange-500 shrink-0" />
                            Include slow-moving, old, damaged, or unsold items that have been on shelves for &gt; 60 days.
                        </div>
                    </div>
                </div>
            );

        case 'stock-impact':
            return (
                <div className="space-y-10 py-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Operational Friction</h2>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Is this excess stock affecting your cash flow or storage space?
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 'serious', label: 'Yes, seriously', sub: 'It is a major bottleneck.' },
                            { id: 'little', label: 'Yes, a little', sub: 'Moderate pressure applied.' },
                            { id: 'not-yet', label: 'Not yet', sub: 'Low priority currently.' },
                            { id: 'not-sure', label: 'Not sure', sub: 'Need measurement.' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { updateData({ stockImpact: opt.id as any }); next(); }}
                                className={`flex flex-col gap-4 p-8 rounded-3xl border-2 transition-all text-left ${data.stockImpact === opt.id
                                    ? "bg-slate-900 border-slate-900 text-white"
                                    : "bg-white border-slate-100 hover:border-slate-300"
                                    }`}
                            >
                                <div className="font-black text-xl">{opt.label}</div>
                                <div className={`text-sm font-medium italic ${data.stockImpact === opt.id ? "text-slate-400" : "text-slate-400"}`}>{opt.sub}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'capacity-awareness':
            return (
                <div className="space-y-10 py-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Spare Capacity Screening</h2>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Do you believe your business has unused staff time, equipment, or space?
                        </p>
                    </div>
                    <div className="grid gap-4">
                        {[
                            { id: 'yes', label: 'Yes, absolutely', icon: Clock },
                            { id: 'not-sure', label: 'Not sure / Suspicious', icon: AlertCircle },
                            { id: 'no', label: 'Maximum Utilization', icon: TrendingUp }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { updateData({ hasSpareCapacity: opt.id as any }); next(); }}
                                className={`flex items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all text-left group ${data.hasSpareCapacity === opt.id
                                    ? "bg-orange-50 border-orange-500"
                                    : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${data.hasSpareCapacity === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                    }`}>
                                    <opt.icon size={28} />
                                </div>
                                <div className="font-black text-slate-900 text-xl">{opt.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'capacity-extent':
            return (
                <div className="space-y-12 py-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Unused Potential</h2>
                        <p className="text-slate-500 text-lg font-medium">
                            What percentage of your available capacity do you think is currently unused?
                        </p>
                    </div>

                    <div className="bg-slate-900 p-10 py-16 rounded-[3rem] space-y-12 text-white">
                        <div className="text-center">
                            <span className="text-8xl font-black italic">{data.capacityExtent || 0}%</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mt-4 italic">Efficiency Gap Identified</p>
                        </div>

                        <div className="relative pt-10 px-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
                                value={data.capacityExtent || 0}
                                onChange={(e) => updateData({ capacityExtent: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-between mt-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>Optimization Range</span>
                                <span className="text-orange-500">Forensic Threshold</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-4 text-xs font-bold text-slate-400 leading-relaxed italic">
                            <CheckCircle2 size={20} className="text-orange-500 shrink-0" />
                            Include idle staff, empty seats/rooms, idle machines, and quiet trading windows.
                        </div>
                    </div>
                </div>
            );

        case 'capacity-impact':
            return (
                <div className="space-y-10 py-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Wasted Momentum</h2>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Is this unused capacity costing you money?
                        </p>
                    </div>
                    <div className="grid gap-4">
                        {[
                            { id: 'serious', label: 'Yes, clearly costing us prime profit', icon: TrendingDown },
                            { id: 'little', label: 'Possibly, but manageable', icon: Activity },
                            { id: 'not-yet', label: 'Not currently a financial drag', icon: Briefcase }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { updateData({ capacityImpact: opt.id as any }); next(); }}
                                className={`flex items-center gap-6 p-8 rounded-3xl border-2 transition-all text-left group ${data.capacityImpact === opt.id
                                    ? "bg-orange-5050 border-orange-500 shadow-xl"
                                    : "bg-white border-slate-100 hover:border-slate-300"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${data.capacityImpact === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400"
                                    }`}>
                                    <opt.icon size={22} />
                                </div>
                                <div className="font-black text-slate-900 text-lg">{opt.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'validation':
            return (
                <div className="space-y-12 py-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Forensic Validation</h2>
                        <p className="text-slate-500 text-lg font-medium">
                            How confident are you in the accuracy of your diagnostic estimates?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                        {[
                            { id: 'very', label: 'Scientific', icon: CheckCircle2, tooltip: 'Based on hard data, logs, or recent stocktakes.' },
                            { id: 'fairly', label: 'Guesstimate', icon: Activity, tooltip: 'An educated guess based on daily observations.' },
                            { id: 'guessing', label: 'Blind Spot', icon: EyeOff, tooltip: 'Suspicion of waste without clear visibility.' },
                            { id: 'not-sure', label: 'No Data', icon: HelpCircle, tooltip: 'Complete uncertainty regarding this metric.' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => updateData({ confidenceStock: opt.id as any })}
                                className={`relative group p-8 rounded-[2rem] border-2 transition-all text-left flex items-start gap-6 ${data.confidenceStock === opt.id
                                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]"
                                    : "bg-white border-slate-100 hover:border-orange-500 hover:shadow-xl"
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${data.confidenceStock === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500"
                                    }`}>
                                    <opt.icon size={28} />
                                </div>
                                <div className="space-y-1">
                                    <div className="font-black text-xl tracking-tight">{opt.label}</div>
                                    <div className={`text-sm font-medium italic ${data.confidenceStock === opt.id ? "text-slate-400" : "text-slate-400"}`}>
                                        Confidence: {opt.id === 'very' ? 'High' : opt.id === 'fairly' ? 'Medium' : 'Low'}
                                    </div>
                                </div>

                                {/* Custom Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-20 text-center">
                                    <div className="relative">
                                        {opt.tooltip}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 mt-1" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'financials':
            return (
                <div className="space-y-10 py-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Financial Reality Check</h2>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Convert operational leaks into financial recovery targets.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Average Monthly Turnover</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'under10k', label: 'Under £10k' },
                                    { id: '10k-50k', label: '£10k – £50k' },
                                    { id: '50k-100k', label: '£50k – £100k' },
                                    { id: '100k+', label: '£100k+' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => updateData({ monthlyTurnover: opt.id as any })}
                                        className={`py-5 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${data.monthlyTurnover === opt.id ? "bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-100" : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Approximate Stock Value</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'under5k', label: 'Under £5k' },
                                    { id: '5k-20k', label: '£5k – £20k' },
                                    { id: '20k-50k', label: '£20k – £50k' },
                                    { id: '50k+', label: '£50k+' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => updateData({ stockValue: opt.id as any })}
                                        className={`py-5 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${data.stockValue === opt.id ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'decision':
            const stock = data.stockExtent || 0;
            const capacity = data.capacityExtent || 0;
            const isCritical = stock >= 31 || capacity >= 31;
            const isHigh = stock >= 16 || capacity >= 16;
            const isPartial = stock >= 7 || capacity >= 7;

            return (
                <div className="space-y-10 py-10 flex-1 flex flex-col justify-center">
                    <div className="text-center space-y-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${isCritical ? "bg-red-50 text-red-600 border border-red-100" :
                            isHigh ? "bg-orange-50 text-orange-600 border border-orange-100" :
                                isPartial ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    "bg-green-50 text-green-600 border border-green-100"
                            }`}>
                            <Activity size={14} />
                            Diagnosis: {isCritical ? "Critical Over-Capacity" : isHigh ? "Forensic Priority" : isPartial ? "Tactical Recovery" : "Status Stable"}
                        </div>
                        <h3 className="text-4xl font-black text-slate-900">Decision Engine Result</h3>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900 group-hover:scale-110 transition-transform">
                            <Cpu size={120} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h4 className="text-xl font-black text-slate-900 leading-tight">
                                {isCritical || isHigh ? (
                                    <>Based on your <span className="text-orange-500 italic decoration-slate-200 underline underline-offset-8">Forensic Diagnostic</span>, your business requires a **Full High-Depth Audit** to recover projected losses.</>
                                ) : isPartial ? (
                                    <>Your leak thresholds are moderate. We recommend a **Short-Form Operational Audit** to stabilize margins.</>
                                ) : (
                                    <>You currently do not meet the minimum thresholds for a full audit. We suggest a **Monitoring Cycle** instead.</>
                                )}
                            </h4>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-black">
                                        !
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recovery potential</div>
                                    <div className="text-sm font-black text-slate-900 italic">Significant</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'readiness':
            return (
                <div className="space-y-12 py-10 flex-1 flex flex-col justify-center">
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-orange-500/10">
                            <ShieldCheck size={40} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-slate-900">Final Recommendation Gate</h2>
                            <p className="text-slate-500 text-lg font-medium mt-4">
                                Scientific audits require a commitment to operational change. Are you prepared to take action on the results?
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'yes', label: 'Yes, I am ready', icon: Zap, color: 'orange' },
                            { id: 'maybe', label: 'Possibly', icon: Activity, color: 'slate' },
                            { id: 'not-yet', label: 'Not Yet', icon: Lock, color: 'slate' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => updateData({ isReady: opt.id as any })}
                                className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all ${data.isReady === opt.id
                                    ? `bg-slate-900 border-slate-900 text-white scale-105 shadow-2xl`
                                    : "bg-white border-slate-100 hover:border-slate-200"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.isReady === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400"
                                    }`}>
                                    <opt.icon size={24} />
                                </div>
                                <span className="font-black text-sm uppercase tracking-widest">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );

        default:
            return <div>Flow Logic Incomplete. Please contact Node Administrator.</div>;
    }
}
