"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Plus, CheckCircle2, Trash2, Edit3, ArrowRight, Layers } from "lucide-react";
import type { TriageForm } from "@/services/triage/types";

interface ManageFlowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  forms: TriageForm[];
  currentFormId: string | null;
  onSelectForm: (id: string) => void;
  onSetDefault: (id: string) => void;
  onDeleteForm: (id: string) => void;
  onCreateNew: () => void;
  busy?: boolean;
}

export function ManageFlowsModal({
  isOpen,
  onClose,
  forms,
  currentFormId,
  onSelectForm,
  onSetDefault,
  onDeleteForm,
  onCreateNew,
  busy,
}: ManageFlowsModalProps) {
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
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 sm:p-7 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Star size={18} className="fill-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Pre-Audit Triage Flows</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Review all triage flows and choose which one is the system default.
                </p>
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

          {/* Info Banner */}
          <div className="my-4 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3.5 shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-900">
              <Star size={15} className="fill-amber-500 text-amber-500 shrink-0" />
              <span>
                <strong>System Default Rule:</strong> Only one pre-audit triage flow can be active as the default. Public visitors are automatically routed to the default flow.
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
              1 Default Only
            </span>
          </div>

          {/* Flow list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {forms.map((f) => {
              const isSelected = f.id === currentFormId;
              return (
                <div
                  key={f.id}
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                    f.isDefault
                      ? "border-amber-300 bg-amber-50/30 ring-1 ring-amber-300/40"
                      : isSelected
                      ? "border-orange-300 bg-orange-50/20"
                      : "border-slate-100 bg-slate-50/50 hover:bg-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {f.title}
                      </h4>
                      {f.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          <Star size={11} className="fill-amber-500 text-amber-500" /> System Default
                        </span>
                      )}
                      {isSelected && (
                        <span className="inline-flex items-center rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                          Currently Editing
                        </span>
                      )}
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          f.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-200/80 text-slate-600"
                        }`}
                      >
                        {f.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {f.description || "No description provided."} • {f.questionCount ?? 0} questions
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {f.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-200">
                        <CheckCircle2 size={13} /> Active Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onSetDefault(f.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors shadow-2xs disabled:opacity-50"
                        title="Set this flow as the system-wide default"
                      >
                        <Star size={13} className="text-amber-600" />
                        Make Default
                      </button>
                    )}

                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectForm(f.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-black text-white px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                    )}

                    {!f.isDefault && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDeleteForm(f.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete triage flow"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateNew();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={14} />
              Create New Flow
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
