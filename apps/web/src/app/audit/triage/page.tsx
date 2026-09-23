"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Clock,
    CheckCircle2,
    Check,
    ArrowRight,
    AlertCircle,
    Loader2,
    LogIn,
    UserPlus,
    X,
    Bookmark,
    GitBranch
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchTriageQuestion, fetchTriageStart } from "@/services/triage/flow";
import type { TriagePublicAnswer, TriagePublicQuestion } from "@/services/triage/types";
import { isChoiceType, isMultiSelectType } from "@/services/triage/types";
import { QuestionInput } from "@/components/preAudit/QuestionInput";
import { validateAnswer } from "@/lib/preAudit/validation";

type TriageAuditType = "SHORT_FORM" | "LONG_FORM";

interface TriageResponse {
    questionId: string;
    questionText: string;
    answerId: string;
    answerText: string;
    auditType: TriageAuditType | null;
}

type Phase = "loading" | "question" | "result" | "error";

const PROGRESS_KEY = "247gbs_triage_progress";
const RESULT_KEY = "247gbs_triage_result";
const MAX_STEPS = 50;

function getAuditTitle(auditType: TriageAuditType): string {
    return auditType === "LONG_FORM" ? "Long Business Audit" : "Short Business Audit";
}

function getExplanation(auditType: TriageAuditType): string {
    if (auditType === "LONG_FORM") {
        return "Your responses indicate that your business would benefit from a more comprehensive assessment covering multiple operational areas. A Long Business Audit will provide deeper analysis and a detailed recovery roadmap.";
    }
    return "Based on your responses, a focused assessment will effectively identify your key opportunities. A Short Business Audit will deliver clear, actionable insights efficiently.";
}

