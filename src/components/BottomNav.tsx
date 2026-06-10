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
    Plus
} from "lucide-react";

const menuItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: History, label: "Vault", href: "/dashboard/vault" },
    { icon: null, label: "Audit", href: "/audit/selection", isAction: true }, // Central action button
    { icon: BarChart3, label: "Forensic", href: "/dashboard/intelligence" },
    { icon: Users, label: "Network", href: "/dashboard/specialists" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-[100] px-2 pb-safe-area-inset-bottom">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">
                {menuItems.map((item, i) => {
                    const isActive = pathname === item.href;
                    
                    if (item.isAction) {
                        return (
                            <Link key={i} href={item.href} className="relative -top-6">
                                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/40 border-4 border-white active:scale-95 transition-transform">
                                    <Plus size={28} strokeWidth={3} />
                                </div>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    const Icon = item.icon!;
                    return (
                        <Link 
                            key={i} 
                            href={item.href} 
                            className="flex flex-col items-center justify-center flex-1 h-full relative"
                        >
                            <div className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-orange-500' : 'text-slate-400'}`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400'} uppercase tracking-tighter`}>
                                {item.label}
                            </span>
                            
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-orange-50/50 rounded-xl -z-0"
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
