"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  LayoutGrid,
  LayoutList,
  Link as LinkIcon,
  Send,
  MoreVertical,
  Clock,
  Calendar,
  Eye,
  Info,
} from "lucide-react";
import { useAdminAuditForms, auditFormsApi } from "@/services/admin/audit-forms/hooks";
import type { AuditForm, AuditFormType } from "@/services/admin/audit-forms/types";
import { fetchEcosystemSectors, type EcosystemSector } from "@/services/ecosystem/catalog";
import { CreateAuditTemplateModal } from "./CreateAuditTemplateModal";
import { AuditTemplateEditor } from "./AuditTemplateEditor";
import { ShareQrModal } from "@/components/common/ShareQrModal";

type ViewMode = "grid" | "list";
const VIEW_KEY = "247gbs_audit_templates_view";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return "N/A";
  }
}

function getPublicUrl(form: AuditForm): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  if (form.isDefault) {
    return `${origin}/audit/flow?type=${form.auditType}`;
  }
  return `${origin}/audit/flow?type=${form.auditType}&auditFormId=${form.id}`;
}

export function AuditTemplateManager() {
  const [typeFilter, setTypeFilter] = useState<"ALL" | AuditFormType>("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");
  const [sectors, setSectors] = useState<EcosystemSector[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [shareQrForm, setShareQrForm] = useState<AuditForm | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { data: forms, loading, refresh } = useAdminAuditForms(
    typeFilter === "ALL" ? undefined : typeFilter
  );

  useEffect(() => {
    fetchEcosystemSectors().then(setSectors);
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "grid" || saved === "list") setViewMode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const setView = (v: ViewMode) => {
    setViewMode(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyLink = async (form: AuditForm) => {
    const url = getPublicUrl(form);
    try {
      await navigator.clipboard.writeText(url);
      showToast("Audit intake link copied to clipboard!");
    } catch {
      showToast("Failed to copy link.");
    }
  };

  const handleSendShare = async (form: AuditForm) => {
    const url = getPublicUrl(form);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: form.title,
          text: form.description || "Take this business audit",
          url,
        });
        return;
      } catch {
        /* fallback to copy */
      }
    }
    await handleCopyLink(form);
  };

  const handleSetDefault = async (form: AuditForm) => {
    setMenuOpenId(null);
    try {
      await auditFormsApi.setDefault(form.id);
      await refresh();
      showToast(`"${form.title}" is now the default ${form.auditType === "SHORT_FORM" ? "Short" : "Long"} Audit.`);
    } catch (err: any) {
      showToast(err?.message || "Failed to set default template");
    }
  };

  const handleDelete = async (form: AuditForm) => {
    setMenuOpenId(null);
    if (form.isDefault) {
      showToast("Cannot delete a default template. Set another template as default first.");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${form.title}"?`)) return;
    try {
      await auditFormsApi.deleteForm(form.id);
      await refresh();
      showToast("Template deleted.");
    } catch (err: any) {
      showToast(err?.message || "Failed to delete template");
    }
  };

  const filteredForms = useMemo(() => {
    return (forms || []).filter((f) => {
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
  }, [forms, typeFilter, sectorFilter, searchTerm]);

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

      {/* Top Controls: Scope, Filter Tabs, Sector Filter, Search, Grid/List Toggle, Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Pills, Scope & Sector Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scope indicator */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span>Scope: 247GBS Audit</span>
          </div>

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

        {/* Search, Grid/Line Toggle & New Template */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search templates, sectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Grid / Line view toggle */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setView("grid")}
              title="Grid view"
              className={`rounded-xl p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              title="Line / list view"
              className={`rounded-xl p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <LayoutList size={15} />
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-all active:scale-95"
          >
            <Plus size={15} />
            New Template
          </button>
        </div>
      </div>

      {/* Active System Defaults Status Banner */}
      {forms && forms.length > 0 && (
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <Star size={14} className="fill-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active System Defaults
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Primary audit entry points for respondents. Click any template to inspect or customize questions.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              1 Default Per Type Rule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Default Short Audit Box */}
            {(() => {
              const def = forms.find((f) => f.auditType === "SHORT_FORM" && f.isDefault);
              return (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 border border-amber-100 shadow-2xs">
                  <div className="min-w-0">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Default Short Audit
                    </span>
                    <h5 className="truncate text-xs font-bold text-slate-900">
                      {def?.title || "No Default Short Audit Selected"}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {def?.sectorName ? `Sector: ${def.sectorName}` : "Applicable to All Sectors"} • {def?.questionCount ?? 0} questions
                    </p>
                  </div>
                  {def && (
                    <button
                      type="button"
                      onClick={() => setEditingFormId(def.id)}
                      className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors"
                    >
                      Edit Flow
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Default Long Audit Box */}
            {(() => {
              const def = forms.find((f) => f.auditType === "LONG_FORM" && f.isDefault);
              return (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 border border-amber-100 shadow-2xs">
                  <div className="min-w-0">
                    <span className="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                      Default Long Audit
                    </span>
                    <h5 className="truncate text-xs font-bold text-slate-900">
                      {def?.title || "No Default Long Audit Selected"}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {def?.sectorName ? `Sector: ${def.sectorName}` : "Applicable to All Sectors"} • {def?.questionCount ?? 0} questions
                    </p>
                  </div>
                  {def && (
                    <button
                      type="button"
                      onClick={() => setEditingFormId(def.id)}
                      className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors"
                    >
                      Edit Flow
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Main Content Area: Grid or List View */}
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
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={14} /> Create Template
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredForms.map((form) => {
            const isShort = form.auditType === "SHORT_FORM";

            return (
              <motion.article
                key={form.id}
                layout
                onClick={() => setEditingFormId(form.id)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-3xl border bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md ${
                  form.isDefault ? "border-amber-300/80 ring-1 ring-amber-300/40" : "border-slate-200/90"
                }`}
              >
                <div>
                  {/* Top Badges & 3-dots */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          isShort
                            ? "bg-slate-100 text-slate-800 border border-slate-200"
                            : "bg-orange-50 text-orange-700 border border-orange-200/60"
                        }`}
                      >
                        {isShort ? "Short Audit" : "Long Audit"}
                      </span>

                      {form.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Star size={10} className="fill-amber-500 text-amber-500" /> Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
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
                        {form.status === "published" ? "Active" : "Draft"}
                      </span>

                      {/* 3-dots menu */}
                      <div
                        className="relative"
                        ref={menuOpenId === form.id ? menuRef : undefined}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === form.id ? null : form.id);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {menuOpenId === form.id && (
                          <div className="absolute right-0 top-7 z-30 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                                setEditingFormId(form.id);
                              }}
                              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              <Edit3 size={13} /> Edit Flow
                            </button>
                            {!form.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleSetDefault(form);
                                }}
                                className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-bold text-amber-700 hover:bg-amber-50"
                              >
                                <Star size={13} /> Set as Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDelete(form);
                              }}
                              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {form.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 min-h-[2.2rem] text-xs text-slate-400 font-medium leading-relaxed">
                    {form.description || "Comprehensive diagnostic questions evaluating corporate operations and compliance."}
                  </p>

                  {/* Sector / Category Badges */}
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
                  <div className="mt-3.5 flex items-center justify-between border-y border-slate-100 py-2.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <FileQuestion size={14} className="text-orange-500" />
                      {form.questionCount ?? 0} Questions
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <Clock size={12} /> ~{isShort ? "10 min" : "30 min"}
                    </span>
                  </div>
                </div>

                {/* Bottom: Action Buttons & Footer */}
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  {/* Action buttons (LINK, QR, SEND, EDIT) */}
                  <div className="grid grid-cols-4 gap-1.5 border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={() => void handleCopyLink(form)}
                      title="Copy public link"
                      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-50 py-2 text-[10px] font-extrabold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <LinkIcon size={13} />
                      LINK
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareQrForm(form)}
                      title="Share QR Code"
                      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-50 py-2 text-[10px] font-extrabold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <QrCode size={13} />
                      QR
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleSendShare(form)}
                      title="Send / Share"
                      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-50 py-2 text-[10px] font-extrabold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Send size={13} />
                      SEND
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingFormId(form.id)}
                      title="Edit Questions & Rules"
                      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-900 py-2 text-[10px] font-extrabold text-white hover:bg-black transition-colors"
                    >
                      <Edit3 size={13} />
                      EDIT
                    </button>
                  </div>

                  {/* Footer Timestamps */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> CREATED {formatDate(form.createdAt)}
                    </span>
                    <span>{formatDate(form.updatedAt)}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        /* List / Line View */
        <div className="flex flex-col gap-3">
          {filteredForms.map((form) => {
            const isShort = form.auditType === "SHORT_FORM";

            return (
              <div
                key={form.id}
                onClick={() => setEditingFormId(form.id)}
                className={`group flex cursor-pointer flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-xs transition-all duration-200 hover:border-orange-300 hover:shadow-md ${
                  form.isDefault ? "border-amber-300/80" : "border-slate-200/90"
                }`}
              >
                {/* Title & Info */}
                <div className="flex items-center gap-3.5 min-w-[240px] flex-1">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Layers size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold uppercase text-slate-900">
                        {form.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isShort
                            ? "bg-slate-100 text-slate-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {isShort ? "Short" : "Long"}
                      </span>
                      {form.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                          <Star size={10} className="fill-amber-500 text-amber-500" /> Default
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] font-medium text-slate-400">
                      {form.sectorName ? `Sector: ${form.sectorName} • ` : ""}
                      {form.questionCount ?? 0} Questions • ~{isShort ? "10 min" : "30 min"}
                    </p>
                  </div>
                </div>

                {/* Status & Date */}
                <div className="flex items-center gap-3">
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
                    {form.status === "published" ? "Active" : "Draft"}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {formatDate(form.createdAt)}
                  </span>
                </div>

                {/* Action Buttons in list row */}
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => void handleCopyLink(form)}
                    title="Copy Link"
                    className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <LinkIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareQrForm(form)}
                    title="QR Code"
                    className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <QrCode size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSendShare(form)}
                    title="Share"
                    className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFormId(form.id)}
                    className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black transition-colors"
                  >
                    EDIT
                  </button>
                </div>
              </div>
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
          url={getPublicUrl(shareQrForm)}
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

