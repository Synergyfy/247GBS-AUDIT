"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Clock,
    CheckCircle2,
    ArrowRight,
    Package,
    Zap,
    Users,
    Target,
    Cpu,
    BarChart3,
    Loader2,
    AlertCircle,
    Star,
    Edit3,
    Shield
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AUDIT_QUESTIONS } from "@/data/questions";
import { AUDIT_STAGES, type AuditStage } from "@/data/audit-stages";
import type { Question, QuestionType, AuditCategory, AuditType, QuestionOption } from "@/types/audit";

// ============================================================
// ICON MAP
// ============================================================
const ICON_MAP: Record<string, React.ReactNode> = {
    Package: <Package size={24} />,
    Zap: <Zap size={24} />,
    Users: <Users size={24} />,
    Target: <Target size={24} />,
    Cpu: <Cpu size={24} />,
    BarChart3: <BarChart3 size={24} />,
};

// ============================================================
// TYPES
// ============================================================

type FlowScreen =
    | "introduction"
    | "stage-intro"
    | "question"
    | "stage-complete"
    | "review"
    | "confirmation"
    | "processing"
    | "complete";

interface AuditState {
    currentScreen: FlowScreen;
    stageIdx: number;
    questionIdx: number;
    answers: Record<string, any>;
    startedAt: string;
}

