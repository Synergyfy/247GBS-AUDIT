"use client";

import { useMemo } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { AdminTriageQuestion } from "@/services/triage/types";
import { Modal } from "./modal";

export function DeleteQuestionModal({
  question,
  allQuestions,
  onConfirm,
  onClose,
}: {
  question: AdminTriageQuestion;
  allQuestions: AdminTriageQuestion[];
  onConfirm: () => void;
  onClose: () => void;
}) {
  const incomingRoutes = useMemo(() => {
    let count = 0;
    for (const q of allQuestions) {
      if (q.id === question.id) continue;
      if (q.defaultNextQuestionId === question.id) count++;
      for (const a of q.answers ?? []) {
        if (a.nextQuestionId === question.id) count++;
      }
    }
    return count;
  }, [allQuestions, question]);

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete Question"
      subtitle="Please confirm you want to remove this question."
      size="md"
    >
      <div className="p-5 sm:p-6 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Question #{question.order + 1}
          </p>
          <p className="text-sm font-semibold text-slate-900 line-clamp-3">
            {question.text?.trim() || "(Untitled question)"}
          </p>
          {question.answers && question.answers.length > 0 && (
            <p className="mt-2 text-xs text-slate-500 font-medium">
              Contains {question.answers.length} answer option
              {question.answers.length === 1 ? "" : "s"} which will also be removed.
            </p>
          )}
        </div>

        {incomingRoutes > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Routing impact</p>
              <p className="mt-0.5 leading-relaxed">
                {incomingRoutes} other question or option
                {incomingRoutes === 1 ? " routes" : "s route"} directly to this question. Deleting it
                will automatically reset those routes.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 leading-relaxed">
          This question will be removed from your current draft. Remember to click <strong>Save</strong> when you are ready to persist your changes.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm transition-colors"
          >
            <Trash2 size={14} />
            Delete Question
          </button>
        </div>
      </div>
    </Modal>
  );
}
