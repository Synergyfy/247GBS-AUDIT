"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Tag,
  Settings2,
  SlidersHorizontal,
  ExternalLink,
  Building2,
  Star,
} from "lucide-react";
import { auditFormsApi, useAdminAuditForm } from "@/services/admin/audit-forms/hooks";
import type { AuditForm, AuditFormQuestion, AuditFormAnswer } from "@/services/admin/audit-forms/types";
import {
  fetchEcosystemSectors,
  fetchEcosystemCategories,
  fetchEcosystemSubcategories,
  type EcosystemSector,
  type EcosystemCategory,
  type EcosystemSubcategory,
} from "@/services/ecosystem/catalog";
import { EndActionModal } from "@/components/triage/builder/EndActionModal";
import type { TriageDestinationType } from "@/services/triage/types";

interface AuditTemplateEditorProps {
  formId: string;
  onBack: () => void;
  onUpdated: () => void;
}

export function AuditTemplateEditor({ formId, onBack, onUpdated }: AuditTemplateEditorProps) {
  const { data: serverForm, loading, refresh } = useAdminAuditForm(formId);
  const [questions, setQuestions] = useState<AuditFormQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectorId, setSectorId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  const [sectors, setSectors] = useState<EcosystemSector[]>([]);
  const [categories, setCategories] = useState<EcosystemCategory[]>([]);
  const [subcategories, setSubcategories] = useState<EcosystemSubcategory[]>([]);

  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // End Action Modal state for answer routing
  const [endActionModalOpen, setEndActionModalOpen] = useState(false);
  const [activeRoutingTarget, setActiveRoutingTarget] = useState<{
    questionId: string;
    answerId: string;
  } | null>(null);

  // Load all sectors on mount
  useEffect(() => {
    fetchEcosystemSectors().then(setSectors);
  }, []);

  // Update categories when sectorId changes
  useEffect(() => {
    if (!sectorId) {
      setCategories([]);
      return;
    }
    fetchEcosystemCategories(sectorId).then(setCategories);
  }, [sectorId]);

  // Update subcategories when categoryId changes
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    fetchEcosystemSubcategories(categoryId, sectorId).then(setSubcategories);
  }, [categoryId, sectorId]);

  useEffect(() => {
    if (serverForm) {
      setTitle(serverForm.title);
      setDescription(serverForm.description || "");
      setSectorId(serverForm.sectorId || "");
      setCategoryId(serverForm.categoryId || "");
      setSubcategoryId(serverForm.subcategoryId || "");
      setQuestions(serverForm.questions || []);
    }
  }, [serverForm]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetDefault = async () => {
    setBusy(true);
    try {
      await auditFormsApi.setDefault(formId);
      await refresh();
      onUpdated();
      showToast(
        `"${title || "Template"}" is now the active default ${
          serverForm?.auditType === "SHORT_FORM" ? "Short" : "Long"
        } Audit.`
      );
    } catch (err: any) {
      showToast(err?.message || "Failed to set default template");
    } finally {
      setBusy(false);
    }
  };

  const handleAddQuestion = () => {
    const newQ: AuditFormQuestion = {
      id: `temp_q_${Date.now()}`,
      formId,
      text: "New Evaluation Question",
      type: "single_choice",
      description: null,
      hint: null,
      required: true,
      category: "General",
      config: {},
      order: questions.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      answers: [
        {
          id: `temp_a_${Date.now()}_1`,
          questionId: `temp_q_${Date.now()}`,
          text: "Optimal / Strongly Compliant",
          scoreImpact: 10,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: `temp_a_${Date.now()}_2`,
          questionId: `temp_q_${Date.now()}`,
          text: "Adequate / Needs Minor Review",
          scoreImpact: 5,
          sortOrder: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: `temp_a_${Date.now()}_3`,
          questionId: `temp_q_${Date.now()}`,
          text: "Critical Vulnerability / High Risk",
          scoreImpact: 0,
          sortOrder: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    setQuestions([...questions, newQ]);
    setDirty(true);
  };

  const handleUpdateQuestion = (id: string, patch: Partial<AuditFormQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    setDirty(true);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setDirty(true);
  };

  const handleAddAnswer = (qid: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qid) return q;
        const newAns: AuditFormAnswer = {
          id: `temp_a_${Date.now()}`,
          questionId: qid,
          text: `Option ${q.answers.length + 1}`,
          scoreImpact: 5,
          sortOrder: q.answers.length + 1,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        return { ...q, answers: [...q.answers, newAns] };
      })
    );
    setDirty(true);
  };

  const handleUpdateAnswer = (qid: string, aid: string, patch: Partial<AuditFormAnswer>) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qid) return q;
        return {
          ...q,
          answers: q.answers.map((a) => (a.id === aid ? { ...a, ...patch } : a)),
        };
      })
    );
    setDirty(true);
  };

  const handleDeleteAnswer = (qid: string, aid: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qid) return q;
        return { ...q, answers: q.answers.filter((a) => a.id !== aid) };
      })
    );
    setDirty(true);
  };

  const handleOpenEndActionModal = (questionId: string, answerId: string) => {
    setActiveRoutingTarget({ questionId, answerId });
    setEndActionModalOpen(true);
  };

  const handleConfirmEndAction = (
    destinationType: TriageDestinationType,
    destinationTarget: string | null
  ) => {
    if (!activeRoutingTarget) return;
    const { questionId, answerId } = activeRoutingTarget;

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          answers: q.answers.map((a) => {
            if (a.id !== answerId) return a;
            return {
              ...a,
              destinationType,
              destinationTarget,
              nextQuestionId: null,
            };
          }),
        };
      })
    );
    setDirty(true);
    setEndActionModalOpen(false);
    setActiveRoutingTarget(null);
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      // 1. Update form info
      await auditFormsApi.updateForm(formId, {
        title,
        description,
        sectorId: sectorId || null,
        sectorName: sectors.find((s) => s.id === sectorId)?.name || null,
        categoryId: categoryId || null,
        categoryName: categories.find((c) => c.id === categoryId)?.name || null,
        subcategoryId: subcategoryId || null,
        subcategoryName: subcategories.find((sc) => sc.id === subcategoryId)?.name || null,
      });

      // 2. Sync questions: delete obsolete, create new, update existing
      const existingQIds = new Set((serverForm?.questions || []).map((q) => q.id));
      const currentQIds = new Set(questions.filter((q) => !q.id.startsWith("temp_")).map((q) => q.id));

      for (const oldId of existingQIds) {
        if (!currentQIds.has(oldId)) {
          await auditFormsApi.deleteQuestion(oldId);
        }
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.id.startsWith("temp_")) {
          // create question
          const created = await auditFormsApi.createQuestion(formId, {
            text: q.text,
            type: q.type,
            category: q.category,
            description: q.description,
            order: i + 1,
            required: q.required,
            isActive: q.isActive,
          });
          // create its answers
          for (let j = 0; j < q.answers.length; j++) {
            const ans = q.answers[j];
            await auditFormsApi.createAnswer(created.id, {
              text: ans.text,
              scoreImpact: ans.scoreImpact,
              sortOrder: j + 1,
            });
          }
        } else {
          // update question
          await auditFormsApi.updateQuestion(q.id, {
            text: q.text,
            type: q.type,
            category: q.category,
            description: q.description,
            order: i + 1,
            required: q.required,
          });
          // sync answers
          const existingAnsIds = new Set(
            ((serverForm?.questions || []).find((x) => x.id === q.id)?.answers || []).map((a) => a.id)
          );
          const currentAnsIds = new Set(q.answers.filter((a) => !a.id.startsWith("temp_")).map((a) => a.id));

          for (const oldAnsId of existingAnsIds) {
            if (!currentAnsIds.has(oldAnsId)) {
              await auditFormsApi.deleteAnswer(oldAnsId);
            }
          }

          for (let j = 0; j < q.answers.length; j++) {
            const ans = q.answers[j];
            if (ans.id.startsWith("temp_")) {
              await auditFormsApi.createAnswer(q.id, {
                text: ans.text,
                scoreImpact: ans.scoreImpact,
                sortOrder: j + 1,
              });
            } else {
              await auditFormsApi.updateAnswer(ans.id, {
                text: ans.text,
                scoreImpact: ans.scoreImpact,
                sortOrder: j + 1,
              });
            }
          }
        }
      }

      await refresh();
      setDirty(false);
      onUpdated();
      showToast("Audit template saved successfully.");
    } catch (err: any) {
      showToast(err?.message || "Failed to save audit template");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    setBusy(true);
    try {
      if (dirty) await handleSave();
      await auditFormsApi.updateForm(formId, { status: "published" });
      await refresh();
      onUpdated();
      showToast("Template published successfully.");
    } catch (err: any) {
      showToast(err?.message || "Failed to publish template");
    } finally {
      setBusy(false);
    }
  };

  if (loading && !serverForm) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm font-bold text-slate-400">Loading audit template questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                {serverForm?.auditType === "SHORT_FORM" ? "Short Audit" : "Long Audit"}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                  serverForm?.status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {serverForm?.status === "published" ? "Published" : "Draft"}
              </span>

              {serverForm?.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase tracking-wider">
                  <Star size={10} className="fill-amber-500 text-amber-500" /> Default
                </span>
              )}
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{title || "Audit Template Editor"}</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!serverForm?.isDefault && (
            <button
              type="button"
              disabled={busy}
              onClick={handleSetDefault}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100 hover:border-amber-400 px-3 py-2 text-xs font-bold text-amber-800 transition-colors shadow-2xs disabled:opacity-50"
              title={`Make this the default ${serverForm?.auditType === "SHORT_FORM" ? "Short" : "Long"} Audit for all users`}
            >
              <Star size={13} className="text-amber-600" />
              Set as Default {serverForm?.auditType === "SHORT_FORM" ? "Short" : "Long"}
            </button>
          )}

          <button
            type="button"
            disabled={!dirty || busy}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-black disabled:opacity-50 transition-all"
          >
            <Save size={14} />
            {busy ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 transition-all"
          >
            <Send size={14} />
            Publish
          </button>
        </div>
      </div>

      {/* Template Metadata Box */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Template Configuration</h3>

        {/* Default Audit Status Box */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Star size={16} className={serverForm?.isDefault ? "fill-amber-500 text-amber-500" : ""} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                Default {serverForm?.auditType === "SHORT_FORM" ? "Short" : "Long"} Audit Status:{" "}
                <span className={serverForm?.isDefault ? "text-amber-700" : "text-slate-500"}>
                  {serverForm?.isDefault ? "Active System Default" : "Secondary Template"}
                </span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {serverForm?.isDefault
                  ? "This template is automatically loaded when businesses start this audit type."
                  : "Only one template per audit type can be default. Setting this will replace the current default."}
              </p>
            </div>
          </div>

          {!serverForm?.isDefault ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleSetDefault}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Star size={13} />
              Set as Default {serverForm?.auditType === "SHORT_FORM" ? "Short" : "Long"}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-800">
              <CheckCircle2 size={13} className="text-amber-600" /> Current Default
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Audit Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDirty(true);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Sector, Category, Subcategory */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-slate-800">Target Industry Sector & Category (Central Hub Solution)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Sector</label>
              <select
                value={sectorId}
                onChange={(e) => {
                  setSectorId(e.target.value);
                  setCategoryId("");
                  setSubcategoryId("");
                  setDirty(true);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500"
              >
                <option value="">General / All Sectors</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId("");
                  setDirty(true);
                }}
                disabled={!sectorId}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 disabled:opacity-50"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Subcategory</label>
              <select
                value={subcategoryId}
                onChange={(e) => {
                  setSubcategoryId(e.target.value);
                  setDirty(true);
                }}
                disabled={!categoryId}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-orange-500 disabled:opacity-50"
              >
                <option value="">All Subcategories</option>
                {subcategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Audit Questions ({questions.length})
          </h3>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-all"
          >
            <Plus size={14} /> Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Layers size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">No questions in this audit template</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Start building by adding your first evaluation question.
            </p>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
            >
              <Plus size={14} /> Add Question
            </button>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-xs font-bold text-orange-600">
                    Q{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={q.category || ""}
                    placeholder="Category / Domain (e.g. Finance)"
                    onChange={(e) => handleUpdateQuestion(q.id, { category: e.target.value })}
                    className="w-44 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={q.type}
                    onChange={(e) => handleUpdateQuestion(q.id, { type: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="single_choice">Single Choice</option>
                    <option value="multi_choice">Multiple Choice</option>
                    <option value="yes_no">Yes / No</option>
                    <option value="rating">Rating Scale</option>
                    <option value="text">Free Text Input</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Question Text & Description */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => handleUpdateQuestion(q.id, { text: e.target.value })}
                  placeholder="Enter the question text..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />
                <input
                  type="text"
                  value={q.description || ""}
                  onChange={(e) => handleUpdateQuestion(q.id, { description: e.target.value })}
                  placeholder="Optional explanatory subtext or respondent instructions..."
                  className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-orange-500"
                />
              </div>

              {/* Answers & Routing */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Answer Options & Scoring
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddAnswer(q.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                  >
                    <Plus size={13} /> Add Option
                  </button>
                </div>

                <div className="space-y-2.5">
                  {q.answers.map((ans, aIdx) => (
                    <div
                      key={ans.id}
                      className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:flex-nowrap"
                    >
                      <span className="text-[11px] font-bold text-slate-400 w-5">
                        {String.fromCharCode(65 + aIdx)}.
                      </span>
                      <input
                        type="text"
                        value={ans.text}
                        onChange={(e) => handleUpdateAnswer(q.id, ans.id, { text: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500"
                        placeholder="Option label..."
                      />

                      {/* Score Impact */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-400">Score:</span>
                        <input
                          type="number"
                          value={ans.scoreImpact ?? 0}
                          onChange={(e) =>
                            handleUpdateAnswer(q.id, ans.id, {
                              scoreImpact: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-16 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 outline-none"
                        />
                      </div>

                      {/* Routing Destination */}
                      <button
                        type="button"
                        onClick={() => handleOpenEndActionModal(q.id, ans.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                        title="Configure End / Submit Action"
                      >
                        <Settings2 size={12} />
                        Route / Action
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnswer(q.id, ans.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* End Action Routing Popup Modal */}
      {endActionModalOpen && (
        <EndActionModal
          isOpen={endActionModalOpen}
          destinationType={
            ((questions
              .find((q) => q.id === activeRoutingTarget?.questionId)
              ?.answers.find((a) => a.id === activeRoutingTarget?.answerId) as any)?.destinationType as TriageDestinationType) || null
          }
          destinationTarget={
            ((questions
              .find((q) => q.id === activeRoutingTarget?.questionId)
              ?.answers.find((a) => a.id === activeRoutingTarget?.answerId) as any)?.destinationTarget as string) || null
          }
          onClose={() => {
            setEndActionModalOpen(false);
            setActiveRoutingTarget(null);
          }}
          onConfirm={handleConfirmEndAction}
        />
      )}
    </div>
  );
}
