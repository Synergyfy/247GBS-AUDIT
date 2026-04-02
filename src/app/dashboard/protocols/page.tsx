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
import useBilling from "@/services/protocols/billing/hooks";
import useDashboard from "@/services/dashboard/hooks";
import useProfile from "@/services/users/profile/hooks";
import useSecurity from "@/services/protocols/security/hooks";
import useNotifications from "@/services/protocols/notifications/hooks";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";

function BillingSection() {
    const { data, loading, error, refresh } = useBilling();

    const planName = data?.planName ?? "—";
    const price = data?.price ?? "—";
    const last4 = data?.last4 ?? "•••• •••• •••• 0000";
    const expiry = data?.expiry ?? "--/--";
    const history = data?.history ?? [];

    return (
        <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Subscription Protocol</div>
                    <div className="text-3xl font-black text-slate-900 mb-2">{planName}</div>
                    <div className="text-sm font-bold text-orange-600 mb-8">{price}</div>
                    <div className="flex gap-3">
                        <button onClick={() => refresh()} className="w-full py-4 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-orange-500 hover:text-orange-500 transition-all">
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-orange-500 group-hover:scale-125 transition-transform duration-1000">
                        <CreditCard size={120} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Primary Settlement Method</div>
                            <div className="text-xl font-bold mb-1">{last4}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expires {expiry}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Settlement History</h3>
                    <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors">Download Archive</button>
                </div>
                {loading ? (
                    <div className="p-12 text-center text-sm text-slate-500">Loading billing history...</div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center text-sm text-slate-500">No settlements found.</div>
                ) : (
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-50">
                            {history.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-10 py-5">
                                        <div className="text-xs font-black text-slate-900">{inv.id}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{inv.date}</div>
                                    </td>
                                    <td className="px-10 py-5 text-xs font-black text-slate-900">{inv.amount}</td>
                                    <td className="px-10 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'Paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
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
                )}
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
        </>
    );
}

function TokenSection() {
    const { data, loading, refresh } = useDashboard();
    const [purchasing, setPurchasing] = useState(false);
    const tokenBalance = data?.tokenBalance ?? 0;

    const handlePurchase = async () => {
        setPurchasing(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${API_BASE_URL}/protocols/tokens/purchase`, {
                method: "POST",
                headers,
            });

            if (!res.ok) throw new Error("Purchase failed");
            await refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setPurchasing(false);
        }
    };

    return (
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

                <div className="text-7xl font-black text-slate-900 tracking-tighter mb-4">{loading ? '—' : tokenBalance}</div>

                <p className="text-sm font-black uppercase tracking-widest text-orange-600 mb-10 italic">Credits Available</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {purchasing ? "Processing..." : "Purchase Bundle (10 Credits)"}
                    </button>
                    <button className="w-full py-5 border-2 border-slate-100 rounded-[1.5rem] font-black text-sm text-slate-500 hover:border-orange-500 hover:text-orange-500 transition-all">
                        Usage Logs
                    </button>
                </div>
            </div>
        </div>
    );
}

function SecurityContent() {
    const { data, loading, error, rotateKey } = useSecurity();
    const [rotating, setRotating] = React.useState(false);
    const [rotateMsg, setRotateMsg] = React.useState<string | null>(null);

    const handleRotate = async () => {
        setRotating(true);
        setRotateMsg(null);
        const ok = await rotateKey();
        setRotateMsg(ok ? "Master key rotated successfully." : "Failed to rotate key.");
        setRotating(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            <div className="bg-white rounded-[3rem] p-6 md:p-10 lg:p-14 border border-slate-100 shadow-sm space-y-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Security Protocol</h3>
                    <p className="text-slate-400 font-medium">Manage encryption keys and authentication layers.</p>
                </div>

                {loading ? (
                    <div className="text-sm text-slate-500">Loading security status...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">2FA Status</div>
                            <div className={`text-sm font-black ${data?.is2FAEnabled ? 'text-green-600' : 'text-red-500'}`}>
                                {data?.is2FAEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Key</div>
                            <div className={`text-sm font-black ${data?.masterKeyActive ? 'text-green-600' : 'text-orange-500'}`}>
                                {data?.masterKeyActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password Strength</div>
                            <div className="text-sm font-black text-slate-900">{data?.passwordStrength ?? '—'}</div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Login</div>
                            <div className="text-sm font-black text-slate-900">{data?.lastLogin ?? '—'}</div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        onClick={handleRotate}
                        disabled={rotating}
                        className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center gap-3"
                    >
                        <Key size={16} />
                        {rotating ? 'Rotating...' : 'Rotate Master Key'}
                    </button>
                </div>
                {rotateMsg && <p className={`text-xs font-bold ${rotateMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{rotateMsg}</p>}
                {error && <p className="text-xs font-bold text-red-500">{error}</p>}
            </div>
        </motion.div>
    );
}

function NotificationsContent() {
    const { data, loading, error, toggleNotification } = useNotifications();
    const [toggling, setToggling] = React.useState<string | null>(null);

    const handleToggle = async (title: string, current: boolean) => {
        setToggling(title);
        await toggleNotification(title, !current);
        setToggling(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            <div className="bg-white rounded-[3rem] p-6 md:p-10 lg:p-14 border border-slate-100 shadow-sm space-y-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Notification Matrix</h3>
                    <p className="text-slate-400 font-medium">Configure your alert protocols and signal routing.</p>
                </div>

                {loading ? (
                    <div className="text-sm text-slate-500">Loading notification settings...</div>
                ) : data.length === 0 ? (
                    <div className="text-sm text-slate-500">No notification settings found.</div>
                ) : (
                    <div className="space-y-4">
                        {data.map((item) => (
                            <div key={item.title} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-orange-100 transition-colors">
                                <div>
                                    <div className="text-sm font-black text-slate-900">{item.title}</div>
                                    <div className="text-xs text-slate-400 font-medium mt-1">{item.desc}</div>
                                </div>
                                <button
                                    onClick={() => handleToggle(item.title, item.active)}
                                    disabled={toggling === item.title}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50 ${
                                        item.active ? 'bg-orange-500' : 'bg-slate-200'
                                    }`}
                                >
                                    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                                        item.active ? 'left-8' : 'left-1'
                                    }`} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <ShieldAlert className="text-slate-300" size={24} />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                            System-critical security alerts cannot be disabled and will be routed to your verified email protocol.
                        </p>
                    </div>
                </div>
                {error && <p className="text-xs font-bold text-red-500">{error}</p>}
            </div>
        </motion.div>
    );
}

export default function ProtocolsPage() {
    const [activeTab, setActiveTab] = useState("Profile");
    const { data: profile, loading: profileLoading, error: profileError, refresh: refreshProfile } = useProfile();

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
                                        <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${profile?.email ?? 'demo'}`} alt="Avatar" />
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 p-3 bg-orange-500 text-white rounded-2xl shadow-lg hover:scale-110 hover:bg-orange-600 transition-all">
                                        <History size={16} />
                                    </button>
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-black text-slate-900">{profileLoading ? 'Loading...' : `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`}</h3>
                                    <p className="text-slate-400 font-medium">{profile?.email ?? '—'} • {profile?.location ?? '—'}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                        Verified Organization
                                    </div>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: "Full Identity", value: `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`, placeholder: "Name" },
                                    { label: "Business Entity", value: profile?.businessName ?? '', placeholder: "Company" },
                                    { label: "Strategic Node", value: profile?.location ?? '', placeholder: "Location" },
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
                        <SecurityContent />
                    )}

                    {activeTab === "Billing" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <BillingSection />
                        </motion.div>
                    )}

                    {activeTab === "Notifications" && (
                        <NotificationsContent />
                    )}

                    {activeTab === "Tokens" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <TokenSection />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
