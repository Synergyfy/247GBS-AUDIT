"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings,
    ShieldCheck,
    Key,
    CreditCard,
    Bell,
    User,
    Zap,
    History,
    CheckCircle2,
    Camera,
    Wallet,
    ChevronRight,
    ArrowRight,
    LogOut
} from "lucide-react";
import useBilling from "@/services/protocols/billing/hooks";
import useProfile from "@/services/users/profile/hooks";
import useSecurity from "@/services/protocols/security/hooks";

// --- REUSABLE NATIVE COMPONENTS ---

const NativeCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-8 ${className}`}>
        {children}
    </div>
);

const NativeInput = ({ label, value, defaultValue }: { label: string, value?: string, defaultValue?: string }) => (
    <div className="space-y-1.5 w-full">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <div className="relative group">
            <input
                type="text"
                defaultValue={defaultValue || value}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm appearance-none shadow-inner-sm"
            />
        </div>
    </div>
);

// --- SECTIONS ---

function ProfileContent({ profile, loading }: any) {
    return (
        <div className="space-y-4 md:space-y-6">
            <NativeCard className="flex flex-col items-center text-center !p-0 overflow-hidden">
                <div className="w-full h-24 md:h-32 bg-slate-900 relative">
                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>
                <div className="px-6 pb-8 -mt-12 relative z-10">
                    <div className="relative inline-block group">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2.5rem] p-1.5 shadow-2xl">
                            <div className="w-full h-full bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-50">
                                <img 
                                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${profile?.email ?? 'demo'}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                        </div>
                        <button className="absolute bottom-1 right-1 p-2.5 bg-orange-500 text-white rounded-xl shadow-lg active:scale-90 transition-transform">
                            <Camera size={16} strokeWidth={3} />
                        </button>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-xl md:text-2xl font-black text-slate-900">{loading ? 'Syncing...' : `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{profile?.email ?? 'anonymous@247gbs.io'}</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                            <CheckCircle2 size={12} /> Verified Analyst
                        </div>
                    </div>
                </div>
            </NativeCard>

            <NativeCard className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <NativeInput label="Full Identity" defaultValue={`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`} />
                    <NativeInput label="Business Entity" defaultValue={profile?.businessName ?? 'Forensic Ops Ltd'} />
                    <NativeInput label="Strategic Node" defaultValue={profile?.location ?? 'London, UK'} />
                    <NativeInput label="Access Protocol" defaultValue="Full Administrator" />
                </div>
                <button className="w-full py-4 md:py-5 bg-orange-500 text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-100 active:scale-[0.97] transition-all">
                    Apply Operational Updates
                </button>
            </NativeCard>
        </div>
    );
}

function SecurityContent() {
    const { data, rotateKey } = useSecurity();
    return (
        <div className="space-y-4">
            <NativeCard className="space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Vault Access</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-Layer Encryption</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-orange-500 shadow-lg">
                        <ShieldCheck size={24} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { label: "2FA Protocol", value: data?.is2FAEnabled ? "Enabled" : "Offline", color: data?.is2FAEnabled ? "text-green-600" : "text-red-500" },
                        { label: "Master Key", value: "Locked", color: "text-orange-500" },
                        { label: "Strength", value: "98/100", color: "text-slate-900" },
                        { label: "Last Rotation", value: "24h ago", color: "text-slate-400" },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
                            <span className={`text-[10px] font-black ${s.color}`}>{s.value}</span>
                        </div>
                    ))}
                </div>

                <button onClick={() => rotateKey()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-[0.97] transition-all flex items-center justify-center gap-2">
                    <Key size={14} className="text-orange-500" />
                    Reset Security Key
                </button>
            </NativeCard>

            <NativeCard className="flex items-center justify-between bg-orange-50/50 border-orange-100">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
                        <Bell size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Alerts</div>
                        <div className="text-xs font-bold text-slate-900">Notifications are active</div>
                    </div>
                </div>
                <div className="w-12 h-6 bg-orange-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
            </NativeCard>
        </div>
    );
}

