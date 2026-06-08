"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Users,
    Star,
    ShieldCheck,
    MessageSquare,
    Phone,
    Briefcase,
    Globe,
    Search,
    Filter,
    ArrowUpRight,
    MapPin,
    Calendar,
    Clock,
    Zap,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import useSpecialists from "@/services/specialists/hooks";

export default function SpecialistNetworkPage() {
    const { specialists, stats, loading, error } = useSpecialists();

    const networkStats = stats ? [
        { label: "Experts", value: stats.verifiedExperts, icon: ShieldCheck },
        { label: "Projects", value: stats.successfulDeployments, icon: Briefcase },
        { label: "Global", value: stats.globalReach, icon: Globe },
    ] : [
        { label: "Experts", value: "480+", icon: ShieldCheck },
        { label: "Projects", value: "12.4k", icon: Briefcase },
        { label: "Global", value: "45+", icon: Globe },
    ];

    return (
        <div className="space-y-5 md:space-y-10 pb-24 md:pb-12 px-0 md:px-0">
            {/* Mobile-First Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1 md:px-0">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                        <span className="text-orange-500">Expert</span> Directory
                    </h1>
                    <p className="text-xs md:text-base text-slate-400 font-bold uppercase tracking-widest">
                        Verified Business Growth Partners
                    </p>
                </div>
                <button className="hidden md:flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all group">
                    <Calendar size={18} className="text-orange-500" />
                    Partner Portal
                </button>
            </div>


            {/* High-Density Stats Banner (Responsive & Fluid) */}
            <div className="bg-slate-900 md:bg-white border-y border-slate-800 md:border-slate-100 -mx-4 md:mx-0 py-5 md:py-10">
                <div className="max-w-5xl mx-auto px-4 md:px-0">
                    <div className="flex items-center justify-between gap-4 md:gap-10">
                        {networkStats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 md:gap-4 min-w-0">
                                <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-500/10 md:bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                                    <stat.icon size={16} className="md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm md:text-xl font-black text-white md:text-slate-900 leading-none truncate">{stat.value}</div>
                                    <div className="text-[7px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-[0.2em] text-slate-500 mt-0.5 md:mt-1 truncate">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Native-Feel Action Bar */}
            <div className="flex gap-2 px-1 md:px-0 sticky top-20 z-30 md:relative md:top-0">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search implementation experts..."
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 shadow-sm transition-all font-semibold text-xs md:text-sm"
                    />
                </div>
                <button className="aspect-square w-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-700 shadow-sm active:scale-95">
                    <Filter size={18} />
                </button>
            </div>

            {/* Specialist Dynamic Grid (2 Columns on Mobile!) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {specialists.map((pro, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/10 transition-all group overflow-hidden flex flex-col"
                    >
                        <div className="p-4 md:p-8 flex-1 relative">
                            {/* Status Indicator Over Avatar */}
                            <div className="relative w-12 h-12 md:w-20 md:h-20 mx-auto mb-4">
                                <div className="w-full h-full bg-slate-100 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 border-slate-50 shadow-sm">
                                    <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-6 md:h-6 rounded-full border-2 md:border-4 border-white ${pro.status === 'Available' ? 'bg-green-500' : 'bg-orange-500'}`} />
                            </div>

                            <div className="text-center mb-3">
                                <h3 className="text-xs md:text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{pro.name}</h3>
                                <p className="text-[9px] md:text-sm font-bold text-slate-400 mt-0.5 line-clamp-1 uppercase tracking-tighter md:tracking-normal">{pro.role}</p>
                            </div>

                            {/* Mobile rating badge */}
                            <div className="flex md:hidden items-center justify-center gap-1 text-[8px] font-black text-slate-900 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 mb-4 w-fit mx-auto">
                                <Star size={8} className="text-orange-500 fill-orange-500" />
                                {pro.rating}
                            </div>

                            {/* Expertise - Simplified for Mobile */}
                            <div className="hidden md:flex flex-wrap gap-1.5 mb-6 justify-center">
                                {pro.expertise.slice(0, 2).map(exp => (
                                    <span key={exp} className="text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                                        {exp}
                                    </span>
                                ))}
                            </div>

                            <div className="md:pt-5 md:border-t md:border-slate-50 flex items-center justify-center md:justify-between">
                                <div className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="text-slate-900 font-black">{pro.experience}</span> EXP
                                </div>
                                <ArrowUpRight size={14} className="hidden md:block text-slate-200 group-hover:text-orange-500 transition-colors" />
                            </div>
                        </div>

                        {/* Native Action Buttons */}
                        <div className="p-3 md:p-6 flex gap-1.5 md:gap-2 bg-slate-50/50 border-t border-slate-50">
                            <button className="flex-1 bg-white border border-slate-200 py-2.5 md:py-3 rounded-xl font-bold text-[8px] md:text-[10px] uppercase tracking-widest text-slate-700 active:bg-orange-500 active:text-white transition-all flex items-center justify-center gap-1.5">
                                <MessageSquare size={12} className="md:w-3.5 md:h-3.5" />
                                Chat
                            </button>
                            <button className="w-10 h-9 md:w-12 md:h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center active:bg-black transition-all">
                                <Phone size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Mobile-First Global CTA */}
            <div className="bg-slate-900 rounded-3xl md:rounded-[3rem] p-6 md:p-16 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
                    <Globe size={180} />
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Zap size={10} fill="currentColor" />
                        Project Lead Match
                    </div>
                    <h2 className="text-xl md:text-4xl font-black mb-4 leading-tight">
                        Need Multi-Site <span className="text-orange-500">Project</span> Leads?
                    </h2>
                    <p className="text-slate-400 text-xs md:text-lg leading-relaxed mb-6 max-w-md">
                        Get matched with a partner specialized in multi-site operations within 48 hours.
                    </p>
                    <button className="w-full md:w-auto bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-xs md:text-lg shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                        Start Partner Match
                    </button>
                </div>
            </div>
        </div>
    );
}
      </div>
    );
}
