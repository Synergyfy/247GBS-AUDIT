"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SECTORS } from "@/data/sectors";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Clock,
    CheckCircle2,
    ArrowRight,
    BarChart3,
    FileText,
    AlertCircle,
    ShieldCheck,
    Loader2,
    Eye,
    UserCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TriageResult {
    assignedAudit: 'SHORT_FORM' | 'LONG_FORM';
    completedAt: string;
}

interface AuditCompleted {
    completedAt: string;
    auditType: string;
    sectorId: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
    const [sectorInfo, setSectorInfo] = useState<{ sectorId: string; groupId: string; typeId: string } | null>(null);
    const [auditCompleted, setAuditCompleted] = useState<AuditCompleted | null>(null);
    const [loading, setLoading] = useState(true);

    const [diagnosisViewed, setDiagnosisViewed] = useState(false);
    const [improvementPlanComplete, setImprovementPlanComplete] = useState(false);

    useEffect(() => {
        // Check triage
        const completed = localStorage.getItem("247gbs_assessment_completed");
        const resultStr = localStorage.getItem("247gbs_triage_result");

        if (completed && resultStr) {
            try {
                const result = JSON.parse(resultStr);
                setTriageResult(result);
            } catch {
                setTriageResult({ assignedAudit: 'SHORT_FORM', completedAt: new Date().toISOString() });
            }
        } else if (completed) {
            setTriageResult({ assignedAudit: 'SHORT_FORM', completedAt: new Date().toISOString() });
        }

        // Check sector info
        const sectorStr = localStorage.getItem("247gbs_audit_sector");
        if (sectorStr) {
            try {
                setSectorInfo(JSON.parse(sectorStr));
            } catch {}
        }

        // Check audit completion
        const auditStr = localStorage.getItem("247gbs_audit_completed");
        if (auditStr) {
            try {
                setAuditCompleted(JSON.parse(auditStr));
            } catch {}
        }

        // Check if diagnosis has been viewed
        const viewed = localStorage.getItem("247gbs_diagnosis_viewed");
        if (viewed === "true") {
            setDiagnosisViewed(true);
        }

        // Check if improvement plan is complete
        const planComplete = localStorage.getItem("247gbs_solutions_complete");
        if (planComplete === "true") {
            setImprovementPlanComplete(true);
        }

        setLoading(false);
    }, []);

