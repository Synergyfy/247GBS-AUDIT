"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, ExternalLink, Play } from "lucide-react";
import type { AdminTriageQuestion, TriageForm } from "@/services/triage/types";
import { runScenario, SCENARIO_PRESETS, type ScenarioRunResult } from "./scenario-engine";
import { EmptyState } from "./ui";

export function PreviewPanel({
  questions,
  form,
  onOpenPublic,
}: {
  questions: AdminTriageQuestion[];
  form: TriageForm | null;
  onOpenPublic: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const published = form?.status === "published";
  const publicUrl = form?.slug ? `/audit/triage/${form.slug}` : null;

  const result: ScenarioRunResult | null = activeId
    ? runScenario(questions, SCENARIO_PRESETS.find((p) => p.id === activeId)!)
    : null;

  return (
    <div className="space-y-4">
      {/* Live form preview */}
      <div className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Open the real form</h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {published
                ? "The published responder, exactly as visitors experience it."
                : "Publish the form first to open the real public page."}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPublic}
            disabled={!published || !publicUrl}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-black transition-colors disabled:opacity-40"
          >
            <ExternalLink size={15} /> Open live form
          </button>
        </div>
      </div>

      {/* Scenario testing */}
      <div className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-bold text-slate-900">Test the flow with scenarios</h3>
        <p className="mt-1 mb-4 text-xs text-slate-500 font-medium">
          Simulate a visitor and see exactly which questions, options and routes they follow.
        </p>

        {questions.length === 0 ? (
          <EmptyState title="No questions to preview" description="Add questions to the flow first." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setActiveId((current) => (current === preset.id ? null : preset.id))}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    activeId === preset.id
                      ? "border-orange-300 bg-orange-50/70"
                      : "border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{preset.label}</span>
                    {activeId === preset.id ? (
                      <CheckCircle2 size={15} className="text-orange-500" />
                    ) : (
                      <Play size={15} className="text-slate-300" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>

            {result && (
              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {result.title}
                  </h4>
                  {result.ok ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
                      <CheckCircle2 size={11} /> Completes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
                      <AlertTriangle size={11} /> {result.issue ?? "Incomplete"}
                    </span>
                  )}
                </div>

                {result.issue && (
                  <p className="mb-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-700">
                    {result.issue}
                  </p>
                )}

                <ol className="space-y-2">
                  {result.steps.map((step, index) => (
                    <li key={`${step.questionId}-${index}`} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-800">{step.questionText}</div>
                        {step.optionTexts.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {step.optionTexts.map((text) => (
                              <span
                                key={text}
                                className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-orange-600"
                              >
                                {text}
                              </span>
                            ))}
                          </div>
                        )}
                        {step.nextQuestionId && !step.terminal && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                            <ArrowRight size={11} /> Continues
                          </div>
                        )}
                        {(step.destinationType || step.auditType) && (
                          <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                            <ArrowRight size={11} /> Ends at{" "}
                            {step.destinationType ? step.destinationType.replace(/_/g, " ") : (step.auditType ?? "")}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {result.finalized === 0 && (
                  <p className="mt-3 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500">
                    This scenario never reaches a final destination — check that every option routes onward.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}