"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    Shield,
    Bell,
    Search,
    Menu,
    LogOut,
    ChevronDown,
    X,
    Star
} from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: "Overview", href: "/admin" },
        { icon: Users, label: "User Management", href: "/admin/users" },
        // { icon: Star, label: "Specialist Network", href: "/admin/specialists" },
        { icon: FileText, label: "Audit Oversight", href: "/admin/audits" },
        { icon: Settings, label: "System Settings", href: "/admin/settings" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-orange-100">
            {/* Admin Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block`}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-8 border-b border-slate-800">
                        <Link href="/admin" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                A
                            </div>
                            <span className="font-bold text-lg tracking-tight">Admin Console</span>
                        </Link>
                        <button
                            className="ml-auto lg:hidden text-slate-400 hover:text-white"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {menuItems.map((item, i) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-orange-500">
                                <Shield size={16} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white">Super Admin</div>
                                <div className="text-[10px] text-slate-500">System Access</div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
                    <button
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 max-w-xl mx-4 lg:mx-0 hidden md:block relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users, audits, logs..."
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden md:inline">Exit Console</span>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
