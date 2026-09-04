/**
 * AI Insight Card Component
 * 
 * Displays structured AI-generated insights in a premium format.
 * 
 * UI RULES (per master prompt):
 * - NO "AI says..." labels
 * - NO chat bubbles
 * - NO raw text dumps
 * - Feels like SYSTEM INTELLIGENCE, not a bot
 */

"use client";

import { motion } from "framer-motion";
import {
    Lightbulb,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    RefreshCw
} from "lucide-react";
import type { AIInsightResponse } from "@/types/aiTypes";

interface AIInsightCardProps {
    insight: AIInsightResponse | null;
    isLoading: boolean;
    isFallback?: boolean;
    onRetry?: () => void;
}

export default function AIInsightCard({
    insight,
    isLoading,
    isFallback,
    onRetry
}: AIInsightCardProps) {

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                        <Loader2 className="text-orange-500 animate-spin" size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                            Intelligence Engine
                        </div>
                        <div className="font-bold text-white">
                            Analyzing audit data...
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                            className="h-1 flex-1 bg-orange-500/30 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        );
    }

    if (!insight) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Strategic Insight
                        </div>
                        <div className="font-bold text-white text-lg">
                            Opportunity Analysis
                        </div>
                    </div>
                </div>
                {isFallback && onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-slate-500 hover:text-orange-500 transition-colors"
                        title="Retry AI analysis"
                    >
                        <RefreshCw size={18} />
                    </button>
                )}
            </div>

            {/* Key Issue */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-orange-500 mb-3">
                    <AlertTriangle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Primary Issue</span>
                </div>
                <p className="text-xl font-bold leading-relaxed">
                    {insight.keyIssue}
                </p>
            </div>

            {/* Business Explanation */}
            <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                <p className="text-slate-300 leading-relaxed font-medium">
                    {insight.businessExplanation}
                </p>
            </div>

            {/* Estimated Impact */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <TrendingUp className="text-orange-500 shrink-0" size={20} />
                <p className="text-orange-100 font-bold text-sm">
                    {insight.estimatedImpact}
                </p>
            </div>

            {/* Recommendations */}
            <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
                    Recommended Actions
                </div>
                <div className="space-y-3">
                    {(insight.recommendations || []).filter(Boolean).map((rec, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-3 p-4 bg-white/5 rounded-xl"
                        >
                            <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-slate-200 font-medium text-sm">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
