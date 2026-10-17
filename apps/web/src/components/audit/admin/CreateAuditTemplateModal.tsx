"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Star, Layers, Building2, ChevronDown, Loader2 } from "lucide-react";
import { auditFormsApi } from "@/services/admin/audit-forms/hooks";
import type { AuditForm, AuditFormType } from "@/services/admin/audit-forms/types";
import {
  fetchEcosystemSectors,
  fetchEcosystemCategories,
  fetchEcosystemSubcategories,
  type EcosystemSector,
  type EcosystemCategory,
  type EcosystemSubcategory,
} from "@/services/ecosystem/catalog";

interface CreateAuditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (form: AuditForm) => void;
  defaultType?: AuditFormType;
}

export function CreateAuditTemplateModal({
  isOpen,
  onClose,
  onCreated,
  defaultType = "SHORT_FORM",
}: CreateAuditTemplateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [auditType, setAuditType] = useState<AuditFormType>(defaultType);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sector / Category / Subcategory states from Central Hub Solution
  const [sectors, setSectors] = useState<EcosystemSector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [categories, setCategories] = useState<EcosystemCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [subcategories, setSubcategories] = useState<EcosystemSubcategory[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");

  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Load sectors when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoadingSectors(true);
    fetchEcosystemSectors()
      .then((data) => {
        if (!isMounted) return;
        setSectors(data);
      })
      .finally(() => {
        if (isMounted) setLoadingSectors(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Load categories when sector changes
  useEffect(() => {
    if (!selectedSectorId) {
      setCategories([]);
      setSelectedCategoryId("");
      setSubcategories([]);
      setSelectedSubcategoryId("");
      return;
    }

    let isMounted = true;
    setLoadingCategories(true);
    fetchEcosystemCategories(selectedSectorId)
      .then((data) => {
        if (!isMounted) return;
        setCategories(data);
        setSelectedCategoryId("");
        setSubcategories([]);
        setSelectedSubcategoryId("");
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSectorId]);

  // Load subcategories when category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([]);
      setSelectedSubcategoryId("");
      return;
    }

    let isMounted = true;
    setLoadingSubcategories(true);
    fetchEcosystemSubcategories(selectedCategoryId, selectedSectorId)
      .then((data) => {
        if (!isMounted) return;
        setSubcategories(data);
        setSelectedSubcategoryId("");
      })
      .finally(() => {
        if (isMounted) setLoadingSubcategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId, selectedSectorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    const chosenSector = sectors.find((s) => s.id === selectedSectorId);
    const chosenCategory = categories.find((c) => c.id === selectedCategoryId);
    const chosenSubcategory = subcategories.find((sc) => sc.id === selectedSubcategoryId);

    try {
      const created = await auditFormsApi.createForm({
        title: title.trim(),
        description: description.trim() || null,
        auditType,
        isDefault,
        sectorId: selectedSectorId || null,
        sectorName: chosenSector?.name || null,
        categoryId: selectedCategoryId || null,
        categoryName: chosenCategory?.name || null,
        subcategoryId: selectedSubcategoryId || null,
        subcategoryName: chosenSubcategory?.name || null,
      });

      setTitle("");
      setDescription("");
      setIsDefault(false);
      setSelectedSectorId("");
      setSelectedCategoryId("");
      setSelectedSubcategoryId("");
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create audit template");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 sm:p-7"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">New Audit Template</h3>
                <p className="text-xs text-slate-400 font-medium">Create a custom Short or Long audit intake.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Audit Type */}
            <div>
              <label className="text-xs font-bold text-slate-700">Audit Type</label>
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAuditType("SHORT_FORM")}
                  className={`rounded-2xl border-2 p-3.5 text-left transition-all ${
                    auditType === "SHORT_FORM"
                      ? "border-orange-500 bg-orange-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-900">Short Audit</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500 font-medium">
                    Focused ~10-minute check for agile discovery.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditType("LONG_FORM")}
                  className={`rounded-2xl border-2 p-3.5 text-left transition-all ${
                    auditType === "LONG_FORM"
                      ? "border-orange-500 bg-orange-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-900">Long Audit</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500 font-medium">
                    In-depth ~30-minute full operational evaluation.
                  </span>
                </button>
              </div>
            </div>

            {/* Template Title */}
            <div>
              <label className="text-xs font-bold text-slate-700">Template Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hospitality Table Turnover & Food Waste Audit"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-700">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Purpose or context shown to clients."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
            </div>

            {/* Industry Sector, Category & Subcategory Selection (Central Hub Solution) */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-orange-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Target Industry & Sector</h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Connect this audit to Central Hub Solution industry sectors.
                  </p>
                </div>
              </div>

              {/* Sector Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Sector {loadingSectors && <span className="text-orange-500 font-normal">(loading...)</span>}
                </label>
                <div className="relative">
                  <select
                    value={selectedSectorId}
                    onChange={(e) => setSelectedSectorId(e.target.value)}
                    disabled={loadingSectors}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none disabled:opacity-50"
                  >
                    <option value="">General / All Sectors (Universal Audit)</option>
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Category Dropdown (Conditional on Sector) */}
              {selectedSectorId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 pt-1 border-t border-slate-200/60"
                >
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Category {loadingCategories && <span className="text-orange-500 font-normal">(loading...)</span>}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        disabled={loadingCategories || categories.length === 0}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none disabled:opacity-50"
                      >
                        <option value="">All Categories in this Sector</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Subcategory Dropdown (Conditional on Category) */}
                  {selectedCategoryId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Subcategory {loadingSubcategories && <span className="text-orange-500 font-normal">(loading...)</span>}
                      </label>
                      <div className="relative">
                        <select
                          value={selectedSubcategoryId}
                          onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                          disabled={loadingSubcategories || subcategories.length === 0}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none disabled:opacity-50"
                        >
                          <option value="">All Subcategories</option>
                          {subcategories.map((sc) => (
                            <option key={sc.id} value={sc.id}>
                              {sc.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Set as Default Checkbox */}
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded text-orange-500 focus:ring-orange-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Star size={13} className="text-amber-500" /> Set as Default for {auditType === "SHORT_FORM" ? "Short" : "Long"} Audits
                </p>
                <p className="text-[11px] text-slate-400 font-medium leading-tight">
                  Standard visits for this type will load this template.
                </p>
              </div>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Audit Template"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
