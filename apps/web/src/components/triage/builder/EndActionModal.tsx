"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Check,
  Flag,
  FileCheck,
  FileSpreadsheet,
  Building2,
  HelpCircle,
  HeartHandshake,
  ExternalLink,
  UserCheck,
  CircleSlash,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { TriageDestinationType } from "@/services/triage/types";
import { useAdminAuditForms } from "@/services/admin/audit-forms/hooks";

export interface EndActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationType: TriageDestinationType | null;
  destinationTarget: string | null;
  onConfirm: (destinationType: TriageDestinationType, destinationTarget: string | null) => void;
}

interface ActionCategory {
  id: TriageDestinationType;
  title: string;
  badge?: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  hasSubSelect?: "SHORT_FORM" | "LONG_FORM" | "SECTOR" | "CUSTOM" | "TEXT";
}

const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: "SHORT_FORM",
    title: "Short Audit",
    badge: "Recommended for Quick Review",
    description: "Surface-level assessment calculating immediate capacity and excess stock recovery.",
    icon: FileCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    hasSubSelect: "SHORT_FORM",
  },
  {
    id: "LONG_FORM",
    title: "Long Audit",
    badge: "In-Depth Diagnostic",
    description: "Deep forensic operational audit with comprehensive roadmap and strategic metrics.",
    icon: FileSpreadsheet,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    hasSubSelect: "LONG_FORM",
  },
  {
    id: "SECTOR",
    title: "Sector-specific Audit",
    description: "Directs respondent to an industry-tailored audit questionnaire.",
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    hasSubSelect: "SECTOR",
  },
  {
    id: "SUPPORT",
    title: "Support & Information",
    description: "Provides helpful resources and direct contact with our support desk.",
    icon: HelpCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  {
    id: "FUND_OR_DONATE",
    title: "Fund / Donate",
    description: "Route towards investment, grant funding or community contribution opportunities.",
    icon: HeartHandshake,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-200",
  },
  {
    id: "MCOM",
    title: "Other MCOM Service",
    description: "Handoff to an associated commercial or advisory platform service.",
    icon: ExternalLink,
    color: "text-sky-600",
    bgColor: "bg-sky-50 border-sky-200",
    hasSubSelect: "TEXT",
  },
  {
    id: "HUMAN_REVIEW",
    title: "Human Specialist Review",
    description: "Submits answers for direct evaluation by an assigned specialist.",
    icon: UserCheck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-200",
  },
  {
    id: "NO_ACTION",
    title: "No Immediate Action",
    description: "Thank the respondent and store the submission without triggering a follow-up audit.",
    icon: CircleSlash,
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-200",
  },
];

const SECTOR_OPTIONS = [
  "Hospitality & Restaurants",
  "Retail & E-Commerce",
  "Logistics & Warehousing",
  "Manufacturing & Industrial",
  "Healthcare & Wellness",
  "Professional Services",
  "Other Sector",
];

export function EndActionModal({
  isOpen,
  onClose,
  destinationType: initialType,
  destinationTarget: initialTarget,
  onConfirm,
}: EndActionModalProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<TriageDestinationType>(
    initialType || "SHORT_FORM"
  );
  const [selectedTarget, setSelectedTarget] = useState<string>(initialTarget || "");

  // Audit forms
  const { data: shortAudits } = useAdminAuditForms("SHORT_FORM");
  const { data: longAudits } = useAdminAuditForms("LONG_FORM");

  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType || "SHORT_FORM");
      setSelectedTarget(initialTarget || "");
      setSearch("");
    }
  }, [isOpen, initialType, initialTarget]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return ACTION_CATEGORIES;
    const q = search.toLowerCase();
    return ACTION_CATEGORIES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.badge && c.badge.toLowerCase().includes(q))
    );
  }, [search]);

  // Available audits based on current type
  const currentAudits = useMemo(() => {
    if (selectedType === "SHORT_FORM") return shortAudits || [];
    if (selectedType === "LONG_FORM") return longAudits || [];
    return [];
  }, [selectedType, shortAudits, longAudits]);

  const handleSelectCategory = (cat: ActionCategory) => {
    setSelectedType(cat.id);
    if (cat.id === "SHORT_FORM") {
      const def = (shortAudits || []).find((a) => a.isDefault);
      setSelectedTarget(def ? def.id : "");
    } else if (cat.id === "LONG_FORM") {
      const def = (longAudits || []).find((a) => a.isDefault);
      setSelectedTarget(def ? def.id : "");
    } else if (cat.id === "SECTOR" && !selectedTarget) {
      setSelectedTarget(SECTOR_OPTIONS[0]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedType, selectedTarget.trim() || null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative z-10 flex h-[90vh] max-h-[720px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <Flag size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select End / Submit Action</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Choose the destination when respondents select this answer.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-6 py-3">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action types (e.g. Short Audit, Long Audit, Sector)..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Action List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedType === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-150 ${
                    isSelected
                      ? "border-orange-500 bg-orange-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${cat.bgColor} ${cat.color}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {cat.title}
                        </h4>
                        {cat.badge && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 font-medium leading-relaxed">
                        {cat.description}
                      </p>

                      {/* Sub-selectors when this option is selected */}
                      {isSelected && cat.hasSubSelect === "SHORT_FORM" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 pt-3 border-t border-orange-100"
                        >
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                            Select Particular Short Audit
                          </label>
                          <select
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-orange-500"
                          >
                            <option value="">Default Short Audit</option>
                            {currentAudits.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title} {a.isDefault ? "(Default)" : ""}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}

                      {isSelected && cat.hasSubSelect === "LONG_FORM" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 pt-3 border-t border-orange-100"
                        >
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                            Select Particular Long Audit
                          </label>
                          <select
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-orange-500"
                          >
                            <option value="">Default Long Audit</option>
                            {currentAudits.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title} {a.isDefault ? "(Default)" : ""}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}

                      {isSelected && cat.hasSubSelect === "SECTOR" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 pt-3 border-t border-orange-100"
                        >
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                            Target Sector
                          </label>
                          <select
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-orange-500"
                          >
                            {SECTOR_OPTIONS.map((sec) => (
                              <option key={sec} value={sec}>
                                {sec}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}

                      {isSelected && cat.hasSubSelect === "TEXT" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 pt-3 border-t border-orange-100"
                        >
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                            Target Service Identifier or URL
                          </label>
                          <input
                            type="text"
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="e.g. consulting or funding-portal"
                            className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm outline-none focus:border-orange-500"
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-slate-300 bg-white text-transparent group-hover:border-slate-400"
                        }`}
                      >
                        <Check size={13} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">No actions matched your search.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
            >
              <span>Confirm Destination</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
