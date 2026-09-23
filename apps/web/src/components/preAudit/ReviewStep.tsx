import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronLeft, Pencil, Mail } from "lucide-react";
import type { PreAuditVisitedEntry } from "@/lib/preAudit/types";

interface ReviewStepProps {
  visited: PreAuditVisitedEntry[];
  email: string;
  disabled: boolean;
  onEditQuestion: (index: number) => void;
  onSubmit: () => void;
  onBackToEmail: () => void;
}

/** Shows every answered question + the email, with per-row edit. */
export function ReviewStep({ visited, email, disabled, onEditQuestion, onSubmit, onBackToEmail }: ReviewStepProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 relative z-10 overflow-hidden">
      <div className="p-6 sm:p-10 lg:p-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Review your answers</span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 leading-tight">
          Does this all look right?
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8">
          You can change any answer before you finish — your next steps are recalculated automatically.
        </p>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
          {visited.map((entry, index) => (
            <motion.div
              key={entry.questionId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Question {index + 1}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-2">
                    {entry.questionText}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-orange-600">
                    {entry.answerTexts.join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onEditQuestion(index)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-orange-600 hover:border-orange-300 transition-all disabled:opacity-50"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: visited.length * 0.04 }}
            className="rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Results email</p>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 break-all">{email}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={onBackToEmail}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-orange-600 hover:border-orange-300 transition-all disabled:opacity-50"
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between items-stretch sm:items-center">
          <button
            type="button"
            onClick={onBackToEmail}
            disabled={disabled}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <ChevronLeft size={14} />
            Back to email
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
            onClick={onSubmit}
            className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
          >
            Submit My Pre-Audit
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}