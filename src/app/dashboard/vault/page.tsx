"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    History,
    Search,
    Filter,
    Download,
    Eye,
    Trash2,
    ChevronRight,
    ArrowUpRight,
    FileText,
    ShieldCheck,
    Calendar,
    Zap
} from "lucide-react";
import { useAudits, useVaultStats } from "@/services/audit/hooks";
export default function AuditVaultPage() {
    const { audits, loading, error, refresh } = useAudits();
    const { stats: vaultStats, loading: statsLoading } = useVaultStats();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAudits = audits.filter(a =>
        a.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const summaryStats = [
        { 
            label: "Total Data Points", 
            value: statsLoading ? "..." : (vaultStats?.totalDataPoints.toLocaleString() || "0"), 
            icon: FileText, 
            sub: "Verified metrics" 
        },
        { 
            label: "Efficiency Trends", 
            value: statsLoading ? "..." : (vaultStats?.efficiencyTrend || "0%"), 
            icon: Zap, 
            sub: "Vs last audit" 
        },
        { 
            label: "Archival Integrity", 
            value: statsLoading ? "..." : (vaultStats?.archivalIntegrity || "100%"), 
            icon: ShieldCheck, 
            sub: "End-to-end encrypted" 
        },
    ];

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My <span className="text-orange-500">History</span></h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium">Your past business reviews and growth plans.</p>
                </div>
                <div className="w-full md:w-auto flex gap-3">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} />
                        Export Archive
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by industry or type..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-400 hover:text-orange-500 transition-all text-sm">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm shadow-lg shadow-slate-200">
                        Search
                    </button>
                </div>
            </div>

            {/* Vault Content */}
            <div className="space-y-4 min-h-[400px]">
                {filteredAudits.length > 0 ? (
                    <React.Fragment>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-400">Review Type</th>
                                        <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-400">Date Saved</th>
                                        <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-400">Potential Growth</th>
                                        <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence>
                                        {filteredAudits.map((audit, i) => (
                                            <motion.tr
                                                key={audit.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{audit.sector}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{audit.type.replace('_', ' ')}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                        <Calendar size={16} className="text-slate-300" />
                                                        {new Date(audit.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <div className="font-bold text-slate-900">£{audit.metrics.annualRecovery.toLocaleString()} <span className="text-[10px] text-green-500 ml-1">PA</span></div>
                                                        <div className="text-[10px] text-slate-400 font-bold ">{audit.metrics.capacityDrain}% Wasted Money</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                                                        <ShieldCheck size={12} />
                                                        Ready
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-orange-500 hover:text-white transition-all">
                                                            <Eye size={18} />
                                                        </button>
                                                        <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {filteredAudits.map((audit, i) => (
                                <motion.div
                                    key={audit.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{audit.sector}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{audit.type.replace('_', ' ')}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Growth</div>
                                            <div className="font-bold text-slate-900">£{audit.metrics.annualRecovery.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Date</div>
                                            <div className="text-sm font-bold text-slate-700">{new Date(audit.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="bg-orange-500 h-full" style={{ width: `${audit.metrics.capacityDrain}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{audit.metrics.capacityDrain}% Waste</span>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-green-100">
                                            <ShieldCheck size={10} />
                                            Ready
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </React.Fragment>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-slate-200">
                            <History size={40} />
                        </div>
                        <div className="text-center px-6">
                            <h3 className="text-xl font-bold text-slate-900">History Empty</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2 ">Completed reviews will be stored here for comparison and growth analysis.</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryStats.map((stat, i) => (
                    <div key={i} className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 text-orange-500 group-hover:scale-110 transition-transform duration-700">
                            <stat.icon size={80} />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">{stat.label}</div>
                        <div className="text-[10px] text-slate-400 font-medium ">{stat.sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
