"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
    User,
    Mail,
    Building2,
    MapPin,
    Phone,
    Globe,
    ShieldCheck,
    Save,
    Camera
} from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        company: "Global Corp",
        role: "Administrator",
        phone: "+44 20 7123 4567",
        location: "London, UK",
        website: "www.globalcorp.com"
    });

    useEffect(() => {
        if (user) {
            const names = user.name.split(" ");
            setFormData(prev => ({
                ...prev,
                firstName: names[0] || "",
                lastName: names.slice(1).join(" ") || "",
                email: user.email,
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }, 1500);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Profile</h1>
                <p className="text-slate-500 font-medium">Manage your personal information and account security.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-slate-900 to-slate-800" />

                        <div className="relative mt-12 mb-6">
                            <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                                <img
                                    src={user?.avatar || "https://api.dicebear.com/7.x/shapes/svg?seed=guest"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button className="absolute bottom-[-10px] right-[-10px] w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors">
                                <Camera size={18} />
                            </button>
                        </div>

                        <h2 className="text-xl font-black text-slate-900">{user?.name}</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6">{user?.email}</p>

                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck size={14} />
                            Master Administrator
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck size={120} strokeWidth={0.5} />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Security Status</h3>
                        <div className="text-4xl font-black text-green-400 mb-6">98%</div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                Two-Factor Auth Enabled
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                Password Strength: High
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                Last Login: Just now
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Edit Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">Personal Details</h3>
                            {isSaved && (
                                <motion.span
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-green-600 text-sm font-bold flex items-center gap-2"
                                >
                                    <ShieldCheck size={16} /> Changes Saved
                                </motion.span>
                            )}
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">First Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Last Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled
                                            className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 font-bold cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Company Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                        <Building2 size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Location</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <MapPin size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">Website</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                            <Globe size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all ${isLoading
                                        ? "bg-slate-300 cursor-wait"
                                        : "bg-slate-900 hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1"
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
