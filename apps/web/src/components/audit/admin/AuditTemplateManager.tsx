"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  QrCode,
  Star,
  Layers,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  FileQuestion,
  Filter,
  Building2,
} from "lucide-react";
import { useAdminAuditForms, auditFormsApi } from "@/services/admin/audit-forms/hooks";
import type { AuditForm, AuditFormType } from "@/services/admin/audit-forms/types";
import { fetchEcosystemSectors, type EcosystemSector } from "@/services/ecosystem/catalog";
import { CreateAuditTemplateModal } from "./CreateAuditTemplateModal";
import { AuditTemplateEditor } from "./AuditTemplateEditor";
import { ShareQrModal } from "@/components/common/ShareQrModal";

export function AuditTemplateManager() {
  const [typeFilter, setTypeFilter] = useState<"ALL" | AuditFormType>("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");
  const [sectors, setSectors] = useState<EcosystemSector[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [shareQrForm, setShareQrForm] = useState<AuditForm | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: forms, loading, refresh } = useAdminAuditForms(
    typeFilter === "ALL" ? undefined : typeFilter
  );

  React.useEffect(() => {
    fetchEcosystemSectors().then(setSectors);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetDefault = async (form: AuditForm) => {
    try {
      await auditFormsApi.setDefault(form.id);
      await refresh();
      showToast(`"${form.title}" is now the default ${form.auditType === "SHORT_FORM" ? "Short" : "Long"} Audit.`);
    } catch (err: any) {
      showToast(err?.message || "Failed to set default template");
    }
  };

  const handleDelete = async (form: AuditForm) => {
    if (!confirm(`Are you sure you want to delete "${form.title}"?`)) return;
    try {
      await auditFormsApi.deleteForm(form.id);
      await refresh();
      showToast("Template deleted.");
    } catch (err: any) {
      showToast(err?.message || "Failed to delete template");
    }
  };

  const filteredForms = (forms || []).filter((f) => {
    const matchesType = typeFilter === "ALL" || f.auditType === typeFilter;
    const matchesSector = sectorFilter === "ALL" || f.sectorId === sectorFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.sectorName && f.sectorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.categoryName && f.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSector && matchesSearch;
  });

  if (editingFormId) {
    return (
      <AuditTemplateEditor
        formId={editingFormId}
        onBack={() => setEditingFormId(null)}
        onUpdated={refresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Top Controls: Search, Filter Tabs, Sector Filter, Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Pills & Sector Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60">
            {(["ALL", "SHORT_FORM", "LONG_FORM"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  typeFilter === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t === "ALL" ? "All Templates" : t === "SHORT_FORM" ? "Short Audits" : "Long Audits"}
              </button>
            ))}
          </div>

          {/* Sector Filter Dropdown */}
          <div className="relative">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm cursor-pointer"
            >
              <option value="ALL">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & New Template */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search templates, sectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-all"
          >
            <Plus size={15} />
            New Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {loading && !forms ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm font-bold text-slate-400">Loading audit templates...</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Layers size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">No audit templates found</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Create a custom Short or Long audit template to get started.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
          >
            <Plus size={14} /> Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredForms.map((form) => {
            const isShort = form.auditType === "SHORT_FORM";
            const auditUrl = typeof window !== "undefined"
              ? form.isDefault
                ? `${window.location.origin}/audit/flow?type=${form.auditType}`
                : `${window.location.origin}/audit/flow?type=${form.auditType}&auditFormId=${form.id}`
              : `/audit/flow?type=${form.auditType}&auditFormId=${form.id}`;

            return (
              <motion.div
                key={form.id}
                layout
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        isShort
                          ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                          : "bg-orange-50 text-orange-700 border border-orange-200/60"
                      }`}
                    >
                      {isShort ? "Short Audit" : "Long Audit"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        form.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: form.status === "published" ? "#10b981" : "#94a3b8" }}
                      />
                      {form.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {form.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400 font-medium">
                    {form.description || "No description provided."}
                  </p>

                  {/* Sector / Category Badges from Central Hub Solution */}
                  {form.sectorName && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 text-[10px] font-bold border border-orange-200/60">
                        <Building2 size={11} className="text-orange-600" />
                        {form.sectorName}
                      </span>
                      {form.categoryName && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {form.categoryName}
                        </span>
                      )}
                      {form.subcategoryName && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[9px] font-medium border border-slate-100">
                          {form.subcategoryName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metrics Bar */}
                  <div className="mt-4 flex items-center gap-3 border-y border-slate-100 py-2.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <FileQuestion size={14} className="text-orange-500" />
                      {form.questionCount ?? 0} Questions
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-medium text-slate-400">
                      ~{isShort ? "10 min" : "30 min"}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 space-y-2.5 pt-2">
                  {/* Default Status Row */}
                  <div className="flex items-center justify-between">
                    {form.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                        <Star size={12} className="fill-amber-500 text-amber-500" /> Default {isShort ? "Short" : "Long"}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(form)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-amber-600 transition-colors"
                      >
                        <Star size={12} /> Set as Default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShareQrForm(form)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors"
                      title="Share link & QR code"
                    >
                      <QrCode size={12} /> QR & Link
                    </button>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingFormId(form.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-slate-900 hover:bg-black py-2 text-xs font-bold text-white shadow-sm transition-all"
                    >
                      <Edit3 size={13} /> Edit Questions
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(form)}
                      className="rounded-2xl border border-slate-200 hover:border-red-200 hover:bg-red-50 p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Share QR Modal */}
      {shareQrForm && (
        <ShareQrModal
          isOpen={!!shareQrForm}
          onClose={() => setShareQrForm(null)}
          title={shareQrForm.title}
          subtitle={`${shareQrForm.auditType === "SHORT_FORM" ? "Short" : "Long"} Business Audit`}
          badge={shareQrForm.isDefault ? `Default ${shareQrForm.auditType === "SHORT_FORM" ? "Short" : "Long"} Audit` : undefined}
          url={
            typeof window !== "undefined"
              ? shareQrForm.isDefault
                ? `${window.location.origin}/audit/flow?type=${shareQrForm.auditType}`
                : `${window.location.origin}/audit/flow?type=${shareQrForm.auditType}&auditFormId=${shareQrForm.id}`
              : `/audit/flow?type=${shareQrForm.auditType}&auditFormId=${shareQrForm.id}`
          }
        />
      )}

      {/* Create Template Modal */}
      <CreateAuditTemplateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultType={typeFilter === "LONG_FORM" ? "LONG_FORM" : "SHORT_FORM"}
        onCreated={() => {
          void refresh();
          showToast("New audit template created.");
        }}
      />
    </div>
  );
}
