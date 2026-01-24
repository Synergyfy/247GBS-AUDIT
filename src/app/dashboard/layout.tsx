"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    History,
    BarChart3,
    Users,
    Settings,
    Zap,
    Bell,
    Search
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
        { icon: History, label: "Audit Vault", href: "/dashboard/vault" },
        { icon: BarChart3, label: "Forensic Intelligence", href: "/dashboard/intelligence" },
        { icon: Users, label: "Specialist Network", href: "/dashboard/specialists" },
        { icon: Settings, label: "Protocols", href: "/dashboard/protocols" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-orange-100">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-slate-900 hidden lg:flex flex-col border-r border-slate-800 fixed h-full z-50">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            A
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-orange-500 transition-colors">247GBS Audit</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item, i) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${active
                                    ? "bg-orange-500 text-white shadow-xl shadow-orange-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 space-y-4">
                    <div className="bg-orange-500/10 rounded-3xl p-6 border border-orange-500/10">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">Ecological Impact</div>
                        <div className="text-2xl font-black text-white italic">Elite</div>
                        <div className="mt-4 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full w-[85%]" />
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Efficiency Threshold</div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-500 group-hover:scale-150 transition-transform duration-700">
                            <Zap size={60} />
                        </div>
                        <div className="relative z-10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Membership Status</p>
                            <div className="text-sm font-black text-white mb-4 italic">Tier 2: Growth Specialist</div>
                            <button className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs hover:bg-orange-500 hover:text-white transition-all">
                                Upgrade Access
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 min-h-screen relative">
                {/* Dashboard Header */}
                <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Intelligence Dashboard</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System V.2.1.0 • Node: London-5</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search roadmaps..."
                                className="pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-sm outline-none focus:border-orange-500 focus:bg-white transition-all w-64"
                            />
                        </div>
                        <button className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-orange-500 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                            <div className="text-right">
                                <div className="text-sm font-black text-slate-900">Demo Account</div>
                                <div className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Master Key</div>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-orange-100">
                                <img src="https://api.dicebear.com/7.x/shapes/svg?seed=demo" alt="Avatar" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