    const isLong = triageResult?.assignedAudit === 'LONG_FORM';
    const auditName = isLong ? 'Long Business Audit' : 'Short Business Audit';
    const lastUpdated = triageResult?.completedAt
        ? new Date(triageResult.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="text-orange-500 animate-spin" />
            </div>
        );
    }

    // Find sector and type names
    const sectorName = sectorInfo ? SECTORS.find(s => s.id === sectorInfo.sectorId)?.name : null;
    const typeName = sectorInfo ? SECTORS.find(s => s.id === sectorInfo.sectorId)?.groups.find(g => g.id === sectorInfo.groupId)?.types.find(t => t.id === sectorInfo.typeId)?.name : null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                        Welcome {user?.name?.split(" ")[0] || 'User'}!
                    </h1>
                    {sectorName && typeName && (
                        <p className="text-orange-600 font-bold text-sm mb-2">
                            {sectorName} • {typeName}
                        </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${triageResult ? 'bg-green-500' : 'bg-slate-300'}`} />
                            {triageResult ? 'Triage Complete' : 'Triage Not Started'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${auditCompleted ? 'bg-green-500' : 'bg-slate-300'}`} />
                            {auditCompleted ? 'Audit Completed' : 'Audit Not Started'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${improvementPlanComplete ? 'bg-green-500' : diagnosisViewed ? 'bg-green-500' : 'bg-slate-300'}`} />
                            {improvementPlanComplete ? 'Improvement Plan Ready' : diagnosisViewed ? 'Diagnosis Reviewed' : 'Diagnosis Not Started'}
                        </span>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="hidden sm:inline">Last Updated: {lastUpdated}</span>
                    </div>
                </div>
            </motion.div>

            {/* Business Diagnosis Ready */}
            {auditCompleted && !diagnosisViewed && !improvementPlanComplete && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Eye size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-1">Business Diagnosis Ready</h3>
                                <p className="text-white/80 text-sm">Your audit has been analysed. View your personalised business diagnosis and recommendations.</p>
                            </div>
                        </div>
                        <Link
                            href="/audit/results"
                            className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-green-50 transition-all shrink-0"
                        >
                            View Business Diagnosis
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Diagnosis Viewed → Recommended Solutions */}
            {auditCompleted && diagnosisViewed && !improvementPlanComplete && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                <BarChart3 size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-1">Recommended Solutions Ready</h3>
                                <p className="text-white/80 text-sm">Your business diagnosis is complete. View tailored solutions to address your business needs.</p>
                            </div>
                        </div>
                        <Link
                            href="/solutions"
                            className="bg-white text-orange-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-orange-50 transition-all shrink-0"
                        >
                            View Recommended Solutions
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Improvement Plan Complete → Account Manager Review */}
            {auditCompleted && improvementPlanComplete && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                <UserCheck size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-1">Account Manager Review Ready</h3>
                                <p className="text-white/80 text-sm">Your Business Improvement Plan is complete. Review your recommendations with an MCOM Account Manager.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.alert("Account Manager Review coming in Module 5")}
                            className="bg-white text-purple-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-purple-50 transition-all shrink-0"
                        >
                            Book Account Manager Review
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Main Audit Card */}
            {triageResult ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                >
                    {/* Card Header */}
                    <div className={`px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between ${
                        auditCompleted ? 'bg-green-500' : isLong ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <FileText size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base sm:text-lg">Assigned Audit</h3>
                                <p className="text-white/70 text-xs sm:text-sm">{auditName}</p>
                            </div>
                        </div>
                        <span className="px-3 py-1.5 bg-white/20 rounded-full text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                            {auditCompleted ? 'Completed' : 'Ready to Start'}
                        </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-8">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <div className="text-center">
                                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Estimated Time</div>
                                <div className="text-lg sm:text-xl font-bold text-slate-900">{isLong ? '28 min' : '10 min'}</div>
                            </div>
                            <div className="text-center border-x border-slate-100">
                                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Stages</div>
                                <div className="text-lg sm:text-xl font-bold text-slate-900">6</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Questions</div>
                                <div className="text-lg sm:text-xl font-bold text-slate-900">~{isLong ? '40' : '20'}</div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500">Progress</span>
                                <span className="text-xs font-bold text-slate-400">{auditCompleted ? '100%' : '0%'}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className={`h-2 rounded-full transition-all ${auditCompleted ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: auditCompleted ? '100%' : '0%' }} />
                            </div>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5">{auditCompleted ? 'Completed' : 'Not Started'}</p>
                        </div>

                        {/* CTA */}
                        {auditCompleted ? (
                            <Link
                                href="/audit/results"
                                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                View Results
                                <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <Link
                                href={`/audit/flow?type=${triageResult.assignedAudit}`}
                                className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                Start Audit
                                <ArrowRight size={18} />
                            </Link>
                        )}

                        {/* Note */}
                        <p className="text-[10px] sm:text-xs text-slate-400 text-center mt-4 leading-relaxed">
                            {auditCompleted
                                ? "Your audit has been completed and analysed. View your Business Diagnosis for detailed recommendations."
                                : "This audit has been selected automatically based on your Business Triage and is tailored to your business profile."
                            }
                        </p>
                    </div>
                </motion.div>
            ) : (
                /* No Triage Completed */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 text-center"
                >
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} className="text-orange-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                        Complete Your Business Triage First
                    </h3>
                    <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-8">
                        Before starting your audit, you need to complete the free Business Triage. This helps us determine the most appropriate audit for your business.
                    </p>
                    <Link
                        href="/audit/welcome"
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1"
                    >
                        Start Business Triage
                        <ArrowRight size={18} />
                    </Link>
                </motion.div>
            )}

            {/* Quick Info Section */}
            {triageResult && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid sm:grid-cols-2 gap-4"
                >
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle2 size={18} className="text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Business Triage Complete</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Your responses have been analysed and your audit has been automatically assigned.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Tailored to Your Sector</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Your audit includes sector-specific questions based on your MCOM Central profile.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
