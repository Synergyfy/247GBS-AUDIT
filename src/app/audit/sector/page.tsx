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
    Filter,
    ArrowLeft,
    ArrowRight,
    CheckCircle2
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
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Sector Modules...</p>
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
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = useMemo(() => {
        if (!searchTerm) return [];
        const results: Array<{ sectorId: string, groupId: string, typeId: string, name: string, path: string }> = [];
        const term = searchTerm.toLowerCase();

        SECTORS.forEach(sector => {
            sector.groups.forEach(group => {
                group.types.forEach(type => {
                    if (
                        type.name.toLowerCase().includes(term) ||
                        group.name.toLowerCase().includes(term) ||
                        sector.name.toLowerCase().includes(term)
                    ) {
                        results.push({
                            sectorId: sector.id,
                            groupId: group.id,
                            typeId: type.id,
                            name: type.name,
                            path: `${sector.name} > ${group.name}`
                        });
                    }
                });
            });
        });
        return results.slice(0, 6);
    }, [searchTerm]);

    const activeSector = useMemo(() => SECTORS.find((s) => s.id === selectedSectorId), [selectedSectorId]);
    const activeGroup = useMemo(() => activeSector?.groups.find((g) => g.id === selectedGroupId), [activeSector, selectedGroupId]);
    const activeType = useMemo(() => activeGroup?.types.find((t) => t.id === selectedTypeId), [activeGroup, selectedTypeId]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
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

                // If we don't have an auditId, we need to create a new session first
                // For now, we'll assume the backend can handle a PATCH or POST to create/update
                let targetAuditId = auditId;
                
                let res = await fetch(`${API_BASE_URL}/audit/${targetAuditId || 'init'}`, {
                    method: targetAuditId ? "PATCH" : "POST",
                    headers,
                    body: JSON.stringify(payload)
                });

                if (res.status === 401) {
                    const newToken = await refreshAccessToken();
                    if (newToken) {
                        headers["Authorization"] = `Bearer ${newToken}`;
                        res = await fetch(`${API_BASE_URL}/audit/${targetAuditId || 'init'}`, {
                            method: targetAuditId ? "PATCH" : "POST",
                            headers,
                            body: JSON.stringify(payload)
                        });
                    }
                }

                if (!res.ok) throw new Error("Failed to configure sector");
                
                const responseData = await res.json();
                const finalAuditId = responseData.auditSessionId || targetAuditId;

                // After sector is set, we go to Triage to determine the audit depth
                router.push(`/audit/triage?id=${finalAuditId}&sector=${selectedSectorId}`);
            } catch (err) {
                console.error("Sector selection failed:", err);
                // Fallback for demo/dev if API is purely session-based
                router.push(`/audit/triage?sector=${selectedSectorId}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100">
            {/* Native-Feel Header */}
            <header className="h-16 md:h-24 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.back()}
                        className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-base md:text-xl shadow-lg">A</div>
                        <span className="font-bold text-sm md:text-lg tracking-tight text-slate-900">247GBS Audit</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration</span>
                        <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div className={`h-full bg-orange-500 transition-all duration-500 ${selectedSectorId ? selectedGroupId ? selectedTypeId ? "w-full" : "w-2/3" : "w-1/3" : "w-0"}`} />
                        </div>
                    </div>
                    <div className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 border border-slate-100 rounded-lg md:rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">Node: Active</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full md:p-6 lg:p-12 gap-6 md:gap-12">
                
                {/* Visual Context Panel - Compact on mobile */}
                <div className="w-full md:w-[350px] lg:w-[400px] md:h-fit md:sticky md:top-32 order-2 md:order-1">
                    <div className="bg-slate-900 md:rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                        <div className="h-48 md:h-64 relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSector?.id || "default"}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0"
                                >
                                    {activeSector?.visuals.backgroundImage ? (
                                        <img
                                            src={activeSector.visuals.backgroundImage}
                                            alt={activeSector.name}
                                            className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-2 block">Industry Context</span>
                                <h2 className="text-xl md:text-3xl font-bold text-white leading-tight">
                                    {activeType?.name || activeSector?.name || "Target Sector"}
                                </h2>
                            </div>
                        </div>
                        <div className="p-6 md:p-8 space-y-4">
                            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                                Our engine applies industry-specific <strong className="text-white">benchmarking protocols</strong> based on your selection.
                            </p>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                        (i === 1 && selectedSectorId) || (i === 2 && selectedGroupId) || (i === 3 && selectedTypeId) 
                                        ? "bg-orange-500" : "bg-slate-800"
                                    }`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selection Interface */}
                <div className="flex-1 order-1 md:order-2 px-4 md:px-0">
                    <div className="bg-white md:rounded-[3rem] p-6 md:p-10 lg:p-14 md:shadow-2xl md:shadow-slate-200/50 md:border md:border-slate-100">
                        <header className="mb-8 md:mb-10">
                            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2">Classify Your Business</h1>
                            <p className="text-slate-500 text-sm md:text-base font-medium">Select your industry from our business modules.</p>
                        </header>

                        {/* Search Component */}
                        <div className="relative mb-8 md:mb-12 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search sectors or categories..."
                                className="w-full pl-12 pr-6 py-4 md:py-5 bg-slate-50 md:bg-white border-2 border-transparent md:border-slate-100 rounded-xl md:rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-900 text-sm md:text-base"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                            />

                            {/* Smart Suggestions Overlay */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-20" 
                                            onClick={() => setShowSuggestions(false)} 
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 p-2 space-y-1 z-30"
                                        >
                                            <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                                                Smart Matches
                                            </div>
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={`${s.typeId}-${i}`}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedSectorId(s.sectorId);
                                                        setSelectedGroupId(s.groupId);
                                                        setSelectedTypeId(s.typeId);
                                                        setSearchTerm(s.name);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-xl transition-all flex items-center justify-between group"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{s.name}</div>
                                                        <div className="text-[10px] font-medium text-slate-400">{s.path}</div>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-200 group-hover:text-orange-400 transition-transform group-hover:translate-x-1" />
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-6 md:space-y-10">
                            {/* Step 1: Sector */}
                            <div className="space-y-3 md:space-y-4">
                                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 block ml-1">1. Industry Sector</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors z-10">
                                        {selectedSectorId ? (
                                            (() => {
                                                const sector = SECTORS.find(s => s.id === selectedSectorId);
                                                const Icon = ICON_MAP[sector?.visuals.iconName || "Factory"];
                                                return <Icon size={18} className="md:w-5 md:h-5" />;
                                            })()
                                        ) : <Filter size={18} className="md:w-5 md:h-5" />}
                                    </div>
                                    <select
                                        className="w-full pl-12 pr-10 py-4 md:py-5 bg-slate-50 md:bg-white border-2 border-transparent md:border-slate-100 rounded-xl md:rounded-[2rem] font-bold text-slate-900 text-sm md:text-base outline-none focus:border-orange-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                        value={selectedSectorId || ""}
                                        onChange={(e) => {
                                            setSelectedSectorId(e.target.value);
                                            setSelectedGroupId(null);
                                            setSelectedTypeId(null);
                                        }}
                                    >
                                        <option value="" disabled>Select sector...</option>
                                        {SECTORS.map((sector) => (
                                            <option key={sector.id} value={sector.id}>{sector.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                        <ChevronRight size={18} className="rotate-90 md:w-5 md:h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Group */}
                            <AnimatePresence mode="wait">
                                {selectedSectorId && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="space-y-3 md:space-y-4"
                                    >
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 block ml-1">2. Category Group</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-4 md:py-5 bg-slate-50 md:bg-white border-2 border-transparent md:border-slate-100 rounded-xl md:rounded-[2rem] font-bold text-slate-900 text-sm md:text-base outline-none focus:border-orange-500 focus:bg-white transition-all appearance-none cursor-pointer"
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
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                                <ChevronRight size={18} className="rotate-90 md:w-5 md:h-5" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Step 3: Type */}
                            <AnimatePresence mode="wait">
                                {selectedGroupId && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="space-y-3 md:space-y-4"
                                    >
                                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 block ml-1">3. Specific Business Subtype</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-4 md:py-5 bg-slate-50 md:bg-white border-2 border-transparent md:border-slate-100 rounded-xl md:rounded-[2rem] font-bold text-slate-900 text-sm md:text-base outline-none focus:border-orange-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                                value={selectedTypeId || ""}
                                                onChange={(e) => setSelectedTypeId(e.target.value)}
                                            >
                                                <option value="" disabled>Select business sub-type...</option>
                                                {activeGroup?.types.map((type) => (
                                                    <option key={type.id} value={type.id}>{type.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                                <ChevronRight size={18} className="rotate-90 md:w-5 md:h-5" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-12 md:mt-16">
                            <button
                                onClick={handleComplete}
                                disabled={!selectedTypeId || isSubmitting}
                                className={`w-full py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] font-bold text-base md:text-xl flex items-center justify-center gap-3 transition-all active:scale-95 group ${selectedTypeId && !isSubmitting
                                    ? "bg-slate-900 text-white hover:bg-black shadow-xl md:shadow-2xl"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                                    }`}
                            >
                                {isSubmitting ? "Configuring Module..." : "Apply Industry Protocol"}
                                <ChevronRight size={20} className={`transition-transform group-hover:translate-x-1 ${selectedTypeId ? "text-orange-500" : "text-slate-300"}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                © 2026 247 Global Business Solutions Ltd. Sector Benchmarking Active.
            </footer>
        </div>
    );
}