const STORAGE_KEY = "247gbs_audit_flow";

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AuditFlowPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const auditType = (searchParams.get("type") as AuditType) || "SHORT_FORM";
    const sectorId = searchParams.get("sector") || "";
    const groupId = searchParams.get("group") || "";
    const businessTypeId = searchParams.get("businessType") || "";

    // Filter questions for this audit
    const filteredQuestions = useMemo(() => {
        return AUDIT_QUESTIONS.filter(q => {
            if (auditType === "SHORT_FORM" && q.isLongFormOnly) return false;
            if (q.sectorSpecific && sectorId && !q.sectorSpecific.includes(sectorId)) return false;
            if (q.groupId && q.groupId !== groupId) return false;
            if (q.typeId && q.typeId !== businessTypeId) return false;
            return true;
        });
    }, [auditType, sectorId, groupId, businessTypeId]);

    // Group questions by stage category
    const stageQuestions = useMemo(() => {
        const grouped: Record<string, Question[]> = {};
        AUDIT_STAGES.forEach(stage => {
            grouped[stage.id] = filteredQuestions.filter(q => q.category === stage.category);
        });
        return grouped;
    }, [filteredQuestions]);

    // Stages that have questions
    const activeStages = useMemo(() => {
        return AUDIT_STAGES.filter(stage => stageQuestions[stage.id]?.length > 0);
    }, [stageQuestions]);

    // State
    const [state, setState] = useState<AuditState>({
        currentScreen: "introduction",
        stageIdx: 0,
        questionIdx: 0,
        answers: {},
        startedAt: new Date().toISOString()
    });
    const [hydrated, setHydrated] = useState(false);

    // Restore progress
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setState(parsed);
            } catch {}
        }
        setHydrated(true);
    }, []);

    // Auto-save
    useEffect(() => {
        if (!hydrated) return;
        if (state.currentScreen === "complete") {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state, hydrated]);

    const currentStage = activeStages[state.stageIdx];
    const currentQuestions = currentStage ? stageQuestions[currentStage.id] || [] : [];
    const currentQuestion = currentQuestions[state.questionIdx];
    const totalQuestions = activeStages.reduce((sum, s) => sum + (stageQuestions[s.id]?.length || 0), 0);
    const answeredCount = activeStages.slice(0, state.stageIdx).reduce((sum, s) => sum + (stageQuestions[s.id]?.length || 0), 0) + state.questionIdx;

    // Time estimate
    const timeRemaining = useMemo(() => {
        let questionsLeft = 0;
        for (let i = state.stageIdx; i < activeStages.length; i++) {
            const qs = stageQuestions[activeStages[i].id] || [];
            if (i === state.stageIdx) {
                questionsLeft += qs.length - state.questionIdx - 1;
            } else {
                questionsLeft += qs.length;
            }
        }
        return Math.max(1, Math.ceil(questionsLeft * 0.5));
    }, [state.stageIdx, state.questionIdx, activeStages, stageQuestions]);

    // Navigation
    const goToScreen = (screen: FlowScreen) => {
        setState(prev => ({ ...prev, currentScreen: screen }));
    };

    const goNext = useCallback(() => {
        setState(prev => {
            const { currentScreen, stageIdx, questionIdx } = prev;
            const stage = activeStages[stageIdx];
            const questions = stage ? stageQuestions[stage.id] || [] : [];

            if (currentScreen === "introduction") {
                return { ...prev, currentScreen: "stage-intro" };
            }

            if (currentScreen === "stage-intro") {
                return { ...prev, currentScreen: "question", questionIdx: 0 };
            }

            if (currentScreen === "question") {
                if (questionIdx < questions.length - 1) {
                    return { ...prev, questionIdx: questionIdx + 1 };
                } else {
                    return { ...prev, currentScreen: "stage-complete" };
                }
            }

            if (currentScreen === "stage-complete") {
                if (stageIdx < activeStages.length - 1) {
                    return { ...prev, stageIdx: stageIdx + 1, questionIdx: 0, currentScreen: "stage-intro" };
                } else {
                    return { ...prev, currentScreen: "review" };
                }
            }

            return prev;
        });
    }, [activeStages, stageQuestions]);

    const goBack = useCallback(() => {
        setState(prev => {
            const { currentScreen, stageIdx, questionIdx } = prev;
            const stage = activeStages[stageIdx];
            const questions = stage ? stageQuestions[stage.id] || [] : [];

            if (currentScreen === "stage-intro") {
                if (stageIdx > 0) {
                    return { ...prev, stageIdx: stageIdx - 1, currentScreen: "stage-complete" };
                } else {
                    return { ...prev, currentScreen: "introduction" };
                }
            }

            if (currentScreen === "question") {
                if (questionIdx > 0) {
                    return { ...prev, questionIdx: questionIdx - 1 };
                } else {
                    return { ...prev, currentScreen: "stage-intro" };
                }
            }

            if (currentScreen === "stage-complete") {
                return { ...prev, currentScreen: "question", questionIdx: questions.length - 1 };
            }

            if (currentScreen === "review") {
                return { ...prev, currentScreen: "stage-complete" };
            }

            return prev;
        });
    }, [activeStages, stageQuestions]);

    const setAnswer = (questionId: string, value: any) => {
        setState(prev => ({
            ...prev,
            answers: { ...prev.answers, [questionId]: value }
        }));
    };

    const handleSubmit = () => {
        setState(prev => ({ ...prev, currentScreen: "processing" }));
        setTimeout(() => {
            localStorage.setItem("247gbs_audit_completed", JSON.stringify({
                completedAt: new Date().toISOString(),
                auditType,
                sectorId,
                answers: state.answers
            }));
            localStorage.removeItem(STORAGE_KEY);
            setState(prev => ({ ...prev, currentScreen: "complete" }));
        }, 4000);
    };

    const handleEditStage = (stageIdx: number) => {
        setState(prev => ({
            ...prev,
            stageIdx,
            questionIdx: 0,
            currentScreen: "question"
        }));
    };

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 sm:pt-28">
                <Loader2 size={32} className="text-orange-500 animate-spin" />
            </div>
        );
    }

    // ==================== INTRODUCTION ====================
    if (state.currentScreen === "introduction") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="bg-slate-900 px-6 sm:px-10 py-8 sm:py-12 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <BarChart3 size={32} className="text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Business Audit</h1>
                            <p className="text-slate-400 text-sm sm:text-base">{auditType === "LONG_FORM" ? "Long" : "Short"} Business Audit</p>
                        </div>

                        <div className="px-6 sm:px-10 py-8 sm:py-10">
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-center mb-8">
                                This assessment will review different areas of your business. Each stage focuses on a specific aspect of your operations. Your answers help us identify opportunities, diagnose issues, and prepare the most appropriate recommendations for your business.
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 mb-1">Estimated Time</div>
                                    <div className="font-bold text-slate-900">{auditType === "LONG_FORM" ? "28" : "10"} min</div>
                                </div>
                                <div className="text-center border-x border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1">Stages</div>
                                    <div className="font-bold text-slate-900">{activeStages.length}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 mb-1">Questions</div>
                                    <div className="font-bold text-slate-900">~{totalQuestions}</div>
                                </div>
                            </div>

                            <button
                                onClick={goNext}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                Begin Assessment
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== STAGE INTRODUCTION ====================
    if (state.currentScreen === "stage-intro" && currentStage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
                <Navbar auditType={auditType} stageIdx={state.stageIdx} totalStages={activeStages.length} stageTitle={currentStage.title} />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                        <div className="p-6 sm:p-10 lg:p-14 text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-6"
                            >
                                {ICON_MAP[currentStage.icon] || <BarChart3 size={24} />}
                            </motion.div>

                            <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">
                                Stage {currentStage.number} of {activeStages.length}
                            </span>

                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                                {currentStage.title}
                            </h2>

                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-3">
                                {currentStage.description}
                            </p>

                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto mb-8">
                                {currentStage.purpose}
                            </p>

                            <button
                                onClick={goNext}
                                className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 mx-auto"
                            >
                                Continue
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ==================== QUESTION ====================
    if (state.currentScreen === "question" && currentQuestion) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
                <Navbar auditType={auditType} stageIdx={state.stageIdx} totalStages={activeStages.length} stageTitle={currentStage?.title || ""} />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                                Question {answeredCount + 1} of {totalQuestions}
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold text-orange-600 flex items-center gap-1">
                                <Clock size={12} /> ~{timeRemaining} min remaining
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <motion.div
                                className="bg-orange-500 h-1.5 rounded-full"
                                animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                        <div className="p-6 sm:p-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestion.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-tight">
                                        {currentQuestion.text}
                                    </h2>

                                    {currentQuestion.helpText && (
                                        <p className="text-sm text-slate-400 mb-6">{currentQuestion.helpText}</p>
                                    )}

                                    {!currentQuestion.helpText && <div className="mb-6" />}

                                    <QuestionInput
                                        question={currentQuestion}
                                        value={state.answers[currentQuestion.id]}
                                        onChange={(val) => setAnswer(currentQuestion.id, val)}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="px-6 sm:px-10 py-5 border-t border-slate-50 flex justify-between items-center">
                            <button
                                onClick={goBack}
                                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all"
                            >
                                <ChevronLeft size={14} />
                                Back
                            </button>

                            <button
                                onClick={goNext}
                                className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
                            >
                                Next
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ==================== STAGE COMPLETE ====================
    if (state.currentScreen === "stage-complete" && currentStage) {
        const nextStage = activeStages[state.stageIdx + 1];
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg"
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Stage Complete</h2>
                        <p className="text-slate-500 text-sm mb-6">{currentStage.title}</p>
                        <p className="text-green-600 font-bold text-sm mb-6">Completed Successfully</p>

                        {nextStage && (
                            <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Next Stage</p>
                                <p className="font-bold text-slate-900">{nextStage.title}</p>
                            </div>
                        )}

                        <button
                            onClick={goNext}
                            className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            Continue
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== REVIEW ====================
    if (state.currentScreen === "review") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
                <Navbar auditType={auditType} stageIdx={activeStages.length} totalStages={activeStages.length} stageTitle="Review" />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                        <div className="p-6 sm:p-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 text-center">Review Your Responses</h2>
                            <p className="text-slate-500 text-sm text-center mb-8">Check your answers before submitting.</p>

                            <div className="space-y-3">
                                {activeStages.map((stage, i) => {
                                    const questions = stageQuestions[stage.id] || [];
                                    const answered = questions.filter(q => state.answers[q.id] !== undefined).length;
                                    return (
                                        <div key={stage.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <CheckCircle2 size={16} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">Stage {stage.number}: {stage.title}</div>
                                                    <div className="text-xs text-slate-400">{answered} of {questions.length} questions answered</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleEditStage(i)}
                                                className="text-orange-500 hover:text-orange-600 font-bold text-xs flex items-center gap-1 transition-colors"
                                            >
                                                <Edit3 size={14} />
                                                Edit
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="px-6 sm:px-10 py-5 border-t border-slate-50 flex justify-between items-center">
                            <button
                                onClick={goBack}
                                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all"
                            >
                                <ChevronLeft size={14} />
                                Back
                            </button>

                            <button
                                onClick={() => goToScreen("confirmation")}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
                            >
                                Submit Audit
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ==================== CONFIRMATION ====================
    if (state.currentScreen === "confirmation") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg"
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield size={32} className="text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to Submit</h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-8">
                            You have completed your Business Audit. Your responses will now be analysed to produce a detailed business diagnosis and a tailored set of recommended solutions.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => goToScreen("review")}
                                className="flex-1 border-2 border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold text-sm hover:border-slate-300 transition-all"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                Submit Audit
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== PROCESSING ====================
    if (state.currentScreen === "processing") {
        const checks = [
            "Business Profile",
            "Business Sector",
            "Audit Responses",
            "Business Health Indicators",
            "Operational Risks",
            "Growth Opportunities",
            "Inventory Position",
            "Customer Performance",
            "Marketing Effectiveness",
            "Operational Efficiency",
            "Technology Readiness"
        ];

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg"
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Loader2 size={32} className="text-orange-500 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Analysing Your Business</h2>
                            <p className="text-slate-500 text-sm">Please wait while we process your audit responses.</p>
                        </div>

                        <div className="space-y-2.5">
                            {checks.map((check, i) => (
                                <motion.div
                                    key={check}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.3 }}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.3 + 0.2 }}
                                    >
                                        <CheckCircle2 size={16} className="text-green-500" />
                                    </motion.div>
                                    <span className="text-slate-600">{check}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== COMPLETE ====================
    if (state.currentScreen === "complete") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg"
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Audit Complete</h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-8">
                            Your Business Audit has been submitted successfully. Your responses are being analysed and your Business Diagnosis will be available shortly.
                        </p>

                        <button
                            onClick={() => {
                                localStorage.removeItem(STORAGE_KEY);
                                router.push("/dashboard");
                            }}
                            className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            Return to Dashboard
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return null;
}

// ============================================================
// NAVBAR
// ============================================================

function Navbar({ auditType, stageIdx, totalStages, stageTitle }: {
    auditType: AuditType;
    stageIdx: number;
    totalStages: number;
    stageTitle: string;
}) {
    return (
        <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                    <div className="font-bold text-slate-900 text-sm tracking-tight">247GBS Audit</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        {auditType === "LONG_FORM" ? "Long" : "Short"} Audit
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs font-bold text-slate-900">Stage {Math.min(stageIdx + 1, totalStages)} of {totalStages}</div>
                <div className="text-[10px] text-slate-400">{stageTitle}</div>
            </div>
        </nav>
    );
}

// ============================================================
// QUESTION INPUT
// ============================================================

function QuestionInput({ question, value, onChange }: {
    question: Question;
    value: any;
    onChange: (val: any) => void;
}) {
    switch (question.type) {
        case "multiple-choice":
            return <MultipleChoice question={question} value={value} onChange={onChange} />;
        case "multi-select":
            return <MultiSelect question={question} value={value} onChange={onChange} />;
        case "rating":
            return <RatingScale question={question} value={value} onChange={onChange} />;
        case "number":
            return <NumberInput question={question} value={value} onChange={onChange} />;
        case "percentage":
            return <PercentageInput question={question} value={value} onChange={onChange} />;
        case "currency":
            return <CurrencyInput question={question} value={value} onChange={onChange} />;
        case "text":
            return <TextInput question={question} value={value} onChange={onChange} />;
        case "long-text":
            return <LongTextInput question={question} value={value} onChange={onChange} />;
        case "boolean":
            return <BooleanInput question={question} value={value} onChange={onChange} />;
        default:
            return <MultipleChoice question={question} value={value} onChange={onChange} />;
    }
}

function MultipleChoice({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    return (
        <div className="grid gap-3">
            {question.options?.map(opt => (
                <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChange(opt.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        value === opt.id
                            ? "bg-white border-orange-500 shadow-[0_8px_30px_rgb(249,115,22,0.12)]"
                            : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                    }`}
                >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        value === opt.id ? "border-orange-500" : "border-slate-300"
                    }`}>
                        {value === opt.id && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-slate-900">{opt.label}</div>
                        {opt.sub && <div className="text-xs text-slate-400 mt-0.5">{opt.sub}</div>}
                    </div>
                </motion.button>
            ))}
        </div>
    );
}

function MultiSelect({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    const selected: string[] = value || [];
    const toggle = (id: string) => {
        if (id === "none") {
            onChange(["none"]);
            return;
        }
        const next = selected.includes(id)
            ? selected.filter(s => s !== id)
            : [...selected.filter(s => s !== "none"), id];
        onChange(next);
    };

    return (
        <div className="grid gap-3">
            {question.options?.map(opt => {
                const isSelected = selected.includes(opt.id);
                return (
                    <motion.button
                        key={opt.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggle(opt.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                            isSelected
                                ? "bg-white border-orange-500 shadow-[0_8px_30px_rgb(249,115,22,0.12)]"
                                : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                        }`}
                    >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? "border-orange-500 bg-orange-500" : "border-slate-300"
                        }`}>
                            {isSelected && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-slate-900">{opt.label}</div>
                            {opt.sub && <div className="text-xs text-slate-400 mt-0.5">{opt.sub}</div>}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

function RatingScale({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    const min = question.min || 1;
    const max = question.max || 5;
    const options = question.options || [];

    return (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {options.map(opt => (
                <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onChange(opt.id)}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                        value === opt.id
                            ? "border-orange-500 bg-orange-50 shadow-lg"
                            : "border-slate-100 hover:border-slate-300"
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        value === opt.id
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-600"
                    }`}>
                        {opt.value || opt.id}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-center leading-tight">{opt.label}</span>
                </motion.button>
            ))}
        </div>
    );
}

function NumberInput({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    return (
        <div className="flex items-center gap-4">
            <button
                onClick={() => onChange(Math.max(0, (value || 0) - 1))}
                className="w-12 h-12 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-300 transition-colors font-bold text-xl"
            >
                -
            </button>
            <input
                type="number"
                value={value ?? ""}
                onChange={(e) => onChange(Number(e.target.value))}
                placeholder={question.placeholder || "0"}
                className="flex-1 text-center text-2xl font-bold text-slate-900 py-3 border-b-2 border-slate-200 focus:border-orange-500 outline-none transition-colors bg-transparent"
            />
            <button
                onClick={() => onChange((value || 0) + 1)}
                className="w-12 h-12 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-300 transition-colors font-bold text-xl"
            >
                +
            </button>
        </div>
    );
}

function PercentageInput({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    return (
        <div className="flex items-center gap-3">
            <input
                type="number"
                min={0}
                max={100}
                value={value ?? ""}
                onChange={(e) => onChange(Number(e.target.value))}
                placeholder={question.placeholder || "0"}
                className="flex-1 text-center text-2xl font-bold text-slate-900 py-3 border-b-2 border-slate-200 focus:border-orange-500 outline-none transition-colors bg-transparent"
            />
            <span className="text-2xl font-bold text-slate-400">%</span>
        </div>
    );
}

function CurrencyInput({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-400">£</span>
            <input
                type="number"
                min={0}
                value={value ?? ""}
                onChange={(e) => onChange(Number(e.target.value))}
                placeholder={question.placeholder || "0"}
                className="flex-1 text-center text-2xl font-bold text-slate-900 py-3 border-b-2 border-slate-200 focus:border-orange-500 outline-none transition-colors bg-transparent"
            />
        </div>
    );
}

function TextInput({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    return (
        <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Type your answer..."}
            className="w-full text-base text-slate-900 py-3 px-4 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-colors"
        />
    );
}

function LongTextInput({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    return (
        <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Type your answer..."}
            rows={4}
            className="w-full text-base text-slate-900 py-3 px-4 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none transition-colors resize-none"
        />
    );
}

function BooleanInput({ question, value, onChange }: { question: Question; value: any; onChange: (v: any) => void }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {[
                { id: "yes", label: "Yes" },
                { id: "no", label: "No" }
            ].map(opt => (
                <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChange(opt.id)}
                    className={`py-4 rounded-2xl border-2 font-bold text-base transition-all ${
                        value === opt.id
                            ? opt.id === "yes"
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                >
                    {opt.label}
                </motion.button>
            ))}
        </div>
    );
}
