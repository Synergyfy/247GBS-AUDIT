"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Info,
  LayoutGrid,
  LayoutList,
  Link as LinkIcon,
  MoreVertical,
  Plus,
  QrCode,
  Search,
  Send,
  Star,
  Trash2,
  Clock,
} from "lucide-react";
import { formApi } from "@/services/triage/hooks";
import { API_BASE_URL } from "@/lib/api";
import { useAdminTriageForms } from "@/services/triage/useAdminTriageForms";
import type { AdminTriageQuestion, TriageForm } from "@/services/triage/types";
import { CreateTriageModal } from "./CreateTriageModal";
import { PreviewModal } from "./PreviewModal";
import { ShareQrModal } from "@/components/common/ShareQrModal";

interface TriageGalleryProps {
  onSelectForm: (formId: string, initialTab?: "questions" | "responses" | "settings") => void;
}

type ViewMode = "grid" | "list";
type FilterTab = "all" | "published" | "draft";

const VIEW_KEY = "247gbs_triage_view";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-5">
      <div className="h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
      <div className="mt-4 h-3 w-full rounded bg-slate-100" />
      <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
      <div className="mt-4 h-8 w-full rounded-xl bg-slate-100" />
    </div>
  );
}

function StatusBadge({ status }: { status: TriageForm["status"] }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
        published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: published ? "#10b981" : "#94a3b8" }}
      />
      {published ? "Active" : "Draft"}
    </span>
  );
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "25 MAY 2026";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "25 MAY 2026";
    return d
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return "25 MAY 2026";
  }
}

function getPublicUrl(form: TriageForm): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  if (form.slug) return `${origin}/audit/triage/${form.slug}`;
  if (form.isDefault) return `${origin}/audit/triage`;
  return `${origin}/audit/triage?formId=${form.id}`;
}

