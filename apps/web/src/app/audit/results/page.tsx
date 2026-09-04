"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
    ChevronRight,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Zap,
    Target,
    Users,
    BarChart3,
    Package,
    Cpu,
    Eye,
    Star,
    Clock,
    ArrowRight,
    Shield,
    Download,
    Printer,
    Share2,
    AlertTriangle,
    Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { generateDiagnosis, getReadinessLabel, getOverallStatusLabel, type BusinessDiagnosis, type HealthRating } from "@/lib/diagnosis";

function getRatingColor(rating: HealthRating): string {
    const colors: Record<HealthRating, string> = {
        excellent: 'bg-green-500',
        good: 'bg-blue-500',
        average: 'bg-yellow-500',
        poor: 'bg-orange-500',
        critical: 'bg-red-500'
    };
    return colors[rating];
}

function getRatingTextColor(rating: HealthRating): string {
    const colors: Record<HealthRating, string> = {
        excellent: 'text-green-600',
        good: 'text-blue-600',
        average: 'text-yellow-600',
        poor: 'text-orange-600',
        critical: 'text-red-600'
    };
    return colors[rating];
}

function getRatingBgColor(rating: HealthRating): string {
    const colors: Record<HealthRating, string> = {
        excellent: 'bg-green-50 border-green-200',
        good: 'bg-blue-50 border-blue-200',
        average: 'bg-yellow-50 border-yellow-200',
        poor: 'bg-orange-50 border-orange-200',
        critical: 'bg-red-50 border-red-200'
    };
    return colors[rating];
}

function getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
        high: 'text-red-600 bg-red-50 border-red-200',
        medium: 'text-orange-600 bg-orange-50 border-orange-200',
        low: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
    return colors[severity] || colors.low;
}

function getPriorityColor(level: string): string {
    const colors: Record<string, string> = {
        immediate: 'bg-red-500',
        medium: 'bg-orange-500',
        'long-term': 'bg-blue-500'
    };
    return colors[level] || colors.medium;
}

function getPriorityLabel(level: string): string {
    const labels: Record<string, string> = {
        immediate: 'Immediate Attention',
        medium: 'Medium Priority',
        'long-term': 'Long-Term Growth'
    };
    return labels[level] || level;
}

