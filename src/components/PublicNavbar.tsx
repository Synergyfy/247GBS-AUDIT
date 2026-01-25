"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNavbar() {
    const pathname = usePathname();

    // Do not show on dashboard pages or auth pages if desired, 
    // but the request specifically said "except from the dashboard pages".
    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">
                        A
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">247GBS Audit</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
                    <a href="/#comparison" className="hover:text-orange-500 transition-colors">Compare Audits</a>
                    <a href="/#why" className="hover:text-orange-500 transition-colors">Why Quarterly?</a>
                    <Link href="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard</Link>
                    <Link
                        href="/auth/signin"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