export function TriageGallery({ onSelectForm }: TriageGalleryProps) {
  const { forms, loading, error, refresh } = useAdminTriageForms();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [showHowTo, setShowHowTo] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TriageForm | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState<TriageForm | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<AdminTriageQuestion[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [qrForm, setQrForm] = useState<TriageForm | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const setView = (v: ViewMode) => {
    setViewMode(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return forms.filter((f) => {
      if (filterTab !== "all" && f.status !== filterTab) return false;
      if (q && !f.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [forms, searchQuery, filterTab]);

  const openPreview = async (form: TriageForm) => {
    setMenuOpenId(null);
    setPreviewForm(form);
    setPreviewLoading(true);
    try {
      const token = localStorage.getItem("247gbs_token");
      const res = await fetch(
        `${API_BASE_URL}/admin/triage/questions?formId=${encodeURIComponent(form.id)}`,
        {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }
      );
      const json = res.ok ? ((await res.json()) as AdminTriageQuestion[]) : [];
      setPreviewQuestions(Array.isArray(json) ? json : []);
    } catch {
      setPreviewQuestions([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopyLink = async (form: TriageForm) => {
    const url = getPublicUrl(form);
    try {
      await navigator.clipboard.writeText(url);
      setToast("Public form link copied to clipboard!");
    } catch {
      setToast("Failed to copy link.");
    }
  };

  const handleSendShare = async (form: TriageForm) => {
    const url = getPublicUrl(form);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: form.title,
          text: form.description || "Fill out this pre-audit intake form",
          url,
        });
        return;
      } catch {
        /* fallback to copy */
      }
    }
    await handleCopyLink(form);
  };

  const handleToggleAutomation = async (form: TriageForm) => {
    const current = form.settings?.acceptResponses !== false;
    const next = !current;
    setBusyId(form.id);
    try {
      await formApi.updateForm(
        { settings: { acceptResponses: next } },
        form.id
      );
      await refresh();
      setToast(
        `Submissions ${next ? "enabled" : "disabled"} for "${form.title}".`
      );
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to update form");
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (form: TriageForm) => {
    setMenuOpenId(null);
    setBusyId(form.id);
    try {
      await formApi.setDefault(form.id);
      await refresh();
      setToast(`"${form.title}" is now the default pre-audit flow.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to set default");
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (form: TriageForm) => {
    setMenuOpenId(null);
    setBusyId(form.id);
    try {
      const copy = await formApi.createForm({
        title: `${form.title} (copy)`,
        description: form.description,
        settings: form.settings,
      });
      await refresh();
      setToast(`Duplicated as "${copy.title}".`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to duplicate flow");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isDefault) {
      setToast("Cannot delete the default flow. Set another flow as default first.");
      setDeleteTarget(null);
      return;
    }
    setBusyId(deleteTarget.id);
    try {
      await formApi.deleteForm(deleteTarget.id);
      await refresh();
      setToast("Flow deleted.");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to delete flow");
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterTab("all");
  };

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All Forms" },
    { id: "published", label: "Active" },
    { id: "draft", label: "Draft" },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-4 left-4 right-4 z-[60] rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">
            My Forms
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Create and manage business forms from Engagement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-95"
        >
          <Plus size={16} /> New Form
        </button>
      </div>

      {/* How to Use Forms Banner */}
      <div className="shrink-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <Info size={17} />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                How to use forms
              </p>
              <p className="text-xs font-medium text-slate-500">
                Click to learn about sharing your forms, routing responders and previewing on mobile.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHowTo(!showHowTo)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            {showHowTo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        {showHowTo && (
          <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-slate-100 pt-3 text-[11px] text-slate-600 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="font-bold text-slate-900">1. Share Links & QR:</span>
              <p className="mt-0.5 text-slate-500">
                Distribute via public links or print QR codes for rapid mobile response.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="font-bold text-slate-900">2. Live Phone Preview:</span>
              <p className="mt-0.5 text-slate-500">
                Test the mobile user experience in real-time right alongside the builder.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="font-bold text-slate-900">3. Automated Routing:</span>
              <p className="mt-0.5 text-slate-500">
                Answers automatically guide responders to full audit, short audit, or tailored recommendations.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar: Scope, Search, Grid/Line Toggle, Tabs */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Scope indicator */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span>Scope: 247GBS Audit</span>
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Grid / Line view toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setView("grid")}
              title="Grid view"
              className={`rounded-lg p-1.5 transition-colors ${
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
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <LayoutList size={15} />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterTab(t.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                filterTab === t.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error && forms.length === 0 ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
            >
              Try again
            </button>
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-xs">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardList size={24} />
            </span>
            <p className="mt-4 text-base font-bold text-slate-900">No triage forms yet.</p>
            <p className="mt-1 max-w-sm text-sm font-medium text-slate-400">
              Create your first pre-audit flow to start receiving customer responses.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600"
            >
              <Plus size={16} /> Create First Form
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-slate-100 bg-white px-6 py-16 text-center shadow-xs">
            <p className="text-base font-bold text-slate-900">No forms match your search.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-black"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((form) => {
              const automationActive = form.settings?.acceptResponses !== false;
              return (
                <article
                  key={form.id}
                  onClick={() => onSelectForm(form.id)}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                >
                  {/* Top: Icon + Title + Branch + 3-dots */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <FileText size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-extrabold uppercase tracking-tight text-slate-900">
                            {form.title}
                          </h3>
                          <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400">
                            {form.slug ? `247GBS • ${form.slug}` : "247GBS • PRE-AUDIT"}
                          </p>
                        </div>
                      </div>

                      {/* 3-dots Menu */}
                      <div
                        className="relative shrink-0"
                        ref={menuOpenId === form.id ? menuRef : undefined}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === form.id ? null : form.id);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuOpenId === form.id && (
                          <div className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                            {[
                              {
                                label: "Edit",
                                icon: Edit3,
                                fn: () => {
                                  setMenuOpenId(null);
                                  onSelectForm(form.id);
                                },
                              },
                              {
                                label: "Preview",
                                icon: Eye,
                                fn: () => void openPreview(form),
                              },
                              {
                                label: "Set as Default",
                                icon: Star,
                                fn: () => void handleSetDefault(form),
                              },
                              {
                                label: "Duplicate",
                                icon: Copy,
                                fn: () => void handleDuplicate(form),
                              },
                              {
                                label: "Delete",
                                icon: Trash2,
                                danger: true,
                                fn: () => {
                                  setMenuOpenId(null);
                                  setDeleteTarget(form);
                                },
                              },
                            ].map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                disabled={busyId === form.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  item.fn();
                                }}
                                className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-bold transition-colors disabled:opacity-50 ${
                                  item.danger
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <item.icon size={13} /> {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tag / Category */}
                    <div className="mt-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Application Form
                      </span>
                      <p className="mt-1 line-clamp-2 min-h-[2.2rem] text-xs font-medium leading-relaxed text-slate-500">
                        {form.description || "Tell us how you feel about our services!"}
                      </p>
                    </div>

                    {/* Status & Responses counter */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <StatusBadge status={form.status} />
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Clock size={12} className="text-slate-400" />
                        {form.questionCount ?? 0} Questions
                      </span>
                    </div>

                    {/* Automation Box */}
                    <div
                      className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          Automation <Info size={11} className="text-slate-400" />
                        </span>
                        <p className="text-[11px] font-semibold text-slate-700">
                          Status:{" "}
                          <span
                            className={
                              automationActive ? "text-emerald-600 font-bold" : "text-slate-500"
                            }
                          >
                            {automationActive ? "ACTIVE" : "DISABLED"}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busyId === form.id}
                        onClick={() => void handleToggleAutomation(form)}
                        className={`rounded-xl px-3 py-1 text-[10px] font-extrabold tracking-wider transition-all disabled:opacity-50 ${
                          automationActive
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            : "bg-orange-500 text-white hover:bg-orange-600 shadow-xs"
                        }`}
                      >
                        {automationActive ? "DISABLE" : "ENABLE"}
                      </button>
                    </div>
                  </div>

                  {/* Bottom: Actions & Footer */}
                  <div className="mt-4">
                    {/* Action buttons (LINK, QR, SEND, STATS, VIEW) */}
                    <div
                      className="grid grid-cols-5 gap-1.5 border-t border-slate-100 pt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                        onClick={() => setQrForm(form)}
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
                        onClick={() => onSelectForm(form.id, "responses")}
                        title="View response analytics"
                        className="flex flex-col items-center justify-center gap-1 rounded-xl bg-orange-500 py-2 text-[10px] font-extrabold text-white shadow-xs hover:bg-orange-600 transition-colors"
                      >
                        <BarChart3 size={13} />
                        STATS
                      </button>

                      <button
                        type="button"
                        onClick={() => void openPreview(form)}
                        title="View form preview"
                        className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-50 py-2 text-[10px] font-extrabold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Eye size={13} />
                        VIEW
                      </button>
                    </div>

                    {/* Footer Timestamps */}
                    <div className="mt-3 flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> CREATED {formatDate(form.createdAt)}
                      </span>
                      <span>{formatDate(form.updatedAt || form.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* List / Line View */
          <div className="flex flex-col gap-3">
            {filtered.map((form) => {
              const automationActive = form.settings?.acceptResponses !== false;
              return (
                <div
                  key={form.id}
                  onClick={() => onSelectForm(form.id)}
                  className="group flex cursor-pointer flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-[240px] flex-1">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <FileText size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold uppercase text-slate-900">
                        {form.title}
                      </h3>
                      <p className="truncate text-[11px] font-medium text-slate-400">
                        {form.slug ? `247GBS • ${form.slug}` : "247GBS • Pre-Audit"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={form.status} />
                    {form.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Star size={12} className="fill-amber-500 text-amber-500" /> Default
                      </span>
                    ) : null}
                    <span className="text-[11px] font-bold text-slate-400">
                      {form.questionCount ?? 0} Qs
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {formatDate(form.createdAt)}
                    </span>
                  </div>

                  {/* Actions in list row */}
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
                      onClick={() => setQrForm(form)}
                      title="QR code"
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <QrCode size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectForm(form.id, "responses")}
                      title="Responses"
                      className="rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                    >
                      STATS
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectForm(form.id)}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition-colors"
                    >
                      EDIT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialogs */}
      <CreateTriageModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newForm) => {
          void refresh();
          onSelectForm(newForm.id);
        }}
      />

      {previewForm && !previewLoading && (
        <PreviewModal
          questions={previewQuestions}
          form={previewForm}
          onOpenPublic={() => {
            const url = getPublicUrl(previewForm);
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          onOpenNewTab={() =>
            window.open(
              `${window.location.origin}/admin/triage/preview`,
              "_blank",
              "noopener,noreferrer"
            )
          }
          onClose={() => {
            setPreviewForm(null);
            setPreviewQuestions([]);
          }}
        />
      )}

      {qrForm && (
        <ShareQrModal
          isOpen
          onClose={() => setQrForm(null)}
          title={qrForm.title}
          subtitle="Pre-Audit Triage Intake Form"
          badge={qrForm.isDefault ? "Default Triage Flow" : undefined}
          url={getPublicUrl(qrForm)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Delete form?</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Are you sure you want to delete “{deleteTarget.title}”? This cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === deleteTarget.id}
                onClick={() => void handleDelete()}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
