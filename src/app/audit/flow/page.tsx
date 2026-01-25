"use client";

import { AUDIT_QUESTIONS } from "@/data/questions";
import { SECTORS } from "@/data/sectors";
import { AUDIT_STRATEGIES, AuditType, Sector, BusinessGroup, BusinessType, Question } from "@/types/audit";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Bot,
    Sparkles,
    AlertCircle,
    TrendingUp,
    Info,
    Plus,
    Minus,
    ArrowRight,
    Lightbulb,
    Zap,
    Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIInsightCard from "@/components/AIInsightCard";
import AIFollowUpCard from "@/components/AIFollowUpCard";
import type { AIInsightResponse, AIAuditState, AIBusinessContext, AIFollowUpQuestion, AIAuditStepData } from "@/types/aiTypes";

import { Suspense } from "react";

export default function AuditFlowPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Initializing Intelligence Engine...</p>
                </div>
            </div>
        }>
            <AuditFlowContent />
        </Suspense>
    );
}

function AuditFlowContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [showAIHelp, setShowAIHelp] = useState(false);

    // AI State (Long Form only)
    const [aiInsight, setAiInsight] = useState<AIInsightResponse | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiFallback, setAiFallback] = useState(false);

    // Follow-Up State (Long Form only)
    const [followUpQuestions, setFollowUpQuestions] = useState<AIFollowUpQuestion[]>([]);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});

    // Metadata
    const auditType = (searchParams.get("type") as AuditType) || "SHORT_FORM";
    const sectorId = searchParams.get("sector");
    const groupId = searchParams.get("group");
    const businessTypeId = searchParams.get("businessType");
    const strategy = AUDIT_STRATEGIES[auditType];

    const hasStockScope = searchParams.get("stock") !== "false";
    const hasCapacityScope = searchParams.get("capacity") !== "false";

    // Steps definition — EXCESS_STOCK now comes BEFORE SPARE_CAPACITY
    const FLOW_STEPS = useMemo(() => {
        const steps: string[] = [];
        if (hasStockScope) steps.push("EXCESS_STOCK");
        if (hasCapacityScope) steps.push("SPARE_CAPACITY");
        if (auditType === "LONG_FORM") steps.push("FOLLOW_UP");
        steps.push("STRATEGY_PREVIEW");
        return steps;
    }, [hasStockScope, hasCapacityScope, auditType]);

    const currentCategory = FLOW_STEPS[currentStepIndex];


    // Filtering Logic
    const filteredQuestions = useMemo(() => {
        return AUDIT_QUESTIONS.filter((q) => {
            // 1. Audit Type Filter (Short vs Long)
            if (auditType === "SHORT_FORM" && q.isLongFormOnly) return false;

            // 2. Sector Filter
            if (q.sectorSpecific && sectorId && !q.sectorSpecific.includes(sectorId)) return false;

            // 3. Group Filter (Optional granularity)
            if (q.groupId && q.groupId !== groupId) return false;

            // 4. Type Filter (Optional granularity)
            if (q.typeId && q.typeId !== businessTypeId) return false;

            return true;
        });
    }, [auditType, sectorId, groupId, businessTypeId]);

    const stepQuestions = filteredQuestions.filter(q => q.category === currentCategory);

    // PHASE 6: Calculation Engine
    const engineStats = useMemo(() => {
        // 1. Capacity Drain %
        const capacityQuestions = filteredQuestions.filter(q => q.category === "SPARE_CAPACITY");
        let totalCapacityPoints = 0;
        let maxCapacityPoints = 0;

        capacityQuestions.forEach(q => {
            const val = answers[q.id] || 0;
            const weight = q.weight || 1;
            totalCapacityPoints += (val * weight);
            maxCapacityPoints += (q.type === 'percentage' ? 100 : 50) * weight;
        });

        const capacityDrainPct = Math.min(Math.round((totalCapacityPoints / (maxCapacityPoints || 1)) * 100), 100);

        // 2. Excess Stock Financial Impact (Annual)
        const stockValue = answers["stock_value_excess"] || 0;
        const wastePct = answers["perishable_waste_pct"] || 0;
        const annualWasteImpact = (stockValue * (wastePct / 100)) * 12;
        const totalStockImpact = stockValue + annualWasteImpact;

        // 3. Projected Revenue Recovery
        const weeklyRecovery = (capacityDrainPct / 100) * 5000 * 0.20;
        const annualRecovery = weeklyRecovery * 52;

        return {
            capacityDrainPct,
            totalStockImpact,
            annualRecovery,
            impactScore: Math.round((capacityDrainPct + (Math.min(totalStockImpact / 1000, 100))) / 2)
        };
    }, [answers, filteredQuestions]);

    // ============================================================
    // AI INTEGRATION (Long Form Only)
    // Gemini is called ONLY when:
    // 1. auditType === "LONG_FORM"
    // 2. User reaches STRATEGY_PREVIEW step
    // ============================================================
    const fetchAIInsight = useCallback(async () => {
        // RULE: Never for Short Form
        if (auditType !== "LONG_FORM") return;

        setAiLoading(true);
        setAiFallback(false);

        // Build AI state from current audit data
        const activeSector = SECTORS.find((s: Sector) => s.id === sectorId);
        let groupName = "";
        let typeName = "";
        activeSector?.groups.forEach((g: BusinessGroup) => {
            const foundType = g.types.find((t: BusinessType) => t.id === businessTypeId);
            if (foundType) {
                groupName = g.name;
                typeName = foundType.name;
            }
        });

        const stepsData: AIAuditStepData[] = [];
        if (hasStockScope) stepsData.push({ step: "EXCESS_STOCK" as const, data: answers });
        if (hasCapacityScope) stepsData.push({ step: "SPARE_CAPACITY" as const, data: answers });

        const aiState: AIAuditState = {
            context: {
                sector: activeSector?.name || "General",
                group: groupName,
                businessType: typeName,
            },
            steps: stepsData,
            engineStats: {
                capacityDrainPct: engineStats.capacityDrainPct,
                totalStockImpact: engineStats.totalStockImpact,
                annualRecovery: engineStats.annualRecovery,
                impactScore: engineStats.impactScore
            },
            followUpAnswers
        };

        try {
            const response = await fetch("/api/ai/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generateInsight",
                    payload: aiState
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                setAiInsight(result.data as AIInsightResponse);
                if (result.fallback) setAiFallback(true);
            } else {
                throw new Error(result.error || "AI request failed");
            }
        } catch (error) {
            console.error("AI fetch error:", error);
            // Fallback handled by API, but set flag for UI
            setAiFallback(true);
        } finally {
            setAiLoading(false);
        }
    }, [auditType, sectorId, businessTypeId, answers, engineStats, followUpAnswers]);

    // ============================================================
    // FOLLOW-UP QUESTIONS FETCH (Long Form Only)
    // Triggered when entering FOLLOW_UP step
    // ============================================================
    const fetchFollowUpQuestions = useCallback(async () => {
        // RULE: Never for Short Form
        if (auditType !== "LONG_FORM") return;

        setFollowUpLoading(true);

        // Build AI state from current audit data
        const activeSector = SECTORS.find((s: Sector) => s.id === sectorId);
        let groupName = "";
        let typeName = "";
        activeSector?.groups.forEach((g: BusinessGroup) => {
            const foundType = g.types.find((t: BusinessType) => t.id === businessTypeId);
            if (foundType) {
                groupName = g.name;
                typeName = foundType.name;
            }
        });

        const stepsData: AIAuditStepData[] = [];
        if (hasStockScope) stepsData.push({ step: "EXCESS_STOCK" as const, data: answers });
        if (hasCapacityScope) stepsData.push({ step: "SPARE_CAPACITY" as const, data: answers });

        const aiState: AIAuditState = {
            context: {
                sector: activeSector?.name || "General",
                group: groupName,
                businessType: typeName,
            },
            steps: stepsData,
            engineStats: {
                capacityDrainPct: engineStats.capacityDrainPct,
                totalStockImpact: engineStats.totalStockImpact,
                annualRecovery: engineStats.annualRecovery,
                impactScore: engineStats.impactScore
            }
        };

        try {
            const response = await fetch("/api/ai/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generateFollowUp",
                    payload: aiState
                })
            });

            const result = await response.json();

            if (result.success && result.data && result.data.followUpQuestions) {
                setFollowUpQuestions(result.data.followUpQuestions);
            } else {
                // No questions or error — continue normally
                setFollowUpQuestions([]);
            }
        } catch (error) {
            console.error("Follow-up fetch error:", error);
            setFollowUpQuestions([]);
        } finally {
            setFollowUpLoading(false);
        }
    }, [auditType, sectorId, businessTypeId, answers, engineStats]);

    // Auto-trigger follow-up questions when entering FOLLOW_UP step
    useEffect(() => {
        if (currentCategory === "FOLLOW_UP" && auditType === "LONG_FORM" && followUpQuestions.length === 0 && !followUpLoading) {
            fetchFollowUpQuestions();
        }
    }, [currentCategory, auditType, followUpQuestions.length, followUpLoading, fetchFollowUpQuestions]);

    // Auto-trigger AI when entering Strategy Preview (Long Form only)
    useEffect(() => {
        if (currentCategory === "STRATEGY_PREVIEW" && auditType === "LONG_FORM" && !aiInsight && !aiLoading) {
            fetchAIInsight();
        }
    }, [currentCategory, auditType, aiInsight, aiLoading, fetchAIInsight]);

    // Handle follow-up answers submission
    const handleFollowUpSubmit = (answers: Record<string, string>) => {
        setFollowUpAnswers(answers);
        // Proceed to next step (STRATEGY_PREVIEW)
        setCurrentStepIndex(currentStepIndex + 1);
        window.scrollTo(0, 0);
    };

    // Handle follow-up skip
    const handleFollowUpSkip = () => {
        // Proceed to next step without answers
        setCurrentStepIndex(currentStepIndex + 1);
        window.scrollTo(0, 0);
    };


    const handleAdjust = (id: string, delta: number) => {
        setAnswers(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }));
    };

    const handleNext = () => {
        if (currentStepIndex < FLOW_STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            window.scrollTo(0, 0);
        } else {
            const params = new URLSearchParams();
            params.set("type", auditType);
            params.set("sector", sectorId || "");
            params.set("drain", engineStats.capacityDrainPct.toString());
            params.set("stock", engineStats.totalStockImpact.toString());
            params.set("recovery", engineStats.annualRecovery.toString());
            params.set("score", engineStats.impactScore.toString());
            router.push(`/audit/results?${params.toString()}`);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);

        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-orange-100 font-sans">
            <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">A</div>
                        <span className="font-bold tracking-tight text-slate-900">247GBS Audit Engine</span>
                    </div>
                    <a href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors">
                        Exit Audit
                    </a>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pt-12">

                {/* Main Step Engine */}
                <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">

                    {/* Progress Navigator */}
                    <div className="bg-slate-900 pt-10 pb-6 px-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-orange-500">
                            <Target size={160} />
                        </div>
                        <div className="relative z-10 flex justify-between items-center mb-8">
                            <div className="flex gap-2">
                                {FLOW_STEPS.map((step, idx) => (
                                    <div
                                        key={step}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStepIndex ? "bg-orange-500 w-12" : idx < currentStepIndex ? "bg-green-500 w-8" : "bg-white/20 w-8"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                {strategy.depth} Audit Workflow
                            </span>
                        </div>
                        <h1 className={`text-4xl font-black relative z-10 ${currentCategory === "FOLLOW_UP" ? "text-red-500 animate-pulse" : "text-white"} capitalize`}>
                            {currentCategory === "STRATEGY_PREVIEW" ? "Recommended Solution" : currentCategory === "FOLLOW_UP" ? "🔥 Critical Clarifications" : currentCategory.replace("_", " ").toLowerCase()}
                        </h1>
                    </div>

                    {/* Scope Switcher / Tabs */}
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => {
                                const idx = FLOW_STEPS.indexOf("EXCESS_STOCK");
                                if (idx !== -1) setCurrentStepIndex(idx);
                            }}
                            disabled={!hasStockScope}
                            className={`flex-1 py-6 flex items-center justify-center gap-3 transition-all relative ${currentCategory === "EXCESS_STOCK"
                                ? "text-orange-500 font-black bg-orange-50/30"
                                : "text-slate-400 font-bold hover:text-slate-600"
                                } disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed`}
                        >
                            <TrendingUp size={20} />
                            Excess Stock Audit
                            {currentCategory === "EXCESS_STOCK" && (
                                <motion.div layoutId="scope-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
                            )}
                        </button>
                        <button
                            onClick={() => {
                                const idx = FLOW_STEPS.indexOf("SPARE_CAPACITY");
                                if (idx !== -1) setCurrentStepIndex(idx);
                            }}
                            disabled={!hasCapacityScope}
                            className={`flex-1 py-6 flex items-center justify-center gap-3 transition-all relative ${currentCategory === "SPARE_CAPACITY"
                                ? "text-orange-500 font-black bg-orange-50/30"
                                : "text-slate-400 font-bold hover:text-slate-600"
                                } disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed`}
                        >
                            <Zap size={20} />
                            Spare Capacity Audit
                            {currentCategory === "SPARE_CAPACITY" && (
                                <motion.div layoutId="scope-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
                            )}
                        </button>
                    </div>

                    <div className="p-10 md:p-16">
                        <AnimatePresence mode="wait">
                            {/* FOLLOW_UP STEP — Long Form Only */}
                            {currentCategory === "FOLLOW_UP" ? (
                                <motion.div
                                    key="followup"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8 p-8 rounded-3xl border-2 border-red-100 bg-red-50/20"
                                >
                                    <div className="bg-red-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-red-100 mb-4">
                                        <AlertCircle size={20} className="animate-bounce" />
                                        <span className="font-black uppercase tracking-widest text-[11px]">Critical Action: Precision Recovery Input Required</span>
                                    </div>
                                    <AIFollowUpCard
                                        questions={followUpQuestions}
                                        isLoading={followUpLoading}
                                        onSubmit={handleFollowUpSubmit}
                                        onSkip={handleFollowUpSkip}
                                    />

                                    {/* If no questions and not loading, auto-skip to next step */}
                                    {!followUpLoading && followUpQuestions.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-slate-500 mb-6">No additional clarifications needed.</p>
                                            <button
                                                onClick={handleFollowUpSkip}
                                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-colors"
                                            >
                                                Continue to Results
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : currentCategory === "STRATEGY_PREVIEW" ? (

                                <motion.div
                                    key="strategy"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-orange-50 border border-orange-100 p-8 rounded-3xl">
                                        <h3 className="text-2xl font-black text-orange-900 mb-4 flex items-center gap-3">
                                            <Lightbulb className="text-orange-500" />
                                            Preview: Opportunity Detected
                                        </h3>
                                        <p className="text-orange-800 leading-relaxed font-medium">
                                            Based on your real-time inputs of {engineStats.capacityDrainPct}% capacity drain and £{engineStats.totalStockImpact.toLocaleString()} annual stock impact, the system suggests a potential annual recovery of <span className="font-black underline decoration-orange-300">£{engineStats.annualRecovery.toLocaleString()}</span> through the 247GBS redistribution engine.
                                        </p>
                                    </div>

                                    {/* AI INSIGHT CARD — Long Form Only */}
                                    {auditType === "LONG_FORM" && (
                                        <div className="space-y-4">
                                            <AIInsightCard
                                                insight={aiInsight}
                                                isLoading={aiLoading}
                                                isFallback={aiFallback}
                                                onRetry={fetchAIInsight}
                                            />
                                            {!aiInsight && !aiLoading && (
                                                <button
                                                    onClick={fetchAIInsight}
                                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-colors flex items-center justify-center gap-3"
                                                >
                                                    <Sparkles size={18} />
                                                    Get Deeper Insight
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-2">Short-Term Action</h4>
                                            <p className="text-sm text-slate-500">Inventory liquidation of items older than 90 days. Estimated recovery: £{engineStats.totalStockImpact.toLocaleString()}</p>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-2">Long-Term Pivot</h4>
                                            <p className="text-sm text-slate-500">Staff redistribution from prep-tasks to upselling. Expected margin increase: 4.2%</p>
                                        </div>
                                    </div>
                                </motion.div>

                            ) : (
                                <motion.div
                                    key={currentCategory}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="bg-slate-50 border-l-4 border-orange-500 p-5 rounded-r-2xl flex gap-4">
                                        <AlertCircle className="text-orange-500 shrink-0" size={20} />
                                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                                            <span className="font-black text-slate-900">Important:</span> Quality inputs drive quality strategic recommendations. Accuracy here is vital.
                                        </p>
                                    </div>

                                    <form className="space-y-12">
                                        {stepQuestions.map((q) => (
                                            <div key={q.id} className="group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <label className="block text-xl font-black text-slate-900 max-w-md">
                                                        {q.text}
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAIHelp(true)}
                                                        className="text-slate-300 hover:text-orange-500 transition-colors"
                                                    >
                                                        <Info size={20} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {q.type === "boolean" ? (
                                                        <div className="flex gap-4 w-full">
                                                            <button
                                                                type="button"
                                                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 1 }))}
                                                                className={`flex-1 py-6 rounded-[2rem] font-black text-xl transition-all border-3 ${answers[q.id] === 1 ? "bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-200" : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"}`}
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 0 }))}
                                                                className={`flex-1 py-6 rounded-[2rem] font-black text-xl transition-all border-3 ${answers[q.id] === 0 ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"}`}
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex-1 relative">
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
                                                                    className="w-full text-3xl font-black p-6 bg-slate-50 border-3 border-transparent focus:border-orange-500 focus:bg-white rounded-3xl outline-none transition-all pr-16 appearance-none"
                                                                    value={answers[q.id] === undefined ? 0 : (Number.isNaN(answers[q.id]) ? '' : answers[q.id])}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        if (val === '') {
                                                                            setAnswers(prev => ({ ...prev, [q.id]: NaN }));
                                                                        } else if (/^\d*$/.test(val)) {
                                                                            setAnswers(prev => ({ ...prev, [q.id]: parseInt(val) }));
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">
                                                                    {q.type === "percentage" ? "%" : q.type === "currency" ? "£" : ""}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAdjust(q.id, 1)}
                                                                    className="p-3 bg-slate-100 hover:bg-orange-500 hover:text-white rounded-xl transition-all"
                                                                >
                                                                    <Plus size={20} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAdjust(q.id, -1)}
                                                                    className="p-3 bg-slate-100 hover:bg-orange-500 hover:text-white rounded-xl transition-all"
                                                                >
                                                                    <Minus size={20} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>


                                            </div>
                                        ))}
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between mt-20 pt-10 border-t border-slate-100">
                            <button
                                onClick={handleBack}
                                disabled={currentStepIndex === 0}
                                className="px-10 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all flex items-center gap-2"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className={`px-16 py-5 ${currentCategory === "FOLLOW_UP" ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"} text-white rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center gap-3`}
                            >
                                {currentStepIndex === FLOW_STEPS.length - 1 ? "Complete Audit" : "Next Step"}
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Context Sidebar */}
                <aside className="lg:w-96 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Engine Analytics</h4>
                                <TrendingUp className="text-orange-500" size={20} />
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                                        <span className="text-slate-400">Capacity Drain</span>
                                        <span className="text-orange-500">{engineStats.capacityDrainPct}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${engineStats.capacityDrainPct}%` }}
                                            className="bg-orange-500 h-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                                        <span className="text-slate-400">Recovery Value</span>
                                        <span className="text-orange-500">£{Math.round(engineStats.annualRecovery / 52).toLocaleString()}/wk</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${Math.min((engineStats.annualRecovery / 50000) * 100, 100)}%` }}
                                            className="bg-orange-400 h-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                <p className="text-[10px] text-slate-400 italic leading-relaxed">
                                    "Real-time analysis suggests {engineStats.capacityDrainPct > 20 ? 'critical' : 'moderate'} underutilisation. Every percentage point represents roughly £500 in potential annual recovery."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-900 text-sm">Strategy Assistant</h5>
                                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Active Logic</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                            {currentCategory === "SPARE_CAPACITY"
                                ? "Looking at idle staff time is the most immediate way to reclaim margins. It's not about cutting jobs, it's about re-allocating value."
                                : currentCategory === "EXCESS_STOCK"
                                    ? "Stock older than 90 days isn't just taking up space; it's dead capital that costs you storage fees and lost opportunity."
                                    : "We are combining your operational and stock data to build your forensic roadmap."}
                        </p>
                    </div>
                </aside>

            </div>
        </div >
    );
}
