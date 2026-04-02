"use client";

import { SECTORS } from "@/data/sectors";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    Globe,
    Factory,
    Utensils,
    Info,
    ShoppingBag,
    Briefcase,
    HardHat,
    Heart,
    GraduationCap,
    Truck,
    Cpu,
    Landmark,
    Plane,
    Sprout,
    Users,
    Monitor,
    Search,
    Filter
} from "lucide-react";

import { Suspense } from "react";

const ICON_MAP: Record<string, any> = {
    Utensils,
    ShoppingBag,
    Factory,
    Briefcase,
    HardHat,
    Heart,
    GraduationCap,
    Truck,
    Cpu,
    Landmark,
    Plane,
    Sprout,
    Users,
    Monitor
};

export default function SectorSelectionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Sector Modules...</p>
                </div>
            </div>
        }>
            <SectorSelectionContent />
        </Suspense>
    );
}

function SectorSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auditType = searchParams.get("type") || "SHORT_FORM";
    const auditId = searchParams.get("id");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

    const filteredSectors = useMemo(() => {
        return SECTORS.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.groups.some(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm]);

    const activeSector = useMemo(() => SECTORS.find((s) => s.id === selectedSectorId), [selectedSectorId]);
    const activeGroup = useMemo(() => activeSector?.groups.find((g) => g.id === selectedGroupId), [activeSector, selectedGroupId]);
    const activeType = useMemo(() => activeGroup?.types.find((t) => t.id === selectedTypeId), [activeGroup, selectedTypeId]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        if (!auditId) {
            alert("No audit session found. Please retake the Triage.");
            return;
        }

        if (selectedSectorId && selectedGroupId && selectedTypeId) {
            setIsSubmitting(true);
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
                const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                };
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const payload = {
                    sectorId: selectedSectorId,
                    groupId: selectedGroupId,
                    businessTypeId: selectedTypeId
                };

                let res = await fetch(`${API_BASE_URL}/audit/${auditId}/sector`, {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify(payload)
                });

                if (res.status === 401) {
                    const newToken = await refreshAccessToken();
                    if (newToken) {
                        headers["Authorization"] = `Bearer ${newToken}`;
                        res = await fetch(`${API_BASE_URL}/audit/${auditId}/sector`, {
                            method: "PATCH",
                            headers,
                            body: JSON.stringify(payload)
                        });
                    }
                }

                if (!res.ok) {
                    throw new Error("Failed to configure audit sector");
                }

                const stock = searchParams.get("stock") || "true";
                const capacity = searchParams.get("capacity") || "true";

                router.push(
                    `/audit/flow?id=${auditId}&type=${auditType}&sector=${selectedSectorId}&group=${selectedGroupId}&businessType=${selectedTypeId}&stock=${stock}&capacity=${capacity}`
                );
            } catch (err) {
                console.error("Sector selection failed:", err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row relative">
            {/* Dynamic Visual Side */}
            <div className="relative w-full md:w-2/5 h-64 md:h-auto bg-slate-900 overflow-hidden">
                <nav className="absolute top-0 left-0 w-full z-20 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">A</div>
                        <span className="font-bold tracking-tight">247GBS</span>
                    </div>
                </nav>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSector?.id || "default"}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 z-0 text-white"
                    >
                        {activeSector?.visuals.backgroundImage ? (
                            <>
                                <img
                                    src={activeSector.visuals.backgroundImage}
                                    alt={activeSector.name}
                                    className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                            </>
                        ) : (
                            <div className="w-full h-full bg-slate-900" />
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="text-orange-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">
                            Audit Configuration
                        </span>
                        <h2 className="text-4xl font-black mb-4">
                            {activeType?.name || activeSector?.name || "Target Sector"}
                        </h2>
                        <p className="text-slate-300 max-w-sm leading-relaxed text-sm">
                            Precise classification ensures we apply the correct calculation models and benchmarking for your industry.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Selection Flow Side */}
            <div className="flex-1 p-8 lg:p-20 overflow-y-auto bg-slate-50/30">
                <div className="max-w-2xl mx-auto">
                    <header className="mb-12">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Classify Your Business</h1>
                        <p className="text-slate-500 font-medium italic">Select your sector from our 14 business modules.</p>
                    </header>

                    {/* Search Bar */}
                    <div className="relative mb-10 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search sectors or categories..."
                            className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 shadow-sm transition-all font-bold text-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-10">
                        {/* Step 1: Sector */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">1. Industry Sector</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors z-10">
                                    {selectedSectorId ? (
                                        (() => {
                                            const Icon = ICON_MAP[SECTORS.find(s => s.id === selectedSectorId)?.visuals.iconName || "Factory"];
                                            return <Icon size={20} />;
                                        })()
                                    ) : <Filter size={20} />}
                                </div>
                                <select
                                    className="w-full pl-14 pr-12 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-900 outline-none focus:border-orange-500 shadow-sm transition-all appearance-none cursor-pointer relative z-0"
                                    value={selectedSectorId || ""}
                                    onChange={(e) => {
                                        setSelectedSectorId(e.target.value);
                                        setSelectedGroupId(null);
                                        setSelectedTypeId(null);
                                    }}
                                >
                                    <option value="" disabled>Select major industry sector...</option>
                                    {SECTORS.map((sector) => (
                                        <option key={sector.id} value={sector.id}>{sector.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                    <ChevronRight size={20} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Group (Dependent) */}
                        <AnimatePresence>
                            {selectedSectorId && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    className="space-y-4"
                                >
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">2. Business Group</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-900 outline-none focus:border-orange-500 shadow-sm transition-all appearance-none cursor-pointer"
                                            value={selectedGroupId || ""}
                                            onChange={(e) => {
                                                setSelectedGroupId(e.target.value);
                                                setSelectedTypeId(null);
                                            }}
                                        >
                                            <option value="" disabled>Select category group...</option>
                                            {activeSector?.groups.map((group) => (
                                                <option key={group.id} value={group.id}>{group.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                            <ChevronRight size={20} className="rotate-90" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Step 3: Type (Dependent) */}
                        <AnimatePresence>
                            {selectedGroupId && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    className="space-y-4"
                                >
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">3. Specific Business Subcategory</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-900 outline-none focus:border-orange-500 shadow-sm transition-all appearance-none cursor-pointer"
                                            value={selectedTypeId || ""}
                                            onChange={(e) => setSelectedTypeId(e.target.value)}
                                        >
                                            <option value="" disabled>Select exact business sub-type...</option>
                                            {activeGroup?.types.map((type) => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                            <ChevronRight size={20} className="rotate-90" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-16">
                        <button
                            onClick={handleComplete}
                            disabled={!selectedTypeId || isSubmitting}
                            className={`w-full py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${selectedTypeId && !isSubmitting
                                ? "bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-200"
                                : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                }`}
                        >
                            {isSubmitting ? "Initializing Engine..." : "Initialize Audit Engine"}
                            <ChevronRight size={24} />
                        </button>
                        <div className="flex justify-center gap-8 mt-6">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`h-1.5 rounded-full transition-all ${s === 1 && selectedSectorId ? "w-8 bg-orange-500" :
                                        s === 2 && selectedGroupId ? "w-8 bg-orange-500" :
                                            s === 3 && selectedTypeId ? "w-8 bg-orange-500" :
                                                "w-4 bg-slate-200"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
