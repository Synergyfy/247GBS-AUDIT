"use client";

import { useMemo } from "react";
import { ArrowRight, ExternalLink, Flag, MousePointerClick } from "lucide-react";
import type {
  AdminTriageAnswer,
  AdminTriageQuestion,
  TriageForm,
} from "@/services/triage/types";
import { isChoiceType } from "@/services/triage/types";
import { RichText } from "@/components/preAudit/RichText";
import { Modal } from "./modal";
import { PreviewPanel } from "./PreviewPanel";
import { auditLabel, destLabel, typeLabel } from "./shared";
import { EmptyState } from "./ui";

function OptionRoute({
  answer,
  questionById,
}: {
  answer: AdminTriageAnswer;
  questionById: Map<string, AdminTriageQuestion>;
}) {
  if (answer.nextQuestionId) {
    const target = questionById.get(answer.nextQuestionId);
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600 max-w-[45%]">
        <ArrowRight size={11} className="shrink-0" />
        <span className="truncate">Next: {target?.text ?? "removed question"}</span>
      </span>
    );
  }
  const label =
    (answer.destinationType ? destLabel(answer.destinationType) : null) ??
    (answer.auditType ? auditLabel(answer.auditType) : null);
  if (!label) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
        No route set
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
      <Flag size={11} className="shrink-0" />
      <span className="truncate">Ends at {label}</span>
    </span>
  );
}

export function PreviewModal({
  questions,
  form,
  onOpenPublic,
  onOpenNewTab,
  onClose,
}: {
  questions: AdminTriageQuestion[];
  form: TriageForm | null;
  onOpenPublic: () => void;
  onOpenNewTab: () => void;
  onClose: () => void;
}) {
  const ordered = useMemo(
    () => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [questions]
  );
  const active = ordered.filter((q) => q.isActive);
  const startId = active[0]?.id ?? null;
  const questionById = useMemo(
    () => new Map(active.map((q) => [q.id, q])),
    [active]
  );

  return (
    <Modal
      open
      onClose={onClose}
      title="Preview triage"
      subtitle="A live look at the current builder — questions, answer options and where each option routes."
      size="xl"
      headerExtra={
        <button
          type="button"
          onClick={onOpenNewTab}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
        >
          <ExternalLink size={13} /> Open in new tab
        </button>
      }
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
        <section aria-label="Questions and answers">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Questions &amp; answers
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {active.length} question{active.length === 1 ? "" : "s"}
            </span>
          </div>

          {active.length === 0 ? (
            <EmptyState
              title="No questions to preview"
              description="Add questions to the flow first."
            />
          ) : (
            <ol className="space-y-3">
              {active.map((q, index) => (
                <li
                  key={q.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <RichText text={q.text} html={q.config?.contentHtml} />
                        {q.id === startId && (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-600">
                            Starts here
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600">
                          {typeLabel(q.type)}
                        </span>
                        {q.required && (
                          <span className="text-[11px] font-semibold text-slate-400">
                            Required
                          </span>
                        )}
                      </div>
                      {q.description && (
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {q.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isChoiceType(q.type) ? (
                    q.answers.filter((a) => a.isActive).length === 0 ? (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400">
                        No answer options yet.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-1.5">
                        {q.answers
                          .filter((a) => a.isActive)
                          .map((answer) => (
                            <li
                              key={answer.id}
                              className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2"
                            >
                              <MousePointerClick size={12} className="shrink-0 text-slate-300" />
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                                {answer.text}
                              </span>
                              <OptionRoute
                                answer={answer}
                                questionById={questionById}
                              />
                            </li>
                          ))}
                      </ul>
                    )
                  ) : (
                    <div className="mt-3 rounded-xl border-2 border-dashed border-slate-200 px-3 py-2 text-xs font-semibold text-slate-400">
                      {q.type === "file" ? "File upload input" : "Free text / value answer"}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}

          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            This dialog previews the current builder state, including unsaved edits. The
            new-tab preview shows your last saved version.
          </p>
        </section>

        <section aria-label="Scenario testing">
          <PreviewPanel questions={questions} form={form} onOpenPublic={onOpenPublic} />
        </section>
      </div>
    </Modal>
  );
}