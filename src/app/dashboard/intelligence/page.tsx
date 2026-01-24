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
import type { SavedAudit } from "@/types/audit";

export default function ForensicIntelligencePage() {
    const [audits, setAudits] = useState<SavedAudit[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("saved_audits");
        if (saved) {
            setAudits(JSON.parse(saved));
        }
    }, []);

    // Mock aggregate data
    const totalPotential = audits.reduce((acc, a) => acc + a.metrics.annualRecovery, 0);
    const avgScore = audits.length > 0
        ? Math.round(audits.reduce((acc, a) => acc + a.metrics.impactScore, 0) / audits.length)
        : 0;

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Forensic <span className="text-orange-500">Intelligence</span></h1>
                    <p className="text-slate-500 font-medium">Cross-audit analysis and AI-driven growth forecasting.</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis Mode</div>
                        <div className="text-sm font-bold text-slate-900">Multi-Audit Aggregation</div>
                    </div>
                </div>
            </div>

            {/* AI Reasoning Panel (The "Brain") */}
            <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
                    <BrainCircuit size={240} />
                </div>

                <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-xs font-black uppercase tracking-widest">
                            <Bot size={16} />
                            Strategic AI Insight
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black leading-tight">
                            "Aggregated data suggests a systemic <span className="text-orange-500 underline underline-offset-8 decoration-white/10">Under-Recovery Pattern</span> in your Hospitality Sector."
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Our engine has detected that since your last 3 audits, though revenue is up, efficiency leak has increased by **4.2%**. This indicates growth is being achieved through resource brute-force rather than optimization.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-orange-500 text-white rounded-[1.5rem] font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                                View Deep Analysis
                            </button>
                            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black hover:bg-white/10 transition-all">
                                Adjust Benchmarks
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: "Confidence", value: "94%", color: "orange" },
                            { label: "Data Quality", value: "High", color: "green" },
                            { label: "Risk Level", value: "Low", color: "blue" },
                            { label: "Next Action", value: "Optimize", color: "orange" },
                        ].map((metric, i) => (
                            <div key={metric.label} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                                <div className="text-2xl font-black mb-1">{metric.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid lg:grid-cols-7 gap-8">
                {/* Main Trend Chart (Placeholder) */}
                <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-10 text-slate-400">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                            <TrendingUp className="text-orange-500" size={20} />
                            Recovery Trajectory
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            Last 12 Months <ChevronDown size={14} />
                        </div>
                    </div>

                    {/* Mock Chart Visualization */}
                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {[40, 60, 45, 70, 85, 65, 90, 100, 80, 95, 110, 120].map((height, i) => (
                            <div key={i} className="flex-1 group relative">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: i * 0.05 + 0.5, duration: 1 }}
                                    className={`w-full rounded-t-xl transition-all duration-300 ${i === 11 ? 'bg-orange-500' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                                />
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    M{i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 flex justify-center gap-10">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actualized</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-200">
                            <span className="w-3 h-3 rounded-full bg-slate-100" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baseline</span>
                        </div>
                    </div>
                </div>

                {/* Efficiency Breakdown */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm h-full">
                        <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 text-slate-400">
                            <Layers className="text-orange-500" size={20} />
                            Efficiency Leak by Category
                        </h3>
                        <div className="space-y-8">
                            {[
                                { label: "Idle Staff Capacity", value: 65, color: "bg-orange-500" },
                                { label: "Slow Inventory Turnover", value: 42, color: "bg-slate-900" },
                                { label: "Underutilized Square Footage", value: 28, color: "bg-slate-200" },
                                { label: "Equipment Downtime", value: 15, color: "bg-slate-100" },
                            ].map((cat, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
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
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Growth Potential Panel */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-orange-50 rounded-[2.5rem] p-10 border border-orange-100/50 flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-orange-200 flex items-center justify-center text-orange-500 mb-6">
                        <Target size={32} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-2">Maximum Recovery Target</h4>
                    <div className="text-5xl font-black text-slate-900 mb-4">£{(totalPotential * 1.4).toLocaleString()}</div>
                    <p className="text-sm text-slate-500 font-medium max-w-xs italic">Based on full adoption of all Strategic Recommendations and market trend alignment.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Market Sector Rank</h4>
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-6xl font-black text-slate-900">12</span>
                            <span className="text-xl font-black text-slate-300 mb-2">/ 100</span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} className="text-green-500" />
                            Top 15% in sector efficiency recovery
                        </p>
                    </div>
                    <button className="w-full py-4 mt-8 rounded-2xl border-2 border-slate-100 font-black text-xs uppercase tracking-widest text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-all">
                        Compare with Peers
                    </button>
                </div>
            </div>
        </div>
    );
}
