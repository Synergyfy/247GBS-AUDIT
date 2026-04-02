"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Plus,
    TrendingUp,
    Users,
    BarChart3,
    History,
    Settings,
    Bell,
    Search,
    ChevronRight,
    Zap,
    Target,
    ArrowUpRight,
    Briefcase,
    Calendar,
    ArrowRight,
    Star,
    MoreVertical,
    Bot
} from "lucide-react";
import type { SavedAudit, DashboardStats } from "@/services/dashboard/types";
import useDashboard from "@/services/dashboard/hooks";

export default function DashboardPage() {
    const { data, loading, error } = useDashboard();

    const recentAudits = data?.recentAudits ?? [];
    const stats: DashboardStats = data?.stats ?? {
        totalAudits: 0,
        activeRecovery: 0,
        efficiencyGain: 0,
        nextAuditDate: "-",
    };

    return (
        <div className="space-y-10">
            {/* Welcome & Global CTA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Welcome Back, <span className="text-orange-500 underline decoration-slate-200 underline-offset-8">{data?.userName ?? 'Analyst'}</span>.</h1>
                    <p className="text-slate-500 font-medium">Your business optimization roadmap is active and recovering value.</p>
                </motion.div>
                <Link
                    href="/audit/selection"
                    className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black text-lg flex items-center gap-3 shadow-2xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 group"
                >
                    <Plus size={24} className="text-orange-500 group-hover:rotate-90 transition-transform" />
                    New Forensic Audit
                </Link>
            </div>

            {/* Sophisticated Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Recovery", value: `£${stats.activeRecovery.toLocaleString()}`, sub: "Projected Annual", icon: TrendingUp, color: "orange" },
                    { label: "Audit Sessions", value: stats.totalAudits, sub: "Completed to date", icon: History, color: "slate" },
                    { label: "Efficiency Gain", value: `+${stats.efficiencyGain}%`, sub: "Avg per audit", icon: Zap, color: "orange" },
                    { label: "Next Cycle", value: stats.nextAuditDate, sub: "Recommended refresh", icon: Calendar, color: "slate" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-orange-100/20 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color === 'orange' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-slate-900 text-white shadow-lg shadow-slate-100'}`}>
                                <stat.icon size={20} />
                            </div>
                            <ArrowUpRight className="text-slate-200 group-hover:text-orange-500 transition-colors" size={24} />
                        </div>
                        <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{stat.label}</div>
                        <div className="pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 italic">
                            {stat.sub}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Audit Vault / Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <ArchiveIcon className="text-orange-500" size={24} />
                            Audit Vault
                        </h3>
                        <Link href="/dashboard/vault" className="text-xs font-black uppercase tracking-widest text-orange-600 hover:text-slate-900 transition-colors">View All</Link>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        {recentAudits.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Profile / Date</th>
                                        <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Drain</th>
                                        <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Recovery</th>
                                        <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence>
                                        {recentAudits.slice(0, 5).map((audit, i) => (
                                            <motion.tr
                                                key={audit.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-4 md:px-8 py-6">
                                                    <div className="font-bold text-slate-900">{audit.sector}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium">{new Date(audit.date).toLocaleDateString()} • {audit.type.replace('_', ' ')}</div>
                                                </td>
                                                <td className="px-4 md:px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-slate-900">{audit.metrics.capacityDrain}%</span>
                                                        <div className="flex-1 w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="bg-orange-500 h-full" style={{ width: `${audit.metrics.capacityDrain}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-8 py-6">
                                                    <span className="font-black text-slate-900">£{audit.metrics.annualRecovery.toLocaleString()}</span>
                                                </td>
                                                <td className="px-4 md:px-8 py-6">
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                                        Forensic
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-8 py-6 text-right">
                                                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-20 text-center space-y-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                                    <ArchiveIcon size={40} />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-black">No audits stored in vault.</p>
                                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 italic">Your forensic roadmaps will appear here once saved from the results screen.</p>
                                </div>
                                <Link
                                    href="/audit/selection"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    Initialize First Audit <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Specialist Coordination Sidebar */}
                <div className="space-y-10">
                    {/* AI Advisor Panel */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
                            <Bot size={120} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 italic">AI Advisor Protocol</h4>
                            <p className="text-lg font-bold leading-relaxed mb-10">
                                {data?.aiAdvisorSuggestion ? (
                                    `"${data.aiAdvisorSuggestion}"`
                                ) : (
                                    `"Initialize a forensic audit to receive personalized strategic recommendations."`
                                )}
                            </p>
                            <button className="w-full py-4 bg-orange-500 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 group">
                                Execute AI Suggestion
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Token Allocation Card */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50" />
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vault Balance</h4>
                            <Zap size={20} className="text-orange-500" fill="currentColor" />
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-black text-slate-900">{data?.tokenBalance ?? 0}</span>
                            <span className="text-xl font-black text-orange-500 mb-1">Tokens</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                            Your next <span className="text-slate-900 font-bold underline decoration-orange-300 underline-offset-4 tracking-tight italic">Forensic Refresh</span> costs **1 Session Token**.
                        </p>
                        <button className="w-full py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-500 hover:border-orange-500 hover:text-orange-600 transition-all text-xs uppercase tracking-widest">
                            Refill Vault tokens
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArchiveIcon({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="20" height="5" x="2" y="3" rx="1" />
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
            <path d="M10 12h4" />
        </svg>
    )
}
