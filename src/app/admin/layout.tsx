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
        { icon: Users, label: "Users", href: "/admin/users" },
        { icon: FileText, label: "Audits", href: "/admin/audits" },
        { icon: Settings, label: "Settings", href: "/admin/settings" },
    ];

    // Mobile primary tabs (different from full sidebar list if needed)
    const mobileTabs = menuItems;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-orange-100">
            {/* Sidebar Overlay (Mobile only) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Admin Sidebar - Slide out on mobile, persistent on desktop */}
            <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 text-white transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block`}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-8 border-b border-slate-800 shrink-0">
                        <Link href="/admin" className="flex items-center gap-3 group" onClick={() => setIsSidebarOpen(false)}>
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                A
                            </div>
                            <span className="font-bold text-lg tracking-tight">Admin Console</span>
                        </Link>
                        <button
                            className="ml-auto lg:hidden p-2 text-slate-400 hover:text-white"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                        <div className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Main Fleet</div>
                        {menuItems.map((item, i) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${isActive
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
                        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-orange-500 shadow-inner">
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">Super Admin</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol Level 5</div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Header - Native Feel */}
                <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-orange-500 active:scale-95 transition-all"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="font-bold text-slate-900 text-lg md:text-xl hidden sm:block">
                            {menuItems.find(i => i.href === pathname)?.label || "Dashboard"}
                        </h1>
                    </div>

                    <div className="flex-1 max-w-md mx-6 hidden md:block relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Forensic search..."
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors relative active:scale-90">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />
                        <Link
                            href="/"
                            className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
                        >
                            <LogOut size={20} />
                            <span className="hidden md:inline ml-2">Exit</span>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 pb-24 lg:pb-8 p-4 md:p-8">
                    {children}
                </main>

                {/* Bottom Navigation - Only visible on mobile/small screens */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 z-[50] flex items-center justify-around shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
                    {mobileTabs.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                className={`flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all active:scale-90 ${isActive
                                    ? "text-orange-600"
                                    : "text-slate-400"
                                    }`}
                            >
                                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-orange-50" : ""}`}>
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-60"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
