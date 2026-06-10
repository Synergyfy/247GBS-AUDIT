"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    MoreHorizontal,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    PlayCircle,
    BarChart3,
    Plus,
    X,
    Loader2,
    ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAdminAudits from "@/services/admin/audits/hooks";
import { API_BASE_URL } from "@/lib/api";

interface CreateAuditForm {
    userId: string;
    auditType: string;
    assignee: string;
    dueDate: string;
}

const defaultForm: CreateAuditForm = {
    userId: "",
    auditType: "",
    assignee: "",
    dueDate: "",
};

const AUDIT_TYPES = [
    "Financial Audit",
    "Operational Audit",
    "Compliance Audit",
    "IT Audit",
    "Forensic Audit",
    "Performance Audit",
    "Tax Audit",
];

export default function AuditsPage() {
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const { data: auditsData, metrics, loading, error, refresh } = useAdminAudits();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<CreateAuditForm>(defaultForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState(false);

    // Users for dropdown
    const [users, setUsers] = useState<{ id: string; label: string }[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const audits = auditsData ?? [];
    const filteredAudits = (filter === "All" ? audits : audits.filter(a => a.status === filter))
        .filter(a =>
            !searchTerm ||
            a.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.type?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const token = localStorage.getItem("247gbs_token");
            const res = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(
                    (data as any[]).map((u: any) => ({
                        id: u.id,
                        label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
                    }))
                );
            }
        } catch {
            // ignore
        } finally {
            setUsersLoading(false);
        }
    };

    const openModal = () => {
        setForm(defaultForm);
        setFormError(null);
        setFormSuccess(false);
        setIsModalOpen(true);
        fetchUsers();
    };

    const closeModal = () => {
        if (isSubmitting) return;
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            const token = localStorage.getItem("247gbs_token");
            const payload: Record<string, any> = {
                userId: form.userId,
                auditType: form.auditType,
            };
            if (form.assignee.trim()) payload.assignee = form.assignee;
            if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString();

            const res = await fetch(`${API_BASE_URL}/admin/audits`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(
                    Array.isArray(err.message) ? err.message.join(", ") : err.message || `Failed (${res.status})`
                );
            }

            setFormSuccess(true);
            refresh();
            setTimeout(() => {
                setIsModalOpen(false);
                setFormSuccess(false);
            }, 1500);
        } catch (err: any) {
            setFormError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-24 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">Audit Oversight</h1>
                    <p className="text-xs md:text-sm text-slate-500 font-medium tracking-tight">Monitor ongoing forensic investigations and report generation.</p>
                </div>
                <button
                    onClick={openModal}
                    className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-orange-500 text-white rounded-2xl md:rounded-xl font-bold text-sm hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200"
                >
                    <Plus size={18} />
                    Initiate New Audit
                </button>
            </div>

            {/* Metrics Row - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: "Total Active", value: metrics?.totalActive, color: "text-slate-900" },
                    { label: "Overdue", value: metrics?.overdue, color: "text-red-500" },
                    { label: "In Review", value: metrics?.inReview, color: "text-orange-500" },
                    { label: "Completed", value: metrics?.completed, color: "text-green-500" }
                ].map((m, idx) => (
                    <div key={idx} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 md:gap-2">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">{m.label}</span>
                        <div className={`text-xl md:text-2xl font-bold ${m.color}`}>{m.value ?? '—'}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white md:border md:border-slate-100 md:rounded-3xl overflow-hidden md:shadow-sm">
                {/* Search & Filter Bar */}
                <div className="px-4 md:px-8 py-5 md:py-6 border-b border-slate-100 flex flex-col gap-5 bg-slate-50/50">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        {["All", "In Progress", "Action Required", "Review", "Completed"].map(stat => (
                            <button
                                key={stat}
                                onClick={() => setFilter(stat)}
                                className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${filter === stat
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                {stat}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search audits by company or type..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 md:py-3 bg-white border border-slate-200 rounded-2xl md:rounded-xl text-sm font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                        />
                    </div>
                </div>

                {/* Mobile Card View (Hidden on Tablet/Desktop) */}
                <div className="md:hidden divide-y divide-slate-50">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="animate-spin text-orange-500" size={32} />
                        </div>
                    ) : filteredAudits.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-medium text-sm">No audits found.</div>
                    ) : (
                        filteredAudits.map((audit, i) => (
                            <motion.div
                                key={audit.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="p-4 space-y-4 active:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 text-sm truncate">{audit.company}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{audit.id} • {audit.type}</div>
                                    </div>
                                    <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        audit.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        audit.status === 'Action Required' ? 'bg-red-100 text-red-700' :
                                        audit.status === 'Review' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {audit.status}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-500">{audit.stage}</span>
                                        <span className="text-slate-900">{audit.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                audit.status === 'Completed' ? 'bg-green-500' :
                                                audit.status === 'Action Required' ? 'bg-red-500' :
                                                'bg-orange-500'
                                            }`}
                                            style={{ width: `${audit.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="text-[10px] font-bold text-slate-400">Assignee: <span className="text-slate-700">{audit.assignee || "Unassigned"}</span></div>
                                    <button className="p-2 text-slate-400 active:text-slate-900 active:bg-slate-100 rounded-xl transition-all">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Desktop Table View (Hidden on Mobile) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Audit Protocol</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Stage &amp; Progress</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status Data</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-16 text-center">
                                        <Loader2 className="animate-spin text-orange-500 mx-auto" size={28} />
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredAudits.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium text-sm">
                                        No audits found.
                                    </td>
                                </tr>
                            )}
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

                {/* Footer Controls */}
                <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest order-2 sm:order-1">Showing {filteredAudits.length} total entries</p>
                    <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50" disabled>Prev</button>
                        <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">Next</button>
                    </div>
                </div>
            </div>

            {/* Initiate Audit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
                                        <ClipboardList size={20} className="text-orange-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Initiate New Audit</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Start a new forensic audit session.</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Success State */}
                            {formSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-8 text-center"
                                >
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={32} className="text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">Audit Initiated!</h3>
                                    <p className="text-sm text-slate-500">The new audit session has been created.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {formError && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
                                            {formError}
                                        </div>
                                    )}

                                    {/* Client / User */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                            Client (Business Owner) *
                                        </label>
                                        {usersLoading ? (
                                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                <Loader2 className="animate-spin text-slate-400" size={16} />
                                                <span className="text-sm text-slate-400 font-medium">Loading users…</span>
                                            </div>
                                        ) : (
                                            <select
                                                required
                                                value={form.userId}
                                                onChange={e => setForm({ ...form, userId: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                            >
                                                <option value="">— Select a client —</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.label}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Audit Type */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                            Audit Type *
                                        </label>
                                        <select
                                            required
                                            value={form.auditType}
                                            onChange={e => setForm({ ...form, auditType: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                        >
                                            <option value="">— Select audit type —</option>
                                            {AUDIT_TYPES.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Assignee */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                                Assignee
                                            </label>
                                            <input
                                                type="text"
                                                value={form.assignee}
                                                onChange={e => setForm({ ...form, assignee: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                                placeholder="Optional"
                                            />
                                        </div>

                                        {/* Due Date */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={form.dueDate}
                                                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18} />
                                                    Initiating Audit…
                                                </>
                                            ) : (
                                                <>
                                                    <ClipboardList size={18} />
                                                    Initiate Audit
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
