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
import type { SavedAudit } from "@/services/audit/types";
import useAudits from "@/services/audit/hooks";

export default function AuditVaultPage() {
    const { audits, loading, error, refresh } = useAudits();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAudits = audits.filter(a =>
        a.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Audit <span className="text-orange-500">Vault</span></h1>
                    <p className="text-slate-500 font-medium">Historical repository of all forensic business assessments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} />
                        Export Archive
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by sector or audit type..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-400 hover:text-orange-500 transition-all text-sm">
                        <Filter size={18} />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm shadow-lg shadow-slate-200">
                        Search
                    </button>
                </div>
            </div>

            {/* Vault Content */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                {filteredAudits.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 md:px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Resource Protocol</th>
                                    <th className="px-4 md:px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Date Logged</th>
                                    <th className="px-4 md:px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Recovery Metrics</th>
                                    <th className="px-4 md:px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">System Status</th>
                                    <th className="px-4 md:px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
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
                                            <td className="px-4 md:px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{audit.sector}</div>
                                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{audit.type.replace('_', ' ')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-8 py-6">
                                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                    <Calendar size={16} className="text-slate-300" />
                                                    {new Date(audit.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-8 py-6">
                                                <div>
                                                    <div className="font-black text-slate-900">£{audit.metrics.annualRecovery.toLocaleString()} <span className="text-[10px] text-green-500 ml-1">PA</span></div>
                                                    <div className="text-[10px] text-slate-400 font-bold italic">{audit.metrics.capacityDrain}% Efficiency Leak</div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-8 py-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                                                    <ShieldCheck size={12} />
                                                    Verified
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-8 py-6 text-right">
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
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                            <History size={48} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-slate-900">Vault Currently Offline</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2 italic">Completed audits will be archived here for forensic comparison and trend analysis.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Vault Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Data Points", value: "2,480", icon: FileText, sub: "Verified metrics" },
                    { label: "Efficiency Trends", value: "+14.2%", icon: Zap, sub: "Vs last quarter" },
                    { label: "Archival Integrity", value: "100%", icon: ShieldCheck, sub: "End-to-end encrypted" },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 text-orange-500 group-hover:scale-110 transition-transform duration-700">
                            <stat.icon size={80} />
                        </div>
                        <div className="text-3xl font-black mb-1">{stat.value}</div>
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">{stat.label}</div>
                        <div className="text-[10px] text-slate-400 font-medium italic">{stat.sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