export default function AuditTriagePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [phase, setPhase] = useState<Phase>("loading");
    const [question, setQuestion] = useState<TriagePublicQuestion | null>(null);
    const [responses, setResponses] = useState<TriageResponse[]>([]);
    const [visitedIds, setVisitedIds] = useState<string[]>([]);
    const [assignedAudit, setAssignedAudit] = useState<TriageAuditType | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [hydrated, setHydrated] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [multiSelection, setMultiSelection] = useState<string[]>([]);
    const [typedValue, setTypedValue] = useState<unknown>(null);
    const [answerError, setAnswerError] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    // ==================== FLOW CONTROL ====================

    const resetDraft = useCallback(() => {
        setMultiSelection([]);
        setTypedValue(null);
        setAnswerError(null);
    }, []);

    const startFlow = useCallback(async () => {
        setPhase("loading");
        setErrorMessage(null);
        setResponses([]);
        setVisitedIds([]);
        setIsSelecting(false);
        resetDraft();
        try {
            const first = await fetchTriageStart();
            setQuestion(first);
            setPhase("question");
        } catch (err: any) {
            setErrorMessage(err?.message ?? "Failed to load the Business Triage. Please try again.");
            setPhase("error");
        }
    }, [resetDraft]);

    const goToQuestion = useCallback(async (targetQuestion: TriagePublicQuestion) => {
        setQuestion(targetQuestion);
        setPhase("question");
        setIsSelecting(false);
        resetDraft();
    }, [resetDraft]);

    // Restore progress on mount
    useEffect(() => {
        const saved = localStorage.getItem(PROGRESS_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (
                    parsed?.type === "triage_dynamic" &&
                    Array.isArray(parsed.visitedIds) &&
                    parsed.visitedIds.length > 0
                ) {
                    setVisitedIds(parsed.visitedIds);
                    setResponses(Array.isArray(parsed.responses) ? parsed.responses : []);
                    if (parsed.question) {
                        setQuestion(parsed.question);
                        setPhase("question");
                    } else {
                        startFlow();
                    }
                } else {
                    startFlow();
                }
            } catch {
                startFlow();
            }
        } else {
            startFlow();
        }
        setHydrated(true);
    }, [startFlow]);

    // Save progress whenever the current step changes
    useEffect(() => {
        if (!hydrated) return;
        if (phase === "loading" || phase === "result" || phase === "error") return;
        localStorage.setItem(
            PROGRESS_KEY,
            JSON.stringify({
                type: "triage_dynamic",
                question,
                visitedIds,
                responses,
            })
        );
    }, [hydrated, phase, question, visitedIds, responses]);

    // Completes the triage: writes the result and shows the result screen.
    const finalize = (auditType: TriageAuditType, stepResponses: TriageResponse[]) => {
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.setItem(
            RESULT_KEY,
            JSON.stringify({
                assignedAudit: auditType,
                completedAt: new Date().toISOString(),
                responses: stepResponses,
            })
        );
        setResponses(stepResponses);
        setIsSelecting(false);
        setAssignedAudit(auditType);
        setPhase("result");
    };

    const advance = async (
        stepResponses: TriageResponse[],
        auditType: TriageAuditType | null,
        nextQuestionId: string | null
    ) => {
        setResponses(stepResponses);

        if (auditType) {
            finalize(auditType, stepResponses);
            return;
        }

        if (nextQuestionId) {
            if (visitedIds.includes(nextQuestionId)) {
                setErrorMessage("This triage appears to loop back to a question you have already answered. It may not be configured correctly.");
                setPhase("error");
                return;
            }
            if (visitedIds.length >= MAX_STEPS) {
                setErrorMessage("This triage has too many steps and may not be configured correctly.");
                setPhase("error");
                return;
            }
            try {
                const next = await fetchTriageQuestion(nextQuestionId);
                setVisitedIds((prev) => [...prev, question!.id]);
                await goToQuestion(next);
            } catch (err: any) {
                setErrorMessage(err?.message ?? "Could not load the next question. Please try again.");
                setPhase("error");
            }
            return;
        }

        setErrorMessage("This answer has no destination configured. Please contact support.");
        setPhase("error");
    };

    const handleSelect = async (answer: TriagePublicAnswer) => {
        if (!question || isSelecting) return;
        setIsSelecting(true);

        const stepResponses = [
            ...responses,
            {
                questionId: question.id,
                questionText: question.text,
                answerId: answer.id,
                answerText: answer.text,
                auditType: answer.auditType as TriageAuditType | null,
            },
        ];
        resetDraft();
        await advance(stepResponses, answer.auditType as TriageAuditType | null, answer.nextQuestionId);
    };

    const handleMulti = async () => {
        if (!question || isSelecting || multiSelection.length === 0) return;
        const chosen = question.answers.filter((a) => multiSelection.includes(a.id));
        const destinations = new Set(
            chosen.map((a) => `${a.nextQuestionId ?? ""}|${a.auditType ?? ""}`)
        );
        if (destinations.size > 1) {
            setAnswerError(
                "These selections can't be combined because they lead to different next steps. Please choose again."
            );
            return;
        }
        setIsSelecting(true);
        const first = chosen[0];
        const stepResponses = [
            ...responses,
            {
                questionId: question.id,
                questionText: question.text,
                answerId: chosen.map((a) => a.id).join("|"),
                answerText: chosen.map((a) => a.text).join(", "),
                auditType: first.auditType as TriageAuditType | null,
            },
        ];
        setAnswerError(null);
        setMultiSelection([]);
        await advance(stepResponses, first.auditType as TriageAuditType | null, first.nextQuestionId);
    };

    const handleTyped = async () => {
        if (!question || isSelecting) return;
        const result = validateAnswer(question, typedValue);
        if (!result.ok) {
            setAnswerError(result.message);
            return;
        }
        setIsSelecting(true);
        const display = typedValue === null || typedValue === undefined || typedValue === ""
            ? ""
            : String(typedValue);
        const stepResponses = [
            ...responses,
            {
                questionId: question.id,
                questionText: question.text,
                answerId: "",
                answerText: display,
                auditType: question.defaultAuditType as TriageAuditType | null,
            },
        ];
        setAnswerError(null);
        setTypedValue(null);
        await advance(stepResponses, question.defaultAuditType as TriageAuditType | null, question.defaultNextQuestionId);
    };

    const handleBack = () => {
        if (phase === "loading") return;
        if (visitedIds.length === 0) {
            router.push("/audit/welcome");
            return;
        }
        // The previous question's id is the last visited id.
        const previousId = visitedIds[visitedIds.length - 1];
        setVisitedIds((prev) => prev.slice(0, -1));
        const previousResponses = responses.slice(0, -1);
        const previousResponse = previousResponses[previousResponses.length - 1];
        setResponses(previousResponses);
        if (previousResponse && previousResponse.answerId.includes("|")) {
            setMultiSelection(previousResponse.answerId.split("|"));
        } else {
            setMultiSelection([]);
        }
        setTypedValue(previousResponse?.answerText && !previousResponse.answerId ? previousResponse.answerText : null);
        setAnswerError(null);
        fetchTriageQuestion(previousId)
            .then(goToQuestion)
            .catch(() => {
                setErrorMessage("Could not return to the previous question.");
                setPhase("error");
            });
    };

    const handleContinueLater = () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }
        setShowSavedToast(true);
        setTimeout(() => {
            router.push("/dashboard");
        }, 1200);
    };

    // ==================== RESULT SCREEN ====================
    if (phase === "result") {
        const auditType = assignedAudit ?? "SHORT_FORM";
        const isLong = auditType === "LONG_FORM";

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-slate-900 px-6 sm:px-10 py-8 sm:py-12 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={32} className="text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                                Business Triage Complete
                            </h1>
                            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
                                Thank you for completing your Business Triage.
                            </p>
                        </div>

                        <div className="px-6 sm:px-10 py-8 sm:py-10">
                            <p className="text-slate-600 text-sm sm:text-base text-center mb-8">
                                Based on your responses, we have identified the most appropriate audit for your business.
                            </p>

                            {/* Assigned Audit Card */}
                            <div className={`border-2 rounded-2xl p-6 sm:p-8 mb-6 ${isLong ? "border-orange-500 bg-orange-50" : "border-blue-500 bg-blue-50"}`}>
                                <div className="text-center">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                        Recommended Audit
                                    </span>
                                    <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${isLong ? "text-orange-600" : "text-blue-600"}`}>
                                        {getAuditTitle(auditType)}
                                    </h2>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Estimated Time</div>
                                            <div className="font-bold text-slate-900">{isLong ? "30 min" : "10 min"}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Stages</div>
                                            <div className="font-bold text-slate-900">{isLong ? "10" : "6"}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Questions</div>
                                            <div className="font-bold text-slate-900">~{isLong ? "60" : "20"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation */}
                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 mb-8">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {getExplanation(auditType)}
                                </p>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => router.push(`/audit/flow?type=${auditType}`)}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                Start {isLong ? "Large" : "Short"} Audit
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    markAssessmentCompleted();
                                    router.push("/dashboard");
                                }}
                                className="w-full mt-3 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                Continue to My Audit Dashboard
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== ERROR SCREEN ====================
    if (phase === "error") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 text-center"
                >
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                        We couldn&apos;t start the Business Triage
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                        {errorMessage ?? "Something went wrong while loading the Business Triage."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={startFlow}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                        >
                            <ArrowRight size={16} />
                            Try Again
                        </button>
                        <Link
                            href="/audit/welcome"
                            className="flex-1 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        >
                            Back to Welcome
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== LOADING SCREEN ====================
    if (phase === "loading" || !question) {
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
                        Loading Your Business Triage
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        Please wait while we prepare your first question.
                    </p>
                    <div className="mt-8 flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-orange-500 rounded-full"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== TRIAGE QUESTION ====================
    const answeredCount = responses.length;
    const progressPct = Math.min(95, answeredCount * 12);
    const estimatedMinutes = Math.max(1, Math.ceil((answeredCount + 1) * 0.4));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 text-sm tracking-tight">247GBS Audit</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Business Check</div>
                    </div>
                </div>
                <div className="relative" ref={navRef}>
                    <button
                        onClick={() => {}}
                        className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Progress Header */}
                <div className="mb-6 sm:mb-10">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900">Business Triage</h2>
                        <span className="text-[10px] sm:text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                            Question {answeredCount + 1}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                        <motion.div
                            className="bg-orange-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                        <span>{answeredCount} answered {answeredCount === 1 ? "question" : "questions"}</span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            ~{estimatedMinutes} min elapsed
                        </span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 relative z-10 overflow-hidden">
                    <div className="p-6 sm:p-10 lg:p-14">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Stage label */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                                        <GitBranch size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Business Triage</span>
                                </div>

                                {/* Question */}
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 leading-tight">
                                    {question.text}
                                </h2>

                                {question.description && (
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 -mt-2">
                                        {question.description}
                                    </p>
                                )}

                                {!isChoiceType(question.type) ? (
                                    <div className="space-y-4" role="group" aria-label="Question input">
                                        <QuestionInput
                                            question={question}
                                            value={typedValue}
                                            disabled={isSelecting}
                                            error={answerError}
                                            onChange={(value) => {
                                                setTypedValue(value);
                                                if (answerError) setAnswerError(null);
                                            }}
                                        />
                                        {answerError && (
                                            <p role="alert" className="text-sm text-red-600 font-medium">
                                                {answerError}
                                            </p>
                                        )}
                                    </div>
                                ) : isMultiSelectType(question.type) ? (
                                    <div className="grid gap-3 sm:gap-4" role="group" aria-label="Select all that apply">
                                        {question.answers.map((opt) => {
                                            const selected = multiSelection.includes(opt.id);
                                            return (
                                                <motion.button
                                                    key={opt.id}
                                                    whileHover={{ scale: 1.01, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    disabled={isSelecting}
                                                    aria-pressed={selected}
                                                    onClick={() =>
                                                        setMultiSelection((prev) =>
                                                            prev.includes(opt.id)
                                                                ? prev.filter((id) => id !== opt.id)
                                                                : [...prev, opt.id]
                                                        )
                                                    }
                                                    className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left disabled:opacity-60 ${
                                                        selected
                                                            ? "bg-orange-50 border-orange-400 shadow-lg shadow-orange-100"
                                                            : "bg-white border-slate-100 hover:border-orange-300 hover:shadow-lg hover:shadow-slate-200/50"
                                                    }`}
                                                >
                                                    <div className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400"}`}>
                                                        <Check size={18} />
                                                    </div>
                                                    <div className={`relative z-10 font-bold text-base sm:text-lg leading-tight ${selected ? "text-orange-700" : "text-slate-900"}`}>
                                                        {opt.text}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                        {answerError && (
                                            <p role="alert" className="text-sm text-red-600 font-medium">
                                                {answerError}
                                            </p>
                                        )}
                                    </div>
                                ) : question.answers.length === 0 ? (
                                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                                        <p className="text-sm text-slate-500 font-medium">
                                            No answer options are available for this question yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 sm:gap-4">
                                        {question.answers.map((opt) => (
                                            <motion.button
                                                key={opt.id}
                                                whileHover={{ scale: 1.01, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={isSelecting}
                                                onClick={() => handleSelect(opt)}
                                                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden disabled:opacity-60 bg-white border-slate-100 hover:border-orange-300 hover:shadow-lg hover:shadow-slate-200/50"
                                            >
                                                <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 bg-slate-50 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500">
                                                    <ArrowRight size={18} />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="font-bold text-base sm:text-lg leading-tight transition-colors duration-300 group-hover:text-orange-600 text-slate-900">
                                                        {opt.text}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-6 sm:px-10 py-5 sm:py-6 border-t border-slate-50 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all"
                        >
                            <ChevronLeft size={14} />
                            {answeredCount === 0 ? "Exit" : "Back"}
                        </button>

                        <button
                            onClick={handleContinueLater}
                            className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 px-4 py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all"
                        >
                            <Bookmark size={12} />
                            Continue Later
                        </button>

                        {(isMultiSelectType(question.type) || !isChoiceType(question.type)) && (
                            <button
                                onClick={() =>
                                    void (isMultiSelectType(question.type) ? handleMulti() : handleTyped())
                                }
                                disabled={isSelecting || (isMultiSelectType(question.type) && multiSelection.length === 0)}
                                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                            >
                                Continue
                                <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Saved Toast */}
                <AnimatePresence>
                    {showSavedToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
                        >
                            <CheckCircle2 size={18} className="text-green-400" />
                            <span className="font-bold text-sm">Progress saved! Redirecting to dashboard…</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Auth Prompt Modal — for unauthenticated users */}
                <AnimatePresence>
                    {showAuthModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowAuthModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                            >
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors z-10"
                                >
                                    <X size={16} />
                                </button>
                                <div className="bg-slate-900 px-6 sm:px-8 py-6 sm:py-8 text-center">
                                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Bookmark size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                        Save Your Progress
                                    </h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                        Sign in or create an account to save your triage progress and continue anytime.
                                    </p>
                                </div>
                                <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-3">
                                    <Link
                                        href="/auth/signin?callbackUrl=/audit/triage"
                                        className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <LogIn size={18} />
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/signup?callbackUrl=/audit/triage"
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <UserPlus size={18} />
                                        Create Account
                                    </Link>
                                    <p className="text-[10px] sm:text-xs text-slate-400 text-center pt-2 leading-relaxed">
                                        Your answers are saved locally on this device. Sign in to sync your progress across devices.
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function markAssessmentCompleted() {
    localStorage.setItem("247gbs_assessment_completed", "true");
}