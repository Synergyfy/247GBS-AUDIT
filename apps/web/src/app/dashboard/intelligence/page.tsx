"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Zap,
    BrainCircuit,
    Bot,
    ShieldAlert,
    ArrowUpRight,
    Search,
    ChevronDown,
    Activity,
    Target,
    Layers
} from "lucide-react";
import useIntelligence from "@/services/dashboard/intelligence/hooks";
import type { IntelligenceResponse } from "@/services/dashboard/intelligence/types";

export default function ForensicIntelligencePage() {
    const { data, loading, error } = useIntelligence();

    const strategicInsight = data?.strategicInsight || "Initialize a forensic audit to unlock systemic AI insights.";
    const keyMetrics = data?.keyMetrics || [
        { label: "Audit Accuracy", value: "...", color: "slate" },
        { label: "Data Points", value: "0", color: "slate" },
        { label: "Risk Level", value: "Calculating", color: "slate" },
        { label: "Rank", value: "-", color: "slate" },
    ];
    const trajectory = data?.trajectory?.dataPoints || new Array(12).fill(0);
    const efficiencyBreakdown = data?.efficiencyBreakdown || [];
    const maxRecoveryTarget = data?.maxRecoveryTarget || 0;
    const marketRank = data?.marketRank || "-";

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Strategic <span className="text-orange-500">Insights</span></h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium">Cross-review analysis and AI-driven growth forecasting.</p>
                </div>
                <div className="w-full md:w-auto bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis Mode</div>
                        <div className="text-sm font-bold text-slate-900">Total Business View</div>
                    </div>
                </div>
            </div>

            {/* AI Reasoning Panel (The "Brain") */}
            <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 lg:p-14 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
                    <BrainCircuit size={240} />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                    <div className="space-y-6 md:space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-xs font-bold uppercase tracking-widest">
                            <Bot size={16} />
                            Key Business Insight
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                            {loading ? 'Loading insight…' : strategicInsight.replace('forensic audit', 'business review')}
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white rounded-[1.2rem] md:rounded-[1.5rem] font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                                View Deep Analysis
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-[1.2rem] md:rounded-[1.5rem] font-bold hover:bg-white/10 transition-all active:scale-95">
                                Adjust Goals
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        {keyMetrics.map((metric, i) => (
                            <div key={metric.label} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-2xl md:rounded-3xl">
                                <div className="text-xl md:text-2xl font-bold mb-1">{metric.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{metric.label.replace('Audit Accuracy', 'Review Accuracy')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                {/* Main Trend Chart (Responsive) */}
                <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-10 text-slate-400">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                            <TrendingUp className="text-orange-500" size={20} />
                            Growth Trend
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                            Last 12 Months <ChevronDown size={14} />
                        </div>
                    </div>

                    {/* Chart Visualization with Scroll */}
                    <div className="relative">
                        <div className="overflow-x-auto pb-8 -mx-2 px-2 scrollbar-hide no-scrollbar">
                            <div className="min-w-[600px] h-64 flex items-end justify-between gap-3 px-4">
                                {trajectory.map((height, i) => (
                                    <div key={i} className="flex-1 group relative">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ delay: i * 0.05 + 0.5, duration: 1 }}
                                            className={`w-full rounded-t-lg md:rounded-t-xl transition-all duration-300 ${i === 11 ? 'bg-orange-500' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                                        />
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            M{i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-10">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Actualized</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-200">
                            <span className="w-3 h-3 rounded-full bg-slate-100" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Baseline</span>
                        </div>
                    </div>
                </div>

                {/* Efficiency Breakdown */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm h-full">
                        <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3 text-slate-400">
                            <Layers className="text-orange-500" size={20} />
                            Lost Revenue Potential
                        </h3>
                        <div className="space-y-8">
                            {efficiencyBreakdown.length > 0 ? (
                                efficiencyBreakdown.map((cat, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-slate-500">{cat.label}</span>
                                            <span className="text-slate-900">{cat.value}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cat.value}%` }}
                                                transition={{ delay: i * 0.1 + 1, duration: 1.5, ease: "easeOut" }}
                                                className={`${cat.color} h-full rounded-full shadow-sm`}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                                        <Layers size={24} />
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest ">Waiting for Data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Growth Potential Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-orange-50 rounded-[2.5rem] p-10 border border-orange-100/50 flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-orange-200 flex items-center justify-center text-orange-500 mb-6">
                        <Target size={32} />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-600 mb-2">Maximum Profit Target</h4>
                    <div className="text-5xl font-bold text-slate-900 mb-4">£{(maxRecoveryTarget || 0).toLocaleString()}</div>
                    <p className="text-sm text-slate-500 font-medium max-w-xs ">Based on full adoption of all Strategic Recommendations and market trend alignment.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Market Sector Rank</h4>
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-6xl font-bold text-slate-900">{marketRank}</span>
                            <span className="text-xl font-bold text-slate-300 mb-2">/ 100</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} className="text-green-500" />
                            Top 15% in sector profit recovery
                        </p>
                    </div>
                    <button className="w-full py-4 mt-8 rounded-2xl border-2 border-slate-100 font-bold text-xs uppercase tracking-widest text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-all">
                        Compare with Peers
                    </button>
                </div>
            </div>
        </div>
    );
}
