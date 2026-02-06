"use client";

import React, { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    PlayCircle,
    BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import useAdminAudits from "@/services/admin/audits/hooks";

export default function AuditsPage() {
    const [filter, setFilter] = useState("All");
    const { data: auditsData, metrics, loading, error } = useAdminAudits();

    const audits = auditsData ?? [];
    const filteredAudits = filter === "All" ? audits : audits.filter(a => a.status === filter);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Audit Oversight</h1>
                    <p className="text-slate-500 font-medium">Monitor ongoing forensic investigations and report generation.</p>
                </div>
                <button className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200">
                    Initiate New Audit
                </button>
            </div>

            {/* Metrics Row (Mocked) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Active</span>
                    <div className="text-2xl font-black text-slate-900">{metrics?.totalActive ?? '—'}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Overdue</span>
                    <div className="text-2xl font-black text-red-500">{metrics?.overdue ?? '—'}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">In Review</span>
                    <div className="text-2xl font-black text-orange-500">{metrics?.inReview ?? '—'}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Completed (Jan)</span>
                    <div className="text-2xl font-black text-green-500">{metrics?.completed ?? '—'}</div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                {/* Visual Bar */}
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {["All", "In Progress", "Action Required", "Review", "Completed"].map(stat => (
                            <button
                                key={stat}
                                onClick={() => setFilter(stat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === stat
                                        ? "bg-slate-900 text-white shadow-lg"
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {stat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search audits..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Audit Protocol</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Stage & Progress</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status Data</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAudits.map((audit, i) => (
                                <motion.tr
                                    key={audit.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-sm">{audit.company}</span>
                                            <span className="text-xs text-slate-500 font-medium">{audit.id} • {audit.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="w-48 space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-slate-700">{audit.stage}</span>
                                                <span className="text-slate-400">{audit.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${audit.status === 'Completed' ? 'bg-green-500' :
                                                            audit.status === 'Action Required' ? 'bg-red-500' :
                                                                'bg-blue-500'
                                                        }`}
                                                    style={{ width: `${audit.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${audit.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                audit.status === 'Action Required' ? 'bg-red-100 text-red-700' :
                                                    audit.status === 'Review' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-100 text-blue-700'
                                            }`}>
                                            {audit.status === 'Completed' && <CheckCircle2 size={12} />}
                                            {audit.status === 'Action Required' && <AlertCircle size={12} />}
                                            {audit.status === 'In Progress' && <PlayCircle size={12} />}
                                            {audit.status === 'Review' && <BarChart3 size={12} />}
                                            {audit.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
