"use client";

import React, { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    Shield,
    CheckCircle2,
    XCircle,
    Mail,
    ArrowDownUp,
    Plus,
    X,
    Loader2,
    UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAdminUsers from "@/services/admin/users/hooks";
import { API_BASE_URL } from "@/lib/api";

interface CreateUserForm {
    email: string;
    firstName: string;
    lastName: string;
    businessName: string;
    password: string;
    role: string;
}

const defaultForm: CreateUserForm = {
    email: "",
    firstName: "",
    lastName: "",
    businessName: "",
    password: "",
    role: "User",
};

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: usersData, loading, error, refresh } = useAdminUsers();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<CreateUserForm>(defaultForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState(false);

    const users = (usersData ?? []).map(u => ({
        id: u.id,
        name: `${u.firstName ?? ""}${u.firstName && u.lastName ? ' ' : ''}${u.lastName ?? ''}`.trim() || u.email.split('@')[0],
        email: u.email,
        role: u.role ?? 'User',
        status: u.status ?? 'Active',
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(u.email ?? u.id)}`
    }));

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = () => {
        setForm(defaultForm);
        setFormError(null);
        setFormSuccess(false);
        setIsModalOpen(true);
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
            const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
            const payload: Record<string, string> = {
                email: form.email,
                firstName: form.firstName,
                lastName: form.lastName,
                role: form.role,
            };
            if (form.businessName.trim()) payload.businessName = form.businessName;
            if (form.password.trim()) payload.password = form.password;

            const res = await fetch(`${API_BASE_URL}/admin/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Failed to create user (${res.status})`);
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">User Management</h1>
                    <p className="text-slate-500 font-medium">Manage access and account status for all registered entities.</p>
                </div>
                <button
                    onClick={openModal}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-orange-500 transition-colors shadow-lg"
                >
                    <Plus size={16} />
                    Add System User
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                {/* Visual Bar */}
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                            <Filter size={18} />
                            Filters
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                            <ArrowDownUp size={18} />
                            Sort
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Role Protocol</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">System Status</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
                            {!loading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium text-sm">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                            {filteredUsers.map((user, i) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                                                <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                    <Mail size={10} />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                                            <Shield size={12} className={user.role === 'Admin' ? 'text-orange-500' : 'text-slate-500'} />
                                            <span className="text-xs font-bold text-slate-700">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                user.status === 'Suspended' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                            }`}>
                                            {user.status === 'Active' && <CheckCircle2 size={12} />}
                                            {user.status === 'Suspended' && <XCircle size={12} />}
                                            {user.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Mocked) */}
                <div className="px-8 py-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <p className="text-xs font-bold text-slate-400">Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
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
                                        <UserPlus size={20} className="text-orange-500" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Add System User</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Create a new user account in the system.</p>
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
                                    <h3 className="text-xl font-black text-slate-900 mb-1">User Created!</h3>
                                    <p className="text-sm text-slate-500">The new user has been added to the system.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {formError && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
                                            {formError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">First Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.firstName}
                                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Last Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.lastName}
                                                onChange={e => setForm({ ...form, lastName: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="john.doe@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Business Name</label>
                                        <input
                                            type="text"
                                            value={form.businessName}
                                            onChange={e => setForm({ ...form, businessName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="Optional"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Role</label>
                                            <select
                                                value={form.role}
                                                onChange={e => setForm({ ...form, role: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                            >
                                                <option value="User">User</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Agent">Agent</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Password</label>
                                            <input
                                                type="password"
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                                placeholder="Auto-generated if blank"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black shadow-lg hover:bg-orange-500 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18} />
                                                    Creating User...
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={18} />
                                                    Create User
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
