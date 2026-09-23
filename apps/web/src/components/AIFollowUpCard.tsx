/**
 * AI Follow-Up Card Component
 * 
 * Displays optional clarification questions from Gemini AI.
 * 
 * UI RULES:
 * - Presented as "Optional Clarifications to Improve Accuracy"
 * - Max 3 questions displayed
 * - Skip button is always available (non-blocking)
 * - Feels consultant-grade, not chatty
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    HelpCircle,
    ChevronRight,
    SkipForward,
    Loader2,
    Sparkles
} from "lucide-react";
import type { AIFollowUpQuestion } from "@/types/aiTypes";

interface AIFollowUpCardProps {
    questions: AIFollowUpQuestion[];
    isLoading: boolean;
    onSubmit: (answers: Record<string, string>) => void;
    onSkip: () => void;
}

export default function AIFollowUpCard({
    questions,
    isLoading,
    onSubmit,
    onSkip
}: AIFollowUpCardProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleAnswerChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        onSubmit(answers);
    };

    // Loading state
    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center">
                        <Loader2 className="text-slate-400 animate-spin" size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                            Intelligence Engine
                        </div>
                        <div className="font-bold text-slate-600">
                            Evaluating audit data...
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // No questions — nothing to render
    if (!questions || questions.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-lg"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                            Optional Clarifications
                        </div>
                        <div className="font-bold text-slate-900 text-lg">
                            Improve Accuracy
                        </div>
                    </div>
                </div>
                <button
                    onClick={onSkip}
                    className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                >
                    Skip <SkipForward size={14} />
                </button>
            </div>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                These brief clarifications can improve the precision of your recommendations.
                They are <strong className="text-slate-700">optional</strong> — you may skip and continue.
            </p>

            {/* Questions */}
            <div className="space-y-6 mb-8">
                {questions.map((q, idx) => (
                    <div
                        key={q.id}
                        className="p-6 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                                {idx + 1}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 leading-relaxed">
                                    {q.question}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-2 ">
                                    Why: {q.reason}
                                </p>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Your response (optional)"
                            value={answers[q.id] || ""}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={handleSubmit}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-3"
                >
                    Continue with Answers
                    <ChevronRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}
