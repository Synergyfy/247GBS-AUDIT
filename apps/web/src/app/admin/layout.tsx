"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    FileText,
    GitBranch,
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
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(pathname !== "/admin/login");
    const [adminUser, setAdminUser] = useState<{ email?: string; firstName?: string; lastName?: string; role?: string } | null>(null);

    // If on /admin/login, render standalone without admin shell
    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (isLoginPage) {
            setIsCheckingAuth(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const token = localStorage.getItem("247gbs_token");
                const userStr = localStorage.getItem("247gbs_user");

                if (!token || !userStr) {
                    window.location.assign("/admin/login?reason=session-expired");
                    return;
                }

                // Fast client prefilter (UX only — never authoritative).
                try {
                    const user = JSON.parse(userStr);
                    const role = (user.role || "").toLowerCase();
                    if (role !== "administrator" && role !== "admin") {
                        window.location.assign("/admin/login?reason=unauthorized");
                        return;
                    }
                } catch {
                    window.location.assign("/admin/login?reason=session-expired");
                    return;
                }

                // Authoritative server-side role check.
                const res = await fetch(`${API_BASE_URL}/admin/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                if (!res.ok) {
                    window.location.assign("/admin/login?reason=unauthorized");
                    return;
                }
                const me = await res.json();
                const serverRole = (me.role || "").toLowerCase();
                if (serverRole !== "administrator" && serverRole !== "admin") {
                    window.location.assign("/admin/login?reason=unauthorized");
                    return;
                }

                if (!cancelled) {
                    setAdminUser(me);
                    setIsCheckingAuth(false);
                }
            } catch {
                window.location.assign("/admin/login?reason=session-expired");
            }
        })();
        return () => { cancelled = true; };
    }, [pathname, isLoginPage]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("247gbs_token");
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "GET",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: "include",
            }).catch(() => ({}));
        } finally {
            localStorage.removeItem("247gbs_token");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("247gbs_user");
            window.location.assign("/admin/login");
        }
    };

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-400 mb-4 animate-pulse">
                    <Shield size={24} />
                </div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Verifying Administrator Access...</p>
            </div>
        );
    }

    const menuItems = [
        { icon: LayoutDashboard, label: "Overview", href: "/admin" },
        { icon: Users, label: "Users", href: "/admin/users" },
        { icon: FileText, label: "Audits", href: "/admin/audits" },
        { icon: GitBranch, label: "Business Triage", href: "/admin/triage" },
        { icon: Settings, label: "Settings", href: "/admin/settings" },
    ];

    // Mobile primary tabs (different from full sidebar list if needed)
    const mobileTabs = menuItems;

    return (
        <div className="h-dvh overflow-hidden bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-orange-100">
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
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-white truncate">
                                    {adminUser?.firstName ? `${adminUser.firstName} ${adminUser.lastName || ''}`.trim() : "Super Admin"}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                    {adminUser?.role || "Administrator"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
                {/* Header - Native Feel */}
                <header className="h-16 md:h-20 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-40">
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

                    <div className="flex items-center gap-2 md:gap-4 ml-auto">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center px-4 py-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-sm gap-2"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </header>

                {/* Page Content — scrolls on its own so a long page (e.g. the triage
                    question list) never has to grow the whole document. */}
                <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-24 lg:pb-8 p-4 md:p-8">
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
