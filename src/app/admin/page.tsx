"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Users,
    FileText,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2
} from "lucide-react";
import useAdminDashboard from "@/services/admin/dashboard/hooks";

export default function AdminOverviewPage() {
    const { data, loading, error } = useAdminDashboard();

    const stats = data?.stats ?? [
        { label: "Total Revenue", value: "£124,500", change: "+12.5%", trend: "up", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Active Users", value: "2,543", change: "+8.2%", trend: "up", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Pending Audits", value: "45", change: "-2.4%", trend: "down", icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "System Alerts", value: "3", change: "0%", trend: "neutral", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" }
    ];

    const activities = data?.activities ?? [
        { user: "Sarah Jenkins", action: "submitted a new audit request", target: "Q3 Financial Review", time: "2 mins ago", icon: FileText, color: "bg-blue-100 text-blue-600" },
        { user: "System", action: "completed automated analysis", target: "TechCorp Audit #442", time: "15 mins ago", icon: CheckCircle2, color: "bg-green-100 text-green-600" },
        { user: "Michael Chen", action: "updated profile information", target: "Security Settings", time: "1 hour ago", icon: Users, color: "bg-orange-100 text-orange-600" },
        { user: "Admin Console", action: "flagged suspicious login attempt", target: "IP: 192.168.1.1", time: "3 hours ago", icon: AlertCircle, color: "bg-red-100 text-red-600" }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">System Overview</h1>
                <p className="text-slate-500 font-medium">Real-time monitoring and administrative insights.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                                {stat.change}
                                {stat.trend === 'up' && <ArrowUpRight size={14} />}
                                {stat.trend === 'down' && <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <div className="text-slate-500 text-sm font-bold mb-1">{stat.label}</div>
                        <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Content Split */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Mocked) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Audit Volume Trends</h3>
                            <p className="text-slate-500 text-sm">Monthly audit submissions and completions</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 outline-none">
                            <option>Last 6 Months</option>
                            <option>Year to Date</option>
                        </select>
                    </div>

                    {/* Chart Visual (driven by admin auditTrends if available) */}
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {(() => {
                            const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                            const trends = data?.auditTrends ?? months.map((m, i) => ({ month: m, count: [40,65,45,80,55,90,70,85,60,75,50,95][i] }));
                            const counts = months.map(m => trends.find(t => t.month === m)?.count ?? 0);
                            const max = Math.max(...counts, 1);
                            return counts.map((c, i) => {
                                const h = Math.round((c / max) * 100);
                                return (
                                    <div key={i} className="w-full bg-orange-50 hover:bg-orange-100 rounded-t-lg relative group transition-colors" style={{ height: `${h}%` }}>
                                        <div className="absolute bottom-0 w-full bg-orange-500 rounded-t-lg transition-all duration-500" style={{ height: `${Math.round(h * 0.6)}%` }} />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {c} Audits
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {activities.map((item, i) => (
                            <div key={i} className="flex gap-4 relative">
                                {i !== activities.length - 1 && (
                                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-slate-100" />
                                )}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                                    <item.icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 leading-snug">
                                        <span className="font-bold text-slate-900">{item.user}</span> {item.action} <span className="font-bold text-slate-900">{item.target}</span>
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 font-medium">
                                        <Clock size={12} />
                                        {item.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
                        View Full Log
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
