"use client";

import { SECTORS } from "@/data/sectors";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Globe, Factory, Utensils, Info } from "lucide-react";

export default function SectorSelectionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auditType = searchParams.get("type") || "SHORT_FORM";

    const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

    const activeSector = useMemo(() => SECTORS.find((s) => s.id === selectedSectorId), [selectedSectorId]);
    const activeGroup = useMemo(() => activeSector?.groups.find((g) => g.id === selectedGroupId), [activeSector, selectedGroupId]);
    const activeType = useMemo(() => activeGroup?.types.find((t) => t.id === selectedTypeId), [activeGroup, selectedTypeId]);

    const handleComplete = () => {
        if (selectedSectorId && selectedGroupId && selectedTypeId) {
            router.push(
                `/audit/flow?type=${auditType}&sector=${selectedSectorId}&group=${selectedGroupId}&businessType=${selectedTypeId}`
            );
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row relative">
            {/* Dynamic Visual Side */}
            <div className="relative w-full md:w-2/5 h-64 md:h-auto bg-slate-900 overflow-hidden">
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
                                    className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
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
                <div className="max-w-xl mx-auto">
                    <header className="mb-12">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Classify Your Business</h1>
                        <p className="text-slate-500 font-medium">Select your sector, group, and specific type to begin.</p>
                    </header>

                    <div className="space-y-8">
                        {/* Step 1: Sector */}
                        <div className="relative">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">1. Industry Sector</label>
                            <div className="grid grid-cols-1 gap-3">
                                {SECTORS.map((sector) => (
                                    <button
                                        key={sector.id}
                                        onClick={() => {
                                            setSelectedSectorId(sector.id);
                                            setSelectedGroupId(null);
                                            setSelectedTypeId(null);
                                        }}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${selectedSectorId === sector.id
                                                ? "border-orange-500 bg-white shadow-xl shadow-orange-100 scale-[1.02]"
                                                : "border-slate-100 bg-white hover:border-slate-200"
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedSectorId === sector.id ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400"
                                            }`}>
                                            {sector.id === 'hospitality-food' ? <Utensils size={24} /> : <Factory size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900">{sector.name}</div>
                                            <div className="text-xs text-slate-400">Forensic tools available</div>
                                        </div>
                                        {selectedSectorId === sector.id && <ChevronRight size={20} className="text-orange-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Group (Dependent) */}
                        <AnimatePresence>
                            {selectedSectorId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">2. Business Group</label>
                                    <div className="flex flex-wrap gap-2">
                                        {activeSector?.groups.map((group) => (
                                            <button
                                                key={group.id}
                                                onClick={() => {
                                                    setSelectedGroupId(group.id);
                                                    setSelectedTypeId(null);
                                                }}
                                                className={`px-6 py-3 rounded-full border-2 font-bold text-sm transition-all ${selectedGroupId === group.id
                                                        ? "border-orange-500 bg-orange-500 text-white"
                                                        : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                                                    }`}
                                            >
                                                {group.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Step 3: Type (Dependent) */}
                        <AnimatePresence>
                            {selectedGroupId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">3. Specific Business Type</label>
                                    <select
                                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                                        value={selectedTypeId || ""}
                                        onChange={(e) => setSelectedTypeId(e.target.value)}
                                    >
                                        <option value="" disabled>Select sub-type...</option>
                                        {activeGroup?.types.map((type) => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-12">
                        <button
                            onClick={handleComplete}
                            disabled={!selectedTypeId}
                            className={`w-full py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${selectedTypeId
                                    ? "bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-300 translate-y-0"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed translate-y-1"
                                }`}
                        >
                            Initialize Audit Flow
                            <ChevronRight size={24} />
                        </button>
                        <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-[0.2em] font-black">
                            Step 2 of 4: Profile Classification
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
