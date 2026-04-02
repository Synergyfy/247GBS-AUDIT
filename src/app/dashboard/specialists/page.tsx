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
} from "lucide-react";
import useSpecialists from "@/services/specialists/hooks";

export default function SpecialistNetworkPage() {
    const { specialists, stats, loading, error } = useSpecialists();

    const networkStats = stats ? [
        { label: "Verified Experts", value: stats.verifiedExperts, icon: ShieldCheck },
        { label: "Successful Deployments", value: stats.successfulDeployments, icon: Briefcase },
        { label: "Global Reach", value: stats.globalReach, icon: Globe },
        { label: "Avg response Time", value: stats.avgResponseTime, icon: Clock },
    ] : [
        { label: "Verified Experts", value: "480+", icon: ShieldCheck },
        { label: "Successful Deployments", value: "12.4k", icon: Briefcase },
        { label: "Global Reach", value: "45 Countries", icon: Globe },
        { label: "Avg response Time", value: "4 mins", icon: Clock },
    ];

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2"><span className="text-orange-500">Specialist</span> Network</h1>
                    <p className="text-slate-500 font-medium">Verified 247GBS consultants ready to implement your forensic roadmap.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 group">
                        <Calendar size={18} className="text-orange-500" />
                        My Appointments
                    </button>
                </div>
            </div>

            {/* Elite Network Stats */}
            <div className="bg-white border-y border-slate-100 py-10 px-4 md:px-0">
                <div className="max-w-5xl mx-auto flex flex-wrap justify-between gap-10">
                    {networkStats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-orange-500">
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div className="text-xl font-black text-slate-900">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter & Search Directory */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search specialists by name, sector or expertise..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-orange-500 shadow-sm transition-all font-medium"
                    />
                </div>
                <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    <Filter size={18} />
                    Advanced Filters
                </button>
            </div>

            {/* Specialist Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {specialists.map((pro, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/20 transition-all group overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] overflow-hidden border-4 border-slate-50">
                                        <img src={pro.image} alt={pro.name} />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${pro.status === 'Available' ? 'bg-green-500' : pro.status === 'In Call' ? 'bg-orange-500' : 'bg-slate-300'
                                        }`} />
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                    <Star size={14} className="text-orange-500 fill-orange-500" />
                                    {pro.rating}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">{pro.name}</h3>
                                <p className="text-sm font-bold text-slate-400">{pro.role}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {pro.expertise.map(exp => (
                                    <span key={exp} className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                                        {exp}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="text-slate-900">{pro.experience}</span> Experience
                                </div>
                                <button className="p-2 border border-slate-100 rounded-xl hover:border-orange-500 hover:text-orange-500 transition-all">
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-8 py-4 flex gap-2">
                            <button className="flex-1 bg-white border border-slate-200 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all flex items-center justify-center gap-2">
                                <MessageSquare size={14} />
                                Chat
                            </button>
                            <button className="w-12 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all">
                                <Phone size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Global Coordination Feature */}
            <div className="bg-slate-900 rounded-[3rem] p-6 md:p-12 lg:p-16 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
                    <Globe size={240} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl lg:text-4xl font-black mb-6 leading-tight">
                        Need an <span className="text-orange-500 underline underline-offset-8 decoration-white/20">Executive Lead</span> for your implementation?
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-10">
                        Our algorithm can match you with an Auditor who specializes in multi-site forensic operations. Deploy a transformation protocol in under 48 hours.
                    </p>
                    <button className="bg-orange-500 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-1 transition-all">
                        Request Expert Match
                    </button>
                </div>
            </div>
        </div>
    );
}