export default function DiagnosisPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(true);
    const [diagnosis, setDiagnosis] = useState<BusinessDiagnosis | null>(null);
    const [expandedCat, setExpandedCat] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Load audit answers and generate diagnosis
    useEffect(() => {
        const auditStr = localStorage.getItem("247gbs_audit_completed");
        const triageStr = localStorage.getItem("247gbs_triage_result");

        if (!auditStr && !triageStr) {
            setLoading(false);
            setGenerating(false);
            return;
        }

        // Combine audit answers + triage answers for richer diagnosis
        let allAnswers: Record<string, any> = {};
        try {
            if (auditStr) {
                const audit = JSON.parse(auditStr);
                allAnswers = { ...allAnswers, ...audit.answers };
            }
            if (triageStr) {
                const triage = JSON.parse(triageStr);
                const triageData = localStorage.getItem("247gbs_triage_progress");
                if (triageData) {
                    const t = JSON.parse(triageData);
                    if (t.data) allAnswers = { ...allAnswers, ...t.data };
                }
            }
        } catch {}

        // Simulate generation delay
        setTimeout(() => {
            const result = generateDiagnosis(allAnswers);
            setDiagnosis(result);
            localStorage.setItem("247gbs_diagnosis", JSON.stringify(result));
            setGenerating(false);
            setLoading(false);
        }, 2500);
    }, []);

    // Resume saved diagnosis
    useEffect(() => {
        const saved = localStorage.getItem("247gbs_diagnosis");
        if (saved) {
            try {
                setDiagnosis(JSON.parse(saved));
                setGenerating(false);
                setLoading(false);
            } catch {}
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const statusColor = diagnosis?.overallScore && diagnosis.overallScore >= 60 ? 'bg-green-500' :
        diagnosis?.overallScore && diagnosis.overallScore >= 40 ? 'bg-orange-500' : 'bg-red-500';

    const statusBgColor = diagnosis?.overallScore && diagnosis.overallScore >= 60 ? 'bg-green-50 border-green-200' :
        diagnosis?.overallScore && diagnosis.overallScore >= 40 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';

    // ============== LOADING ==============
    if (generating && !diagnosis) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center"
                >
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Loader2 size={32} className="text-orange-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                        Preparing Your Business Diagnosis
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                        We have completed the analysis of your Business Audit. Your diagnosis has been prepared based on:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-left max-w-xs mx-auto">
                        {[
                            "Your Business Profile",
                            "Your Business Sector",
                            "Your Business Audit",
                            "Business Performance Indicators",
                            "Operational Assessment"
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-2 text-xs sm:text-sm ${i < 3 ? 'text-slate-700' : 'text-slate-400'} font-medium`}>
                                <CheckCircle2 size={14} className={i < 3 ? 'text-green-500' : 'text-slate-300'} />
                                {item}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ============== NO DATA ==============
    if (!diagnosis) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 pt-24 sm:pt-28">
                <div className="text-center">
                    <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Diagnosis Available</h2>
                    <p className="text-slate-500 text-sm mb-6">Complete the Business Audit first to generate your diagnosis.</p>
                    <a href="/dashboard" className="text-orange-500 font-bold text-sm hover:underline">Return to Dashboard</a>
                </div>
            </div>
        );
    }

    const businessName = user?.name || "Your Business";

    return (
        <div className="min-h-screen bg-slate-50">
            <div ref={printRef}>
                {/* Print Header (visible only when printing) */}
                <div className="hidden print:block p-8 border-b mb-8">
                    <h1 className="text-3xl font-bold">Business Diagnosis</h1>
                    <p className="text-slate-500">{businessName}</p>
                    <p className="text-slate-400 text-sm">{new Date(diagnosis.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                {/* Top Nav */}
                <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 text-sm tracking-tight">247GBS Audit</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Business Diagnosis</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Print">
                            <Printer size={16} />
                        </button>
                        <button onClick={() => {}} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Download PDF">
                            <Download size={16} />
                        </button>
                        <button onClick={() => {}} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Share">
                            <Share2 size={16} />
                        </button>
                    </div>
                </nav>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 print:py-0">
                    
                    {/* ========== EXECUTIVE SUMMARY ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="bg-slate-900 px-6 sm:px-10 py-6 sm:py-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Business Diagnosis</h1>
                            <p className="text-slate-400 text-sm">Comprehensive analysis of your business health</p>
                        </div>
                        <div className="px-6 sm:px-10 py-6 sm:py-8 space-y-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Business Name</span>
                                    <p className="font-bold text-slate-900 mt-1">{businessName}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit Type</span>
                                    <p className="font-bold text-slate-900 mt-1">
                                        {(localStorage.getItem("247gbs_audit_completed") ? JSON.parse(localStorage.getItem("247gbs_audit_completed") || "{}").auditType : "") === "LONG_FORM" ? "Long Business Audit" : "Short Business Audit"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</span>
                                    <p className="font-bold text-slate-900 mt-1">{new Date(diagnosis.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Completed By</span>
                                    <p className="font-bold text-slate-900 mt-1">{user?.name || "Business Owner"}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="font-bold text-slate-900 text-sm mb-2">Executive Summary</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{diagnosis.executiveSummary}</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* ========== OVERALL HEALTH SCORE ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10"
                    >
                        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
                                        strokeDasharray={`${(diagnosis.overallScore / 100) * 339.292} 339.292`}
                                        className={diagnosis.overallScore >= 60 ? 'text-green-500' : diagnosis.overallScore >= 40 ? 'text-orange-500' : 'text-red-500'} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <span className={`text-3xl font-bold ${diagnosis.overallScore >= 60 ? 'text-green-600' : diagnosis.overallScore >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                                            {diagnosis.overallScore}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Overall Business Health</h2>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusBgColor} ${diagnosis.overallScore >= 60 ? 'text-green-600' : diagnosis.overallScore >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                                    {getOverallStatusLabel(diagnosis.overallStatus)}
                                </span>
                                <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-md">
                                    {diagnosis.overallScore >= 70
                                        ? "Your business is in a healthy position with strong fundamentals."
                                        : diagnosis.overallScore >= 50
                                            ? "Your business has a solid foundation but several areas need attention."
                                            : "Your business requires significant improvements in key areas."}
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* ========== HEALTH CATEGORIES ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 sm:px-10 py-6 sm:py-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Health Categories</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {diagnosis.healthCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className={`rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all ${getRatingBgColor(cat.rating)}`}
                                        onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                                                <span className={`text-xs font-bold ${getRatingTextColor(cat.rating)}`}>
                                                    {cat.rating.charAt(0).toUpperCase() + cat.rating.slice(1)}
                                                </span>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${getRatingColor(cat.rating)}`} />
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{cat.explanation}</p>
                                        {expandedCat === cat.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-3 pt-3 border-t border-slate-200/50"
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Business Impact</span>
                                                <ul className="space-y-1">
                                                    {cat.impact.map((imp, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                                            <AlertCircle size={10} className="text-slate-400 mt-0.5 shrink-0" />
                                                            {imp}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* ========== STRENGTHS & CHALLENGES ========== */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8"
                        >
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Star size={20} className="text-green-500" />
                                Business Strengths
                            </h2>
                            <div className="space-y-4">
                                {diagnosis.strengths.map((s) => (
                                    <div key={s.id} className="border border-green-100 bg-green-50/50 rounded-xl p-4">
                                        <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                                        <p className="text-xs text-slate-600 mb-2">{s.description}</p>
                                        <p className="text-[10px] text-green-700 font-medium">
                                            <span className="font-bold">Why it matters: </span>
                                            {s.whyItMatters}
                                        </p>
                                    </div>
                                ))}
                                {diagnosis.strengths.length === 0 && (
                                    <p className="text-sm text-slate-400 text-center py-8">No specific strengths identified yet.</p>
                                )}
                            </div>
                        </motion.section>

                        {/* Challenges */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8"
                        >
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-orange-500" />
                                Key Challenges
                            </h2>
                            <div className="space-y-4">
                                {diagnosis.challenges.map((c) => (
                                    <div key={c.id} className="border border-orange-100 bg-orange-50/50 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getSeverityColor(c.severity)}`}>
                                                {c.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600">{c.description}</p>
                                    </div>
                                ))}
                                {diagnosis.challenges.length === 0 && (
                                    <p className="text-sm text-slate-400 text-center py-8">No significant challenges identified.</p>
                                )}
                            </div>
                        </motion.section>
                    </div>

                    {/* ========== GROWTH OPPORTUNITIES ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 sm:px-10 py-6 sm:py-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Target size={20} className="text-orange-500" />
                                Growth Opportunities
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {diagnosis.opportunities.map((opp) => (
                                    <div key={opp.id} className="border border-slate-200 rounded-2xl p-5 hover:border-orange-200 hover:shadow-md transition-all">
                                        <h3 className="font-bold text-slate-900 text-sm mb-3">{opp.title}</h3>
                                        <div className="space-y-2 text-xs">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Situation</span>
                                                <p className="text-slate-600 mt-0.5">{opp.currentSituation}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Potential Outcome</span>
                                                <p className="text-slate-600 mt-0.5">{opp.potentialOutcome}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Business Benefit</span>
                                                <p className="text-slate-600 mt-0.5">{opp.businessBenefit}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* ========== PRIORITY MATRIX ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 sm:px-10 py-6 sm:py-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Priority Matrix</h2>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {(['immediate', 'medium', 'long-term'] as const).map((level) => (
                                    <div key={level} className="border border-slate-200 rounded-2xl overflow-hidden">
                                        <div className={`px-4 py-2.5 ${getPriorityColor(level)} text-white text-xs font-bold uppercase tracking-widest`}>
                                            {getPriorityLabel(level)}
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {diagnosis.priorities.filter(p => p.level === level).map((p) => (
                                                <div key={p.id} className="text-sm text-slate-700">
                                                    <span className="font-bold">{p.title}</span>
                                                    <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                                                </div>
                                            ))}
                                            {diagnosis.priorities.filter(p => p.level === level).length === 0 && (
                                                <p className="text-xs text-slate-400">No items</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* ========== RISK ASSESSMENT ========== */}
                    {diagnosis.risks.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                        >
                            <div className="px-6 sm:px-10 py-6 sm:py-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Shield size={20} className="text-red-500" />
                                    Risk Assessment
                                </h2>
                                <div className="space-y-4">
                                    {diagnosis.risks.map((risk) => (
                                        <div key={risk.id} className="border border-slate-200 rounded-2xl p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">{risk.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">{risk.description}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${getSeverityColor(risk.severity)}`}>
                                                    {risk.severity}
                                                </span>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Potential Impact</span>
                                                    <p className="text-slate-600 mt-0.5">{risk.potentialImpact}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Urgency</span>
                                                    <p className="text-slate-600 mt-0.5">{risk.urgency}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* ========== BUSINESS READINESS ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 sm:px-10 py-6 sm:py-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Business Readiness</h2>
                            <div className={`rounded-2xl border p-5 sm:p-6 ${
                                diagnosis.readiness.status === 'ready-for-growth' ? 'bg-green-50 border-green-200' :
                                diagnosis.readiness.status === 'needs-improvements' ? 'bg-orange-50 border-orange-200' :
                                'bg-red-50 border-red-200'
                            }`}>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                                    diagnosis.readiness.status === 'ready-for-growth' ? 'bg-green-500 text-white' :
                                    diagnosis.readiness.status === 'needs-improvements' ? 'bg-orange-500 text-white' :
                                    'bg-red-500 text-white'
                                }`}>
                                    {getReadinessLabel(diagnosis.readiness.status)}
                                </span>
                                <p className="text-sm text-slate-700 leading-relaxed">{diagnosis.readiness.explanation}</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* ========== WHAT WE FOUND ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 sm:px-10 py-6 sm:py-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">What We Found</h2>
                            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6">
                                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                                    {diagnosis.whatWeFound}
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* ========== DIAGNOSIS TIMELINE ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 sm:px-10 py-6 sm:py-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Your Business Journey</h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
                                {[
                                    { label: 'Business Audit', status: 'complete' },
                                    { label: 'Business Diagnosis', status: 'complete' },
                                    { label: 'Recommended Solutions', status: 'ready' },
                                    { label: 'Implementation Roadmap', status: 'pending' },
                                    { label: 'Account Manager Review', status: 'pending' }
                                ].map((step, i) => (
                                    <React.Fragment key={step.label}>
                                        <div className="flex items-center gap-3 sm:flex-col sm:items-center text-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                step.status === 'complete' ? 'bg-green-500' :
                                                step.status === 'ready' ? 'bg-orange-500' : 'bg-slate-200'
                                            }`}>
                                                {step.status === 'complete' ? <CheckCircle2 size={16} className="text-white" /> :
                                                 step.status === 'ready' ? <Clock size={14} className="text-white" /> :
                                                 <div className="w-2 h-2 bg-slate-400 rounded-full" />}
                                            </div>
                                            <span className={`text-[10px] sm:text-xs font-bold ${
                                                step.status === 'complete' ? 'text-green-600' :
                                                step.status === 'ready' ? 'text-orange-600' : 'text-slate-400'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                        {i < 4 && (
                                            <div className="hidden sm:block flex-1 h-px bg-slate-200 mx-2 mb-6" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* ========== NEXT STEPS ========== */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="bg-slate-900 rounded-3xl shadow-sm p-6 sm:p-10 text-white"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-bold mb-2">Ready for the Next Step?</h2>
                                <p className="text-slate-400 text-sm max-w-lg">
                                    Now that you understand your business health, view recommended solutions tailored to your specific needs.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.setItem("247gbs_diagnosis_viewed", "true");
                                    window.location.href = "/solutions";
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shrink-0 transition-all"
                            >
                                View Recommended Solutions
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.section>

                </div>
            </div>
        </div>
    );
}