function BillingContent() {
    const { data, loading } = useBilling();
    const history = data?.history || [];
    return (
        <div className="space-y-4 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NativeCard className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-500 group-hover:scale-110 transition-transform">
                        <Zap size={100} fill="currentColor" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Current Tier</div>
                    <div className="text-3xl font-black text-slate-900 mb-1">{data?.planName ?? "Elite"}</div>
                    <div className="text-xs font-bold text-orange-600 mb-6">{data?.price ?? "£199/mo"}</div>
                    <button className="text-[10px] font-black text-slate-900 flex items-center gap-1 hover:text-orange-500 transition-colors uppercase tracking-widest">
                        Manage Plan <ArrowRight size={12} strokeWidth={3} />
                    </button>
                </NativeCard>

                <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <Wallet size={80} className="absolute -bottom-4 -right-4 opacity-10 text-orange-500" />
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Settlement Method</div>
                        <div className="text-xl font-black mb-1">{data?.last4 ?? "•••• 8821"}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expires 12/28</div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Primary Active
                    </div>
                </div>
            </div>

            <NativeCard className="!p-0 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Invoice Vault</h3>
                    <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest active:scale-90">Export All</button>
                </div>
                {loading ? (
                    <div className="p-12 text-center text-xs text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Syncing...</div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {history.map((inv) => (
                            <div key={inv.id} className="p-5 flex justify-between items-center active:bg-slate-50 transition-colors group">
                                <div className="space-y-1">
                                    <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                                        {inv.id}
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="text-[9px] text-slate-400 uppercase tracking-widest">{inv.date}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400">Electronic Forensic Receipt</div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-sm font-black text-slate-900">{inv.amount}</div>
                                    <div className="text-[8px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-full border border-green-100 inline-block tracking-tighter">Verified</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </NativeCard>
        </div>
    );
}

// --- MAIN PAGE ---

export default function ProtocolsPage() {
    const [activeTab, setActiveTab] = useState("Profile");
    const { data: profile, loading: profileLoading } = useProfile();

    const tabs = [
        { name: "Profile", icon: User },
        { name: "Security", icon: ShieldCheck },
        { name: "Billing", icon: CreditCard },
        { name: "Insights", icon: Zap }
    ];

    return (
        <div className="min-h-screen pb-24 md:pb-12 max-w-4xl mx-auto space-y-6 md:space-y-10 px-1 md:px-0">
            {/* Super Dopa Header */}
            <header className="pt-2 md:pt-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                        <Settings size={20} strokeWidth={3} className="animate-spin-slow" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
                        Settings
                    </h1>
                </div>
                <p className="text-xs md:text-base text-slate-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] ml-1">
                    Manage Your Account & Security
                </p>
            </header>

            {/* Native App-Style Segment Controller */}
            <nav className="sticky top-[84px] md:top-0 z-40 -mx-4 px-4 py-2 md:mx-0 md:px-0 bg-[#F8FAFC]/90 backdrop-blur-xl md:bg-transparent">
                <div className="bg-white md:bg-slate-100 p-1 rounded-2xl md:rounded-3xl border border-slate-100 md:border-transparent shadow-sm flex items-center gap-1 overflow-hidden relative">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.name;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex-1 relative py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 z-10 ${
                                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <tab.icon size={16} strokeWidth={isActive ? 3 : 2} className="shrink-0" />
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest hidden sm:inline">
                                    {tab.name}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activePill"
                                        className="absolute inset-0 bg-slate-900 rounded-xl md:rounded-2xl -z-10 shadow-lg"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Dynamic Content Transition Area */}
            <main className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 25,
                            duration: 0.3
                        }}
                    >
                        {activeTab === "Profile" && <ProfileContent profile={profile} loading={profileLoading} />}
                        {activeTab === "Security" && <SecurityContent />}
                        {activeTab === "Billing" && <BillingContent />}
                        {activeTab === "Intelligence" && (
                            <NativeCard className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-6 bg-slate-900 text-white">
                                <div className="w-20 h-20 bg-orange-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/20">
                                    <Zap size={40} strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Coming Soon</h3>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto mt-2">
                                        Advanced Forensic AI Node Expansion Pending Approval
                                    </p>
                                </div>
                                <button className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                                    Request Access
                                </button>
                            </NativeCard>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Session Guard (Mobile Only) */}
            <div className="md:hidden pt-4">
                <button className="w-full py-4 border-2 border-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:bg-red-50 transition-all flex items-center justify-center gap-2">
                    <LogOut size={14} strokeWidth={3} />
                    End My Session
                </button>
            </div>
        </div>
    );
}



