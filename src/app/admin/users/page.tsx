"use client";

import React, { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    Shield,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Calendar,
    ArrowDownUp
} from "lucide-react";
import { motion } from "framer-motion";

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState("");

    // Mock Users Data
    const users = [
        {
            id: 1,
            name: "Sarah Jenkins",
            email: "sarah.j@techcorp.com",
            role: "Business Owner",
            status: "Active",
            joinDate: "Jan 12, 2026",
            avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Sarah"
        },
        {
            id: 2,
            name: "Michael Chen",
            email: "m.chen@innovate.io",
            role: "Financial Director",
            status: "Active",
            joinDate: "Jan 15, 2026",
            avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Michael"
        },
        {
            id: 3,
            name: "Emma Wilson",
            email: "emma@startup.co.uk",
            role: "Consultant",
            status: "Pending",
            joinDate: "Jan 20, 2026",
            avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Emma"
        },
        {
            id: 4,
            name: "David Miller",
            email: "david.m@global.net",
            role: "Admin",
            status: "Active",
            joinDate: "Dec 10, 2025",
            avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=David"
        },
        {
            id: 5,
            name: "James Anderson",
            email: "j.anderson@retail.org",
            role: "Business Owner",
            status: "Suspended",
            joinDate: "Nov 05, 2025",
            avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=James"
        }
    ];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">User Management</h1>
                    <p className="text-slate-500 font-medium">Manage access and account status for all registered entities.</p>
                </div>
                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-orange-500 transition-colors shadow-lg">
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
                    <p className="text-xs font-bold text-slate-400">Showing 1-5 of 124 users</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
