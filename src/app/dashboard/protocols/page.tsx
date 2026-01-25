"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    ShieldCheck,
    Key,
    CreditCard,
    Bell,
    User,
    Lock,
    Zap,
    Bot,
    History,
    LogOut,
    ChevronRight,
    CheckCircle2,
    ShieldAlert
} from "lucide-react";

export default function ProtocolsPage() {
    const [activeTab, setActiveTab] = useState("Profile");

    const tabs = [
        { name: "Profile", icon: User },
        { name: "Security", icon: ShieldCheck },
        { name: "Billing", icon: CreditCard },
        { name: "Notifications", icon: Bell },
        { name: "Tokens", icon: Zap }
    ];

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">System <span className="text-orange-500">Protocols</span></h1>
                <p className="text-slate-500 font-medium">Manage your vault encryption keys, account hierarchy, and tokenized access.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Protocol Tabs */}
                <aside className="w-full lg:w-64 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === tab.name
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                : "text-slate-400 hover:bg-white hover:text-slate-900"
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.name}
                        </button>
                    ))}
                    <div className="pt-8 space-y-2">
                        <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-red-500 hover:bg-red-50 transition-all">
                            <LogOut size={18} />
                            Terminate Session
                        </button>
                    </div>
                </aside>

                {/* Protocol Content Area */}
                <div className="flex-1 space-y-8">
                    {activeTab === "Profile" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] p-6 md:p-10 lg:p-14 border border-slate-100 shadow-sm space-y-12"
                        >
                            <div className="flex flex-col md:flex-row gap-8 items-center border-b border-slate-50 pb-12">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-lg">
                                        <img src="https://api.dicebear.com/7.x/shapes/svg?seed=demo" alt="Avatar" />
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 p-3 bg-orange-500 text-white rounded-2xl shadow-lg hover:scale-110 hover:bg-orange-600 transition-all">
                                        <History size={16} />
                                    </button>
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-black text-slate-900">Demo Account Analyst</h3>
                                    <p className="text-slate-400 font-medium">demo@example.com • London Node Registry</p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                        Verified Organization
                                    </div>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: "Full Identity", value: "Demo Account Analyst", placeholder: "Name" },
                                    { label: "Business Entity", value: "Synergyfy Global", placeholder: "Company" },
                                    { label: "Strategic Node", value: "Europe / London", placeholder: "Location" },
                                    { label: "Primary Currency", value: "GBP - Sterling", placeholder: "Currency" },
                                ].map((field) => (
                                    <div key={field.label} className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{field.label}</label>
                                        <input
                                            type="text"
                                            defaultValue={field.value}
                                            placeholder={field.placeholder}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                ))}
                                <div className="md:col-span-2 pt-6">
                                    <button className="px-10 py-4 bg-orange-500 text-white rounded-[1.5rem] font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-100">
                                        Apply Protocol Updates
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === "Security" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-14 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
                                    <Lock size={200} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black mb-4">Vault Encryption Key</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
                                        Your audit data is protected by the 247GBS End-to-End Encryption protocol. Your Master Key is currently active.
                                    </p>
                                    <button className="flex items-center gap-3 px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-black text-sm hover:bg-white/20 transition-all">
                                        <Key size={18} className="text-orange-500" />
                                        Rotate Master Key
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-10 space-y-8">
                                <div className="flex justify-between items-center pb-8 border-b border-slate-50">
                                    <div>
                                        <div className="font-black text-slate-900">Two-Factor Authentication</div>
                                        <div className="text-xs text-slate-400 font-medium mt-1">Add an extra layer of security to your forensic vault.</div>
                                    </div>
                                    <div className="w-14 h-8 bg-green-500 rounded-full p-1 flex items-center justify-end">
                                        <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-black text-slate-900">AI Login Protocol</div>
                                        <div className="text-xs text-slate-400 font-medium mt-1">Enable biometric and behavioral pattern verification.</div>
                                    </div>
                                    <div className="w-14 h-8 bg-slate-100 rounded-full p-1 flex items-center">
                                        <div className="w-6 h-6 bg-white rounded-full shadow-sm border border-slate-200" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "Billing" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Subscription Protocol</div>
                                    <div className="text-3xl font-black text-slate-900 mb-2">Growth Specialist</div>
                                    <div className="text-sm font-bold text-orange-600 mb-8">£499 / Month</div>
                                    <ul className="space-y-3 mb-10">
                                        {["Unlimited Forensic Audits", "AI Roadmap Engine", "5 specialist credits/mo"].map(item => (
                                            <li key={item} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                <CheckCircle2 size={14} className="text-green-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                                        Upgrade to Enterprise
                                    </button>
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
                                        <CreditCard size={120} />
                                    </div>
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Primary Settlement Method</div>
                                            <div className="text-xl font-bold mb-1">•••• •••• •••• 4242</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expires 12/28</div>
                                        </div>
                                        <button className="mt-8 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all w-fit">
                                            Replace Card
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Settlement History</h3>
                                    <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors">Download Archive</button>
                                </div>
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-slate-50">
                                        {[
                                            { id: "#INV-902", date: "Jan 01, 2026", amount: "£499.00", status: "Paid" },
                                            { id: "#INV-841", date: "Dec 01, 2025", amount: "£499.00", status: "Paid" },
                                            { id: "#INV-720", date: "Nov 01, 2025", amount: "£499.00", status: "Paid" },
                                        ].map((inv) => (
                                            <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-10 py-5">
                                                    <div className="text-xs font-black text-slate-900">{inv.id}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium">{inv.date}</div>
                                                </td>
                                                <td className="px-10 py-5 text-xs font-black text-slate-900">{inv.amount}</td>
                                                <td className="px-10 py-5">
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5 text-right">
                                                    <button className="text-slate-300 hover:text-orange-500 transition-colors">
                                                        <History size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "Notifications" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] p-6 md:p-10 lg:p-14 border border-slate-100 shadow-sm space-y-12"
                        >
                            <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Push Protocols</h3>
                                    <p className="text-slate-400 font-medium">Configure how the system communicates tactical updates.</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
                                    <Bell size={24} />
                                </div>
                            </div>

                            <div className="space-y-10">
                                {[
                                    { title: "Forensic Alerts", desc: "Immediate notification of detected capacity leaks.", active: true },
                                    { title: "Strategic Insights", desc: "Weekly AI-generated market trend analysis.", active: true },
                                    { title: "Specialist Messages", desc: "Communications from verified network consultants.", active: false },
                                    { title: "Vault Security", desc: "Alerts for master key rotation and access logs.", active: true },
                                    { title: "Billing Reports", desc: "Invoices and credit balance notifications.", active: false },
                                ].map((notif, i) => (
                                    <div key={i} className="flex justify-between items-start">
                                        <div className="flex-1 pr-10">
                                            <div className="text-sm font-black text-slate-900 mb-1">{notif.title}</div>
                                            <div className="text-xs text-slate-400 font-medium leading-relaxed">{notif.desc}</div>
                                        </div>
                                        <button className={`w-14 h-8 rounded-full p-1 flex items-center transition-all ${notif.active ? 'bg-orange-500 justify-end' : 'bg-slate-100 justify-start'}`}>
                                            <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-slate-50">
                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <ShieldAlert className="text-slate-300" size={24} />
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                        System-critical security alerts cannot be disabled and will be routed to your verified email protocol.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "Tokens" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-white rounded-[3rem] p-6 md:p-10 lg:p-14 border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-50 rounded-full blur-[100px] opacity-50" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900">Session Vault</h3>
                                            <p className="text-slate-500 font-medium">Tokens required for deeper forensic analytics.</p>
                                        </div>
                                        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100">
                                            <Zap size={32} />
                                        </div>
                                    </div>

                                    <div className="text-7xl font-black text-slate-900 tracking-tighter mb-4">12</div>
                                    <p className="text-sm font-black uppercase tracking-widest text-orange-600 mb-10 italic">Credits Available</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-200">
                                            Purchase Bundle (10 Credits)
                                        </button>
                                        <button className="w-full py-5 border-2 border-slate-100 rounded-[1.5rem] font-black text-sm text-slate-500 hover:border-orange-500 hover:text-orange-500 transition-all">
                                            Usage Logs
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-[2.5rem] p-6 md:p-10 border border-slate-100 flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                                    <Bot size={28} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-black text-slate-900">Auto-Refill Threshold</div>
                                    <p className="text-xs text-slate-500 font-medium">Automatically add 5 tokens when balance falls below 3.</p>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-full">Inactive</div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
