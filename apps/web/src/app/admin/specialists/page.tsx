"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Search, Star, ExternalLink, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Specialist {
    id: string;
    name: string;
    role: string;
    rating: number;
    reviews: number;
    expertise: string[];
    status: string;
    experience: string;
    image: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://247-gbs-audit-backend.vercel.app/api/v1';

export default function AdminSpecialistsPage() {
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        rating: 5.0,
        reviews: 0,
        expertise: "",
        status: "Available",
        experience: "",
        image: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSpecialists = async () => {
        try {
            const token = localStorage.getItem('247gbs_token');
            const res = await fetch(`${API_BASE_URL}/specialists`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSpecialists(data);
            }
        } catch (err) {
            console.error("Failed to fetch specialists", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecialists();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const token = localStorage.getItem('247gbs_token');
            const payload = {
                ...formData,
                expertise: formData.expertise.split(',').map(e => e.trim()).filter(Boolean),
                image: formData.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name.replace(/\s+/g, '')}`
            };

            const res = await fetch(`${API_BASE_URL}/specialists`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to create specialist");
            
            setIsCreateModalOpen(false);
            setFormData({ name: "", role: "", rating: 5.0, reviews: 0, expertise: "", status: "Available", experience: "", image: "" });
            fetchSpecialists(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Specialist Network</h1>
                    <p className="text-slate-500 font-medium">Manage and onboard verified forensic auditors and domain experts.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search network..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl shrink-0"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Specialist</span>
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {specialists.map((pro) => (
                        <div key={pro.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <img src={pro.image} alt={pro.name} className="w-16 h-16 rounded-2xl bg-slate-100" />
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-orange-600 transition-colors">{pro.name}</h3>
                                        <p className="text-xs font-bold text-slate-500">{pro.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg">
                                    <Star size={12} className="text-orange-500 fill-orange-500" />
                                    {pro.rating}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {pro.expertise.map(exp => (
                                    <span key={exp} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                                        {exp}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-4 border-t border-slate-50">
                                <span>{pro.experience}</span>
                                <span className={pro.status === 'Available' ? 'text-green-500' : 'text-orange-500'}>{pro.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Onboard Specialist</h2>
                                    <p className="text-sm font-medium text-slate-500">Add a new expert to the network.</p>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}
                                
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                                    <input 
                                        type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                        placeholder="Dr. Example Name"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Role/Title</label>
                                        <input 
                                            type="text" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="Operations Auditor"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Experience</label>
                                        <input 
                                            type="text" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="10+ Years"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Expertise Domains (Comma-separated)</label>
                                    <input 
                                        type="text" required value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                        placeholder="FinTech, Logistics, Hospitality"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Status</label>
                                        <select 
                                            value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                        >
                                            <option value="Available">Available</option>
                                            <option value="In Call">In Call</option>
                                            <option value="Out of Office">Out of Office</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Avatar Seed (Optional)</label>
                                        <input 
                                            type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                            placeholder="Leave blank to auto-generate"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit" disabled={isSubmitting}
                                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Publish to Network"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
