"use client";

import { AUDIT_STRATEGIES, AuditType, Sector, RecommendationTemplate } from "@/types/audit";
import { SECTORS } from "@/data/sectors";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
import {
    BarChart,
    ChevronRight,
    Download,
    TrendingUp,
    Zap,
    ShieldCheck,
    Calendar,
    Sparkles,
    ArrowUpRight,
    Clock,
    Target,
    ArrowBigRightDash,
    Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

import { Suspense } from "react";

export default function AuditResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Compiling Results...</p>
                </div>
            </div>
        }>
            <AuditResultsContent />
        </Suspense>
    );
}

function AuditResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auditId = searchParams.get("id");

    const [isSaving, setIsSaving] = useState(false);
    const [saveComplete, setSaveComplete] = useState(false);

    const [auditData, setAuditData] = useState<any>(null);

    // Helper for authenticated fetch
    const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        let token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
        const headers = { ...options.headers, "Content-Type": "application/json" } as any;
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        let res = await fetch(url, { ...options, headers });
        if (res.status === 401) {
            token = await refreshAccessToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
                res = await fetch(url, { ...options, headers });
            }
        }
        return res;
    }, []);

    useEffect(() => {
        if (!auditId) return;
        authFetch(`${API_BASE_URL}/audit/${auditId}`).then(res => {
            if (res.ok) {
                res.json().then(data => setAuditData(data));
            }
        });
    }, [auditId, authFetch]);

    const auditType = (auditData?.auditType as AuditType) || "SHORT_FORM";
    const sectorId = auditData?.sectorId;
    const strategy = AUDIT_STRATEGIES[auditType as AuditType] || AUDIT_STRATEGIES.SHORT_FORM;

    const activeSector = useMemo(() => SECTORS.find(s => s.id === sectorId), [sectorId]);

    // Read Engine Results from fetched DB row
    const capacityDrain = auditData?.calculatedMetrics?.capacityDrainPct || 0;
    const annualRecovery = auditData?.calculatedMetrics?.annualRecovery || 0;
    const impactScore = auditData?.calculatedMetrics?.impactScore || 0;

    const handleSave = () => {
        setIsSaving(true);
        // The data is already saved to the DB via previous PUT requests.
        // We just pretend to finalize it here for UX consistency.
        setTimeout(() => {
            setIsSaving(false);
            setSaveComplete(true);

            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        }, 1000);
    };

    // Simple 'Engine' to find matching recommendations from config
    const matches = useMemo(() => {
        if (!activeSector) return [];
        return activeSector.recommendationTemplates;
    }, [activeSector]);

    const containerVars = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVars = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-orange-100 font-sans">
            <motion.div
                variants={containerVars}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto"
            >

                {/* Dashboard Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div variants={itemVars}>
                        <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            Decision Engine Output | {strategy.depth}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                            Strategic Growth <span className="text-orange-500">Roadmap</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                            Sector Profile: <span className="text-slate-900 font-bold underline decoration-slate-200 decoration-2 underline-offset-4">{activeSector?.name || "General Business"}</span>
                        </p>
                    </motion.div>

                    <motion.div variants={itemVars} className="flex flex-wrap gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || saveComplete}
                            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-orange-100 ${saveComplete
                                ? "bg-green-500 text-white"
                                : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : saveComplete ? (
                                <>
                                    <ShieldCheck size={18} />
                                    Saved to Vault
                                </>
                            ) : (
                                <>
                                    <Zap size={18} fill="currentColor" />
                                    Save to Vault
                                </>
                            )}
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                            <Download size={18} />
                            Export PDF
                        </button>
                    </motion.div>
                </header>

                {/* Executive Metrics Overview */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    <motion.div variants={itemVars} className="md:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recovery Value (Annual)</span>
                                <Zap size={20} className="text-orange-500" fill="currentColor" />
                            </div>
                            <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                                £{annualRecovery.toLocaleString()}
                            </div>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
                                This is your <span className="text-white font-bold">Unrealised Growth potential</span>—locked in {activeSector?.name} operational gaps.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVars} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6">Capacity Drain</div>
                        <div className="text-4xl font-black text-slate-900 mb-2">{capacityDrain}%</div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
                            <div className="bg-orange-500 h-full" style={{ width: `${capacityDrain}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2">
                            <ArrowUpRight size={14} className="text-red-500" />
                            Critical Leakage Area
                        </p>
                    </motion.div>

                    <motion.div variants={itemVars} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6">Efficiency Rank</div>
                        <div className="text-4xl font-black text-slate-900 mb-2">{100 - impactScore}/100</div>
                        <div className="flex gap-1 mt-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= (100 - impactScore) / 20 ? 'bg-green-500' : 'bg-slate-100'}`} />
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-6">Versus Industry Avg</p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Action Engine */}
                    <div className="lg:col-span-2 space-y-8">

                        <motion.div variants={itemVars} className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 overflow-hidden">
                            <header className="flex justify-between items-center mb-12">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                                    <Target size={28} className="text-orange-500" />
                                    Execution Plan
                                </h3>
                                <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    3 High-Impact Moves
                                </span>
                            </header>

                            <div className="space-y-10">
                                {matches.map((rec: RecommendationTemplate, idx) => (
                                    <div key={rec.id} className="relative pl-16 group/item">
                                        <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all">
                                            0{idx + 1}
                                        </div>
                                        {idx < matches.length - 1 && (
                                            <div className="absolute left-6 top-14 bottom-[-2.5rem] w-px bg-slate-100" />
                                        )}
                                        <h4 className="text-xl font-black mb-3 text-slate-900">{rec.title}</h4>
                                        <p className="text-slate-500 mb-6 font-medium leading-relaxed italic">
                                            "{rec.description}"
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-700 flex items-center gap-3">
                                                <ArrowBigRightDash className="text-orange-500" />
                                                {rec.actionItem}
                                            </div>
                                            <button className="px-4 py-4 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {matches.length === 0 && (
                                    <div className="text-center py-20 opacity-30">
                                        <BarChart className="mx-auto mb-4" size={48} />
                                        <p className="font-bold">No specific recommendations for this sector subset.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Value Framing: Cost of Inaction */}
                        <motion.div variants={itemVars} className="grid md:grid-cols-2 gap-6">
                            <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100">
                                <h4 className="text-red-900 font-black mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                                    <Clock size={16} />
                                    Cost of Inaction
                                </h4>
                                <div className="text-3xl font-black text-red-600 mb-2">
                                    £{Math.round(annualRecovery / 12).toLocaleString()} /mo
                                </div>
                                <p className="text-red-800/60 text-xs font-medium leading-relaxed">
                                    Every month you delay these {activeSector?.name} optimizations, you effectively witness this amount of net profit leakage.
                                </p>
                            </div>
                            <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100">
                                <h4 className="text-green-900 font-black mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                                    <Target size={16} />
                                    Growth Potential
                                </h4>
                                <div className="text-3xl font-black text-green-600 mb-2">
                                    +{((annualRecovery / 50000) * 100).toFixed(1)}%
                                </div>
                                <p className="text-green-800/60 text-xs font-medium leading-relaxed">
                                    Projected increase in gross operating margin after 247GBS ecological redistribution implementation.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Decision Timeline Sidebar */}
                    <div className="space-y-6">
                        <motion.div variants={itemVars} className="bg-orange-500 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-orange-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                                <Sparkles size={100} />
                            </div>
                            <h4 className="text-3xl font-black mb-4 leading-tight">
                                Ready to Monetise?
                            </h4>
                            <p className="text-orange-100 mb-10 text-sm leading-relaxed font-bold">
                                Connect your {activeSector?.name} audit data to the 247GBS network and turn these findings into active cashflow.
                            </p>
                            <button className="w-full py-5 bg-white text-orange-600 rounded-3xl font-black text-lg shadow-xl hover:bg-orange-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                                Begin Monetisation
                                <ArrowUpRight size={20} />
                            </button>
                        </motion.div>

                        <motion.div variants={itemVars} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative">
                            <h5 className="font-black text-slate-900 mb-6 text-xs uppercase tracking-[0.2em]">Next Audit Cycle</h5>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">April 22nd, 2026</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Q2 Forecast Refresh</p>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                Frequent auditing prevents "efficiency decay" as your business scales.
                            </div>
                        </motion.div>

                        <motion.div variants={itemVars} className="text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
                            >
                                Archive and New Entry <ChevronRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
