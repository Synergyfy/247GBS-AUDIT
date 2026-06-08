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
    HelpCircle,
    ShieldAlert,
    User,
    Mail,
    Building2,
    Eye,
    Zap as ActivityIcon // Fallback for stage icons
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
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
        const stageOrder: TriageStageId[] = [
            'stock-awareness', 'stock-extent', 'stock-impact',
            'capacity-awareness', 'capacity-extent', 'capacity-impact',
            'validation', 'financials', 'decision', 'readiness'
        ];
        const idx = stageOrder.indexOf(stage);
        if (idx > 0) setStage(stageOrder[idx - 1]);
    };

    const handleFinalRedirect = async () => {
        setLoading(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
            const headers: Record<string, string> = { 
                "Content-Type": "application/json",
                "Accept": "application/json" 
            };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            let res = await fetch(`${API_BASE_URL}/triage`, {
                method: "POST",
                headers,
                body: JSON.stringify(data)
            });

            if (res.status === 401) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    headers["Authorization"] = `Bearer ${newToken}`;
                    res = await fetch(`${API_BASE_URL}/triage`, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(data)
                    });
                }
            }

            if (!res.ok) {
                throw new Error("Failed to submit triage data.");
            }

            const responseData = await res.json();
            
            if (responseData.decision === 'NO_AUDIT') {
                setStage('healthy');
            } else {
                const type = responseData.auditType;
                const sectorId = searchParams.get("sector") || data.sectorId;
                const hasStock = (data.stockExtent || 0) >= 7 || data.hasExcessStock === 'yes' ? 'true' : 'false';
                const hasCapacity = (data.capacityExtent || 0) >= 7 || data.hasSpareCapacity === 'yes' ? 'true' : 'false';

                // Now redirecting to selection page to let user pick thier depth based on triage result
                router.push(`/audit/selection?id=${responseData.auditSessionId}&type=${type}&sector=${sectorId}&stock=${hasStock}&capacity=${hasCapacity}`);
            }
        } catch (error) {
            console.error("Triage submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    const progress = useMemo(() => {
        const stages: TriageStageId[] = ['stock-awareness', 'capacity-awareness', 'validation', 'financials', 'decision', 'readiness'];
        const idx = stages.indexOf(stage);
        return ((idx + 1) / stages.length) * 100;
    }, [stage]);

    const isStepValid = useMemo(() => {
        switch (stage) {
            case 'stock-awareness': return !!data.hasExcessStock;
            case 'stock-extent': return true;
            case 'stock-impact': return !!data.stockImpact;
            case 'capacity-awareness': return !!data.hasSpareCapacity;
            case 'capacity-extent': return true;
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
            <header className="h-16 md:h-24 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shadow-slate-200">
                        A
                    </div>
                    <div>
                        <span className="font-bold text-sm md:text-lg tracking-tight text-slate-900 leading-none">247GBS Audit</span>
                        <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mt-0.5">Business Check</div>
                    </div>
                </div>

                <div className="flex-1 max-w-2xl mx-4 md:mx-12">
                    <div className="flex justify-between mb-1.5 md:mb-2">
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Progress Status</span>
                        <span className="text-[8px] md:text-[10px] font-bold text-slate-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1 md:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                    <div className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 border border-slate-100 rounded-lg md:rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Node: Active</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-start md:items-center justify-center p-4 md:p-6 lg:p-12 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-orange-200 rounded-full blur-[80px] md:blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-slate-200 rounded-full blur-[80px] md:blur-[120px]" />
                </div>

                <div className="w-full max-w-4xl bg-white rounded-3xl md:rounded-[3rem] shadow-2xl shadow-slate-200/50 border md:border border-slate-50 relative z-10 overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[600px]">
                    <div className="w-full md:w-[320px] bg-slate-900 pt-8 pb-6 px-6 md:p-10 flex flex-col justify-between text-white relative">
                        <div className="absolute top-0 right-0 p-6 md:p-10 opacity-5 text-orange-500">
                            <Cpu size={80} className="md:w-[120px] md:h-[120px]" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4 md:mb-8 ">Help Guide</h3>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={stage}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4 md:space-y-6"
                                >
                                    <HelperContent stage={stage} data={data} />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="hidden md:block pt-10 border-t border-white/5 relative z-10">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                Our decision engine uses the **Henry Model** to determine the necessity and depth of your audit.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 p-6 md:p-10 lg:p-14 flex flex-col justify-between relative bg-white rounded-t-[2rem] md:rounded-none -mt-6 md:mt-0 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] md:shadow-none">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={stage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 flex flex-col"
                            >
                                <StageContent stage={stage} data={data} updateData={updateData} next={nextStage} />
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-8 md:mt-12 flex justify-between items-center border-t border-slate-50 pt-6 md:pt-8">
                            {stage !== 'healthy' && (
                                <button
                                    onClick={prevStage}
                                    disabled={stage === 'stock-awareness'}
                                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={14} className="md:w-[16px] md:h-[16px]" />
                                    Back
                                </button>
                            )}
                            
                            {stage === 'healthy' ? (
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-6 py-4 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 md:gap-3 transition-all active:scale-95 group bg-slate-900 text-white shadow-xl hover:bg-black hover:-translate-y-1 ml-auto"
                                >
                                    Return to Dashboard
                                    <ChevronRight size={16} className="md:w-[18px] md:h-[18px] transition-transform text-orange-500 group-hover:translate-x-1" />
                                </button>
                            ) : (
                                <button
                                    onClick={nextStage}
                                    disabled={!isStepValid}
                                    className={`px-6 py-4 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 md:gap-3 transition-all active:scale-95 group ${isStepValid
                                        ? "bg-slate-900 text-white shadow-xl hover:bg-black hover:-translate-y-1"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        }`}
                                >
                                    {stage === 'readiness' ? 'Complete Check' : 'Continue'}
                                    <ChevronRight size={16} className={`md:w-[18px] md:h-[18px] transition-transform ${isStepValid ? "text-orange-500 group-hover:translate-x-1" : "text-slate-400"}`} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

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
                                <h2 className="text-white text-3xl font-bold mb-4 tracking-tight">Simulating Audit Depth</h2>
                                <p className="text-slate-400 font-medium ">Assigning required audit protocols based on identified waste thresholds...</p>
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
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                        <Package size={20} className="md:w-[24px] md:h-[24px]" />
                    </div>
                    <h4 className="text-base md:text-xl font-bold text-white leading-tight">Stage 1: Excess Stock</h4>
                </div>
                <div>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Excess inventory isn't just space—it's <strong className="text-slate-200">trapped liquidity</strong>. We need to determine if your leak is significant.
                    </p>
                </div>
            </div>
        );
    }
    if (stage.startsWith('capacity')) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                        <Clock size={20} className="md:w-[24px] md:h-[24px]" />
                    </div>
                    <h4 className="text-base md:text-xl font-bold text-white leading-tight">Stage 2: Spare Capacity</h4>
                </div>
                <div>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Unused hours or empty seats are <strong className="text-slate-200">guaranteed losses</strong>. We analyze these assets to define recovery potential.
                    </p>
                </div>
            </div>
        );
    }
    if (stage === 'validation') {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} className="md:w-[24px] md:h-[24px]" />
                    </div>
                    <h4 className="text-base md:text-xl font-bold text-white leading-tight">Stage 3: Validation</h4>
                </div>
                <div>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Precision matters. We cross-verify your confidence levels to decide if AI should ask clarifying questions.
                    </p>
                </div>
            </div>
        );
    }
    if (stage === 'healthy') {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shrink-0">
                        <CheckCircle2 size={20} className="md:w-[24px] md:h-[24px]" />
                    </div>
                    <h4 className="text-base md:text-xl font-bold text-white leading-tight">Check Complete</h4>
                </div>
                <div>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Your efficiency metrics indicate a highly stable operation. No further audit allocation recommended.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                    <Activity size={20} className="md:w-[24px] md:h-[24px]" />
                </div>
                <h4 className="text-base md:text-xl font-bold text-white leading-tight">Strategic Mapping</h4>
            </div>
            <div>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    Finalizing the financial context to convert operational waste into a hard currency roadmap.
                </p>
            </div>
        </div>
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
                <div className="space-y-6 md:space-y-10 py-4 md:py-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">Stock awareness screening</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
                            Do you believe your business currently has excess or slow-moving stock?
                        </p>
                    </div>
                    <div className="grid gap-3 md:gap-4">
                        {[
                            { id: 'yes', label: 'Yes, definitely', icon: CheckCircle2, sub: 'I have identified specific items or ranges.' },
                            { id: 'not-sure', label: 'Not sure', icon: AlertCircle, sub: 'I suspect there is a leak but haven\'t measured it.' },
                            { id: 'no', label: 'No, my stock is lean', icon: TrendingUp, sub: 'I move inventory as fast as I get it.' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { updateData({ hasExcessStock: opt.id as any }); next(); }}
                                className={`flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all text-left group ${data.hasExcessStock === opt.id
                                    ? "bg-orange-50 border-orange-500"
                                    : "bg-white border-slate-100 hover:border-slate-300"
                                    }`}
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${data.hasExcessStock === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                    }`}>
                                    <opt.icon size={20} className="md:w-[24px] md:h-[24px]" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-base md:text-lg leading-tight">{opt.label}</div>
                                    <div className="text-[10px] md:text-sm text-slate-400 font-medium mt-0.5">{opt.sub}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'stock-extent':
            return (
                <div className="space-y-8 md:space-y-12 py-4 md:py-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">Quantifying the Leak</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium">
                            What do you estimate is the extent of your excess or unsold stock?
                        </p>
                    </div>

                    <div className="bg-slate-50 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] space-y-8 md:space-y-12">
                        <div className="text-center">
                            <span className="text-5xl md:text-7xl font-bold text-slate-900 ">{data.stockExtent || 0}%</span>
                            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mt-2 md:mt-4">Calculated Extent</p>
                        </div>

                        <div className="relative pt-6 md:pt-10">
                            <motion.div
                                className="absolute -top-2 left-0 w-full flex justify-center pointer-events-none"
                                animate={{ x: [0, 20, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-orange-500/50 bg-white/50 px-2 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-sm">
                                    <ChevronLeft size={8} className="md:w-[10px] md:h-[10px]" />
                                    Slide to adjust
                                    <ChevronRight size={8} className="md:w-[10px] md:h-[10px]" />
                                </div>
                            </motion.div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                className="w-full h-2 md:h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500 hover:h-4 transition-all"
                                value={data.stockExtent || 0}
                                onChange={(e) => updateData({ stockExtent: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-between mt-3 md:mt-4 px-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <span>Minimum Leak</span>
                                <span>High Priority Leak</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-slate-500 leading-relaxed ">
                            <Zap size={16} className="text-orange-500 shrink-0 md:w-[20px] md:h-[20px]" />
                            Include items unsold for &gt; 60 days.
                        </div>
                    </div>
                </div>
            );

        case 'stock-impact':
            return (
                <div className="space-y-6 md:space-y-10 py-4 md:py-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">Operational Friction</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
                            Is this excess stock affecting your cash flow or storage space?
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {[
                            { id: 'serious', label: 'Yes, seriously', sub: 'It is a major bottleneck.' },
                            { id: 'little', label: 'Yes, a little', sub: 'Moderate pressure applied.' },
                            { id: 'not-yet', label: 'Not yet', sub: 'Low priority currently.' },
                            { id: 'not-sure', label: 'Not sure', sub: 'Need measurement.' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { updateData({ stockImpact: opt.id as any }); next(); }}
                                className={`flex flex-col gap-2 md:gap-4 p-5 md:p-8 rounded-2xl md:rounded-3xl border-2 transition-all text-left ${data.stockImpact === opt.id
                                    ? "bg-slate-900 border-slate-900 text-white shadow-xl"
                                    : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                                    }`}
                            >
                                <div className="font-bold text-base md:text-xl leading-tight">{opt.label}</div>
                                <div className={`text-[10px] md:text-sm font-medium ${data.stockImpact === opt.id ? "text-slate-400" : "text-slate-400"}`}>{opt.sub}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'capacity-awareness':
            return (
                <div className="space-y-6 md:space-y-10 py-4 md:py-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">Spare Capacity Screening</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
                            Do you believe your business has unused staff time, equipment, or space?
                        </p>
                    </div>
                    <div className="grid gap-3 md:gap-4">
                        {[
                            { id: 'yes', label: 'Yes, absolutely', icon: Clock },
                            { id: 'not-sure', label: 'Not sure / Suspicious', icon: AlertCircle },
                            { id: 'no', label: 'Maximum Utilization', icon: TrendingUp }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { updateData({ hasSpareCapacity: opt.id as any }); next(); }}
                                className={`flex items-center gap-4 md:gap-6 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 transition-all text-left group ${data.hasSpareCapacity === opt.id
                                    ? "bg-orange-50 border-orange-500"
                                    : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                                    }`}
                            >
                                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${data.hasSpareCapacity === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                    }`}>
                                    <opt.icon size={20} className="md:w-[28px] md:h-[28px]" />
                                </div>
                                <div className="font-bold text-slate-900 text-base md:text-xl leading-tight">{opt.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'capacity-extent':
            return (
                <div className="space-y-8 md:space-y-12 py-4 md:py-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">Unused Potential</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium">
                            What percentage of your available capacity is unused?
                        </p>
                    </div>

                    <div className="bg-slate-900 p-6 md:p-10 py-10 md:py-16 rounded-2xl md:rounded-[3rem] space-y-8 md:space-y-12 text-white">
                        <div className="text-center">
                            <span className="text-6xl md:text-8xl font-bold ">{data.capacityExtent || 0}%</span>
                            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-orange-500 mt-2 md:mt-4 ">Efficiency Gap Identified</p>
                        </div>

                        <div className="relative pt-6 md:pt-10 px-2 md:px-4">
                            <motion.div
                                className="absolute -top-2 left-0 w-full flex justify-center pointer-events-none"
                                animate={{ x: [0, -20, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-white/10 px-2 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                                    <ChevronLeft size={8} className="md:w-[10px] md:h-[10px]" />
                                    Slide to adjust
                                    <ChevronRight size={8} className="md:w-[10px] md:h-[10px]" />
                                </div>
                            </motion.div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                className="w-full h-2 md:h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500 hover:bg-white/20 transition-all"
                                value={data.capacityExtent || 0}
                                onChange={(e) => updateData({ capacityExtent: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-between mt-4 md:mt-6 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span>Optimization</span>
                                <span className="text-orange-500">Threshold</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-slate-400 leading-relaxed ">
                            <CheckCircle2 size={16} className="text-orange-500 shrink-0 md:w-[20px] md:h-[20px]" />
                            Include idle staff, machines, and quiet windows.
                        </div>
                    </div>
                </div>
            );

        case 'capacity-impact':
            return (
                <div className="space-y-6 md:space-y-10 py-4 md:py-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">Wasted Momentum</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
                            Is this unused capacity costing you money?
                        </p>
                    </div>
                    <div className="grid gap-3 md:gap-4">
                        {[
                            { id: 'serious', label: 'Yes, clearly costing us prime profit', icon: TrendingDown },
                            { id: 'little', label: 'Possibly, but manageable', icon: ActivityIcon },
                            { id: 'not-yet', label: 'Not currently a financial drag', icon: Briefcase }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { updateData({ capacityImpact: opt.id as any }); next(); }}
                                className={`flex items-center gap-4 md:gap-6 p-5 md:p-8 rounded-2xl md:rounded-3xl border-2 transition-all text-left group ${data.capacityImpact === opt.id
                                    ? "bg-orange-50 border-orange-500 shadow-xl"
                                    : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                                    }`}
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-colors ${data.capacityImpact === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400"
                                    }`}>
                                    <opt.icon size={18} className="md:w-[22px] md:h-[22px]" />
                                </div>
                                <div className="font-bold text-slate-900 text-base md:text-lg leading-tight">{opt.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'validation':
            return (
                <div className="space-y-8 md:space-y-12 py-4 md:py-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">Accuracy Check</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium">
                            How confident are you in these estimates?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-6 md:pb-10">
                        {[
                            { id: 'very', label: 'Scientific', icon: CheckCircle2, tooltip: 'Based on hard data or recent stocktakes.' },
                            { id: 'fairly', label: 'Guesstimate', icon: ActivityIcon, tooltip: 'An educated guess based on daily observations.' },
                            { id: 'guessing', label: 'Blind Spot', icon: EyeOff, tooltip: 'Suspicion of waste without clear visibility.' },
                            { id: 'not-sure', label: 'No Data', icon: HelpCircle, tooltip: 'Complete uncertainty regarding this metric.' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => updateData({ confidenceStock: opt.id as any })}
                                className={`relative group p-5 md:p-8 rounded-2xl md:rounded-[2rem] border-2 transition-all text-left flex items-start gap-4 md:gap-6 ${data.confidenceStock === opt.id
                                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02] z-20"
                                    : "bg-white border-slate-100 hover:border-orange-500 shadow-sm"
                                    }`}
                            >
                                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${data.confidenceStock === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500"
                                    }`}>
                                    <opt.icon size={20} className="md:w-[28px] md:h-[28px]" />
                                </div>
                                <div className="space-y-0.5 md:space-y-1">
                                    <div className="font-bold text-base md:text-xl tracking-tight leading-tight">{opt.label}</div>
                                    <div className={`text-[10px] md:text-sm font-medium ${data.confidenceStock === opt.id ? "text-slate-400" : "text-slate-400"}`}>
                                        {opt.id === 'very' ? 'High' : opt.id === 'fairly' ? 'Medium' : 'Low'} Confidence
                                    </div>
                                </div>

                                <div className="hidden md:block absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-20 text-center">
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
                <div className="space-y-8 md:space-y-10 py-4 md:py-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">Financial Reality Check</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
                            Convert operational leaks into financial recovery targets.
                        </p>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        <div className="space-y-3 md:space-y-4">
                            <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Average Monthly Turnover</label>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {[
                                    { id: 'under10k', label: 'Under £10k' },
                                    { id: '10k-50k', label: '£10k – £50k' },
                                    { id: '50k-100k', label: '£50k – £100k' },
                                    { id: '100k+', label: '£100k+' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => updateData({ monthlyTurnover: opt.id as any })}
                                        className={`py-3 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest border-2 transition-all ${data.monthlyTurnover === opt.id ? "bg-orange-500 border-orange-500 text-white shadow-xl" : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <label className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Approximate Stock Value</label>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {[
                                    { id: 'under5k', label: 'Under £5k' },
                                    { id: '5k-20k', label: '£5k – £20k' },
                                    { id: '20k-50k', label: '£20k – £50k' },
                                    { id: '50k+', label: '£50k+' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => updateData({ stockValue: opt.id as any })}
                                        className={`py-3 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest border-2 transition-all ${data.stockValue === opt.id ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200"
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
                <div className="space-y-6 md:space-y-10 py-4 md:py-10 flex-1 flex flex-col justify-center">
                    <div className="text-center space-y-2 md:space-y-4">
                        <div className={`inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[8px] md:text-xs font-bold uppercase tracking-widest ${isCritical ? "bg-red-50 text-red-600 border border-red-100" :
                            isHigh ? "bg-orange-50 text-orange-600 border border-orange-100" :
                                isPartial ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    "bg-green-50 text-green-600 border border-green-100"
                            }`}>
                            <Activity size={12} className="md:w-[14px] md:h-[14px]" />
                            Status: {isCritical ? "Critical" : isHigh ? "High Priority" : isPartial ? "Tactical" : "Stable"}
                        </div>
                        <h3 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">Check Result</h3>
                    </div>

                    <div className="bg-slate-50 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 text-slate-900 group-hover:scale-110 transition-transform">
                            <Cpu size={80} className="md:w-[120px] md:h-[120px]" />
                        </div>
                        <div className="relative z-10 space-y-4 md:space-y-6 text-center md:text-left">
                            <h4 className="text-base md:text-xl font-bold text-slate-900 leading-relaxed md:leading-tight">
                                {isCritical || isHigh ? (
                                    <>Based on your <span className="text-orange-500 decoration-slate-200 underline underline-offset-4 md:underline-offset-8">Business Check</span>, your business requires a <strong className="text-slate-900">Full High-Depth Audit</strong>.</>
                                ) : isPartial ? (
                                    <>Your leak thresholds are moderate. We recommend a <strong className="text-slate-900">Short-Form Audit</strong> to stabilize margins.</>
                                ) : (
                                    <>You currently do not meet the minimum thresholds for a full audit. We suggest a <strong className="text-slate-900">Monitoring Cycle</strong>.</>
                                )}
                            </h4>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 pt-2 md:pt-4">
                                <div className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-slate-200 flex items-center gap-2 md:gap-3">
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-[10px] md:text-xs">
                                        !
                                    </div>
                                    <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Potential</div>
                                    <div className="text-xs md:text-sm font-bold text-slate-900 ">Significant</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'readiness':
            return (
                <div className="space-y-8 md:space-y-12 py-4 md:py-10 flex-1 flex flex-col justify-center">
                    <div className="text-center space-y-4 md:space-y-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 text-orange-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-orange-500/10">
                            <ShieldCheck size={32} className="md:w-[40px] md:h-[40px]" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">Ready for Change?</h2>
                            <p className="text-slate-500 text-sm md:text-lg font-medium mt-2 md:mt-4 leading-relaxed">
                                Audits require a commitment to change. Are you prepared to take action?
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        {[
                            { id: 'yes', label: 'Ready', icon: Zap },
                            { id: 'maybe', label: 'Possibly', icon: ActivityIcon },
                            { id: 'not-yet', label: 'Not Yet', icon: Lock }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => updateData({ isReady: opt.id as any })}
                                className={`flex items-center md:flex-col gap-4 md:gap-4 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 transition-all ${data.isReady === opt.id
                                    ? `bg-slate-900 border-slate-900 text-white scale-[1.02] md:scale-105 shadow-xl md:shadow-2xl`
                                    : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                                    }`}
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${data.isReady === opt.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400"
                                    }`}>
                                    <opt.icon size={20} className="md:w-[24px] md:h-[24px]" />
                                </div>
                                <span className="font-bold text-[10px] md:text-sm uppercase tracking-widest">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'healthy':
            return (
                <div className="space-y-8 md:space-y-12 py-4 md:py-10 flex-1 flex flex-col justify-center text-center">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-16 h-16 md:w-24 md:h-24 bg-green-100 text-green-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto shadow-xl md:shadow-2xl shadow-green-500/20"
                    >
                        <CheckCircle2 size={32} className="md:w-[48px] md:h-[48px]" />
                    </motion.div>
                    <div className="space-y-4 md:space-y-6">
                        <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[8px] md:text-xs font-bold uppercase tracking-widest bg-green-50 text-green-600 border border-green-100 mb-2">
                            <Activity size={12} className="md:w-[14px] md:h-[14px]" />
                            Status Stable
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">No Audit Required</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium max-w-lg mx-auto leading-relaxed px-4">
                            Based on your inputs, your business is operating with minimal waste. 
                            We recommend a <span className="text-slate-900 font-bold">Monitoring Cycle</span>.
                        </p>
                    </div>
                </div>
            );

        default:
            return <div>Flow Logic Incomplete. Please contact Node Administrator.</div>;
    }
}

