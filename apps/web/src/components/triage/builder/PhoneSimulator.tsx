"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  Battery,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  GitBranch,
  Signal,
  Star,
  UploadCloud,
  Wifi,
} from "lucide-react";
import type { AdminTriageQuestion, TriageForm } from "@/services/triage/types";

interface PhoneSimulatorProps {
  form: TriageForm | null;
  questions: AdminTriageQuestion[];
  focusedQuestionId: string | null;
}

function orderQuestions(list: AdminTriageQuestion[]) {
  return [...list]
    .filter((q) => q.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function QuestionInputPreview({ question }: { question: AdminTriageQuestion }) {
  const answers = (question.answers ?? []).filter((a) => a.isActive !== false);

  switch (question.type) {
    case "long_text":
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-400 shadow-2xs">
          {question.config?.placeholder || "Type your answer…"}
          <div className="mt-1 h-6" />
        </div>
      );

    case "single_choice":
    case "yes_no": {
      const opts =
        answers.length > 0
          ? answers
          : question.type === "yes_no"
          ? [
              { id: "p1", text: "Yes" },
              { id: "p2", text: "No" },
            ]
          : [
              { id: "p1", text: "Option 1" },
              { id: "p2", text: "Option 2" },
            ];

      return (
        <div className="space-y-1.5">
          {opts.map((opt: { id: string; text: string }, idx: number) => (
            <div
              key={opt.id}
              className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all text-left shadow-2xs ${
                idx === 0
                  ? "bg-orange-50/70 border-orange-300"
                  : "bg-white border-slate-100 hover:border-orange-200"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  idx === 0
                    ? "bg-orange-500 text-white"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                <ArrowRight size={11} />
              </div>
              <span
                className={`font-bold text-[11px] leading-tight truncate ${
                  idx === 0 ? "text-orange-900" : "text-slate-900"
                }`}
              >
                {opt.text}
              </span>
            </div>
          ))}
        </div>
      );
    }

    case "multiple_choice":
    case "checkbox": {
      const opts =
        answers.length > 0
          ? answers
          : [
              { id: "p1", text: "Option 1" },
              { id: "p2", text: "Option 2" },
            ];

      return (
        <div className="space-y-1.5">
          {opts.map((opt: { id: string; text: string }, idx: number) => (
            <div
              key={opt.id}
              className={`flex items-center gap-2.5 p-2 rounded-xl border-2 transition-all text-left shadow-2xs ${
                idx === 0
                  ? "bg-orange-50/70 border-orange-400"
                  : "bg-white border-slate-100"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                  idx === 0
                    ? "bg-orange-500 text-white"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                <Check size={11} />
              </div>
              <span
                className={`font-bold text-[11px] leading-tight truncate ${
                  idx === 0 ? "text-orange-900" : "text-slate-900"
                }`}
              >
                {opt.text}
              </span>
            </div>
          ))}
        </div>
      );
    }

    case "dropdown":
      return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-2xs">
          <span className="truncate">{answers[0]?.text ?? "Select an option"}</span>
          <ChevronDown size={12} className="shrink-0 text-slate-400" />
        </div>
      );

    case "number":
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-500 shadow-2xs">
          123
        </div>
      );

    case "rating":
      return (
        <div className="flex items-center gap-1.5 py-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              size={18}
              className={i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-200"}
            />
          ))}
        </div>
      );

    case "linear_scale": {
      const min = question.config?.min ?? 1;
      const max = question.config?.max ?? 5;
      return (
        <div className="py-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
            <span>{question.config?.minLabel || String(min)}</span>
            <span>{question.config?.maxLabel || String(max)}</span>
          </div>
          <div className="relative mt-2 h-1.5 rounded-full bg-slate-100">
            <div className="absolute left-0 top-0 h-1.5 w-1/2 rounded-full bg-orange-500" />
            <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-500 bg-white shadow-sm" />
          </div>
        </div>
      );
    }

    case "date":
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-2xs">
          DD / MM / YYYY
        </div>
      );

    case "time":
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-2xs">
          -- : --
        </div>
      );

    case "file":
      return (
        <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/30 px-3 py-3 text-orange-500">
          <UploadCloud size={16} />
          <span className="text-[9px] font-bold">Tap to upload file</span>
        </div>
      );

    case "short_text":
    default:
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-400 shadow-2xs">
          {question.config?.placeholder || "Type your answer…"}
        </div>
      );
  }
}

export function PhoneSimulator({ form, questions, focusedQuestionId }: PhoneSimulatorProps) {
  const ordered = useMemo(() => orderQuestions(questions), [questions]);
  const focused =
    ordered.find((q) => q.id === focusedQuestionId) ?? ordered[0] ?? null;
  const focusedIndex = focused ? ordered.findIndex((q) => q.id === focused.id) : 0;
  const showProgress = form?.settings?.showProgressBar !== false;
  const total = Math.max(ordered.length, 1);
  const progressPct =
    ordered.length === 0
      ? 15
      : Math.min(95, Math.round(((focusedIndex + 1) / total) * 100));
  const estimatedMinutes = Math.max(1, Math.ceil((focusedIndex + 1) * 0.4));

  return (
    <div className="w-full rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Live Phone Header */}
      <div className="mb-3.5">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live Phone Preview
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-400">
          Exact view responders see on their phones
        </p>
      </div>

      {/* iPhone Device Shell */}
      <div className="mx-auto w-[285px] shrink-0 rounded-[44px] bg-[#1a1a1c] p-[10px] shadow-[0_0_0_2px_#333,0_20px_50px_rgba(0,0,0,0.45)]">
        <div className="flex h-[590px] flex-col overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
          {/* Dynamic Island / Notch */}
          <div className="relative shrink-0 bg-white pt-2.5">
            <div className="mx-auto h-[20px] w-[95px] rounded-full bg-[#1a1a1c]" />
          </div>

          {/* iOS Status Bar */}
          <div className="flex shrink-0 items-center justify-between bg-white px-5 pb-1 pt-0.5">
            <span className="text-[10px] font-bold text-slate-800 tracking-tight">9:41</span>
            <span className="flex items-center gap-1 text-slate-800">
              <Signal size={10} />
              <Wifi size={10} />
              <Battery size={12} />
            </span>
          </div>

          {/* Top Navbar (Identical to /audit/triage public navbar) */}
          <nav className="shrink-0 bg-white border-b border-slate-100 px-3.5 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                A
              </div>
              <div>
                <div className="font-bold text-slate-900 text-[11px] tracking-tight leading-none">
                  247GBS Audit
                </div>
                <div className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                  Business Check
                </div>
              </div>
            </div>
            <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-[9px]">
              U
            </div>
          </nav>

          {/* Scrollable Screen Body */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-3">
            {/* Progress Area (Identical to public triage) */}
            <div className="mb-2.5 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[11px] font-bold text-slate-900 truncate max-w-[160px]">
                  {form?.title || "Business Triage"}
                </h2>
                <span className="shrink-0 text-[8px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                  Question {focusedIndex + 1}
                </span>
              </div>

              {/* Progress bar */}
              {showProgress && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-[8px] text-slate-500 font-medium">
                <span>
                  {focusedIndex} answered {focusedIndex === 1 ? "question" : "questions"}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock size={9} /> ~{estimatedMinutes} min elapsed
                </span>
              </div>
            </div>

            {/* Question Card (Identical to /audit/triage question card) */}
            {ordered.length === 0 || !focused ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-5 text-center shadow-xs">
                <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <GitBranch size={18} />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {form?.title || "Business Triage"}
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 leading-relaxed">
                  Add questions in the builder to see the live mobile intake screen.
                </p>
              </div>
            ) : (
              <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-3.5 shadow-lg shadow-slate-200/50">
                <div>
                  {/* Stage Label */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 bg-orange-100 rounded-md flex items-center justify-center text-orange-500 shrink-0">
                      <GitBranch size={11} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                      Business Triage
                    </span>
                    {focused.required && (
                      <span className="ml-auto text-[7px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
                        Required
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <h3 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                    {focused.text || "Untitled question"}
                  </h3>

                  {/* Description */}
                  {focused.description ? (
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-2.5">
                      {focused.description}
                    </p>
                  ) : null}

                  {/* Question Input / Choices */}
                  <div className="mt-2">
                    <QuestionInputPreview question={focused} />
                  </div>
                </div>

                {/* Footer Controls (Matches Public Responder Footer) */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[8px]">
                  <span className="flex items-center gap-0.5 text-slate-400 font-bold uppercase tracking-wider">
                    <ChevronLeft size={10} /> {focusedIndex === 0 ? "Exit" : "Back"}
                  </span>
                  <span className="flex items-center gap-0.5 text-slate-400 font-bold uppercase tracking-wider">
                    <Bookmark size={9} /> Later
                  </span>
                  <span className="bg-orange-500 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold shadow-xs flex items-center gap-1">
                    Continue <ArrowRight size={9} />
                  </span>
                </div>
              </div>
            )}

            {/* Bottom dot indicator */}
            {ordered.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1 py-1">
                {ordered.slice(0, 7).map((q, i) => (
                  <span
                    key={q.id}
                    className={`h-1 rounded-full transition-all ${
                      i === Math.min(focusedIndex, 6)
                        ? "w-3 bg-orange-500"
                        : "w-1 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Home Bar Indicator */}
          <div className="flex shrink-0 items-center justify-center bg-transparent py-1.5">
            <div className="h-1 w-24 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
