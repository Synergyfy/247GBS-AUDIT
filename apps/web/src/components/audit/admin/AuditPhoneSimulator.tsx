"use client";

import React, { useMemo } from "react";
import {
  ArrowRight,
  Battery,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  Layers,
  Signal,
  Star,
  UploadCloud,
  Wifi,
} from "lucide-react";
import type { AuditFormQuestion, AuditFormType } from "@/services/admin/audit-forms/types";

interface AuditPhoneSimulatorProps {
  title: string;
  description?: string | null;
  auditType: AuditFormType;
  questions: AuditFormQuestion[];
  focusedQuestionId: string | null;
  sectorName?: string | null;
}

export function AuditPhoneSimulator({
  title,
  description,
  auditType,
  questions,
  focusedQuestionId,
  sectorName,
}: AuditPhoneSimulatorProps) {
  const activeQuestions = useMemo(
    () =>
      [...questions]
        .filter((q) => q.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [questions]
  );

  const focused =
    activeQuestions.find((q) => q.id === focusedQuestionId) ??
    activeQuestions[0] ??
    null;

  const focusedIndex = focused
    ? activeQuestions.findIndex((q) => q.id === focused.id)
    : 0;

  const total = Math.max(activeQuestions.length, 1);
  const progressPct =
    activeQuestions.length === 0
      ? 15
      : Math.min(95, Math.round(((focusedIndex + 1) / total) * 100));

  const estimatedMinutes = Math.max(1, Math.ceil((focusedIndex + 1) * 0.5));
  const isShort = auditType === "SHORT_FORM";

  return (
    <div className="w-full rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Live Phone Header */}
      <div className="mb-3.5">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live Mobile Audit Preview
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-400">
          Real-time view of what respondents see on their phones
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

          {/* Mobile Top Navbar (matches /audit/flow) */}
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
                  Business Assessment
                </div>
              </div>
            </div>
            <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-[9px]">
              U
            </div>
          </nav>

          {/* Scrollable Screen Content */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-3">
            {/* Progress Header Area */}
            <div className="mb-2.5 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">
                  {title || (isShort ? "Short Audit" : "Long Audit")}
                </h2>
                <span className="shrink-0 text-[8px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                  Question {focusedIndex + 1} of {total}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                <div
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[8px] text-slate-500 font-medium">
                <span>
                  {isShort ? "Short Assessment" : "Long Assessment"}
                  {sectorName ? ` • ${sectorName}` : ""}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock size={9} /> ~{estimatedMinutes} min
                </span>
              </div>
            </div>

            {/* Question Card */}
            {activeQuestions.length === 0 || !focused ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-5 text-center shadow-xs">
                <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Layers size={18} />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {title || "Audit Template"}
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 leading-relaxed">
                  Add evaluation questions in the builder to see the live mobile audit view.
                </p>
              </div>
            ) : (
              <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-3.5 shadow-lg shadow-slate-200/50">
                <div>
                  {/* Category / Stage Label */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 bg-orange-100 rounded-md flex items-center justify-center text-orange-500 shrink-0">
                      <Layers size={11} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate">
                      {focused.category || "General Evaluation"}
                    </span>
                    {focused.required && (
                      <span className="ml-auto text-[7px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
                        Required
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <h3 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                    {focused.text || "Untitled evaluation question"}
                  </h3>

                  {/* Description / Hint */}
                  {focused.description || focused.hint ? (
                    <p className="text-slate-500 text-[9px] leading-relaxed mb-2.5">
                      {focused.description || focused.hint}
                    </p>
                  ) : null}

                  {/* Options / Inputs Preview */}
                  <div className="mt-2 space-y-1.5">
                    {focused.type === "long_text" ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-400 shadow-2xs">
                        Enter comprehensive evaluation observations…
                        <div className="mt-1 h-6" />
                      </div>
                    ) : focused.type === "number" ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-500 shadow-2xs">
                        0
                      </div>
                    ) : (
                      (focused.answers && focused.answers.length > 0
                        ? focused.answers
                        : [
                            { id: "p1", text: "Optimal / Strongly Compliant", scoreImpact: 10 },
                            { id: "p2", text: "Adequate / Needs Minor Review", scoreImpact: 5 },
                            { id: "p3", text: "Critical Vulnerability / High Risk", scoreImpact: 0 },
                          ]
                      ).map((ans: any, idx: number) => (
                        <div
                          key={ans.id}
                          className={`flex items-center justify-between gap-2 p-2 rounded-xl border transition-all text-left shadow-2xs ${
                            idx === 0
                              ? "bg-orange-50/70 border-orange-300"
                              : "bg-white border-slate-100 hover:border-orange-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                idx === 0
                                  ? "bg-orange-500 text-white"
                                  : "bg-slate-50 text-slate-400"
                              }`}
                            >
                              <ArrowRight size={10} />
                            </div>
                            <span
                              className={`font-bold text-[10px] leading-tight truncate ${
                                idx === 0 ? "text-orange-950" : "text-slate-900"
                              }`}
                            >
                              {ans.text}
                            </span>
                          </div>
                          {ans.scoreImpact !== null && ans.scoreImpact !== undefined && (
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
                                ans.scoreImpact >= 7
                                  ? "bg-emerald-50 text-emerald-700"
                                  : ans.scoreImpact >= 4
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              +{ans.scoreImpact} pts
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Card Footer Controls */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[8px]">
                  <span className="flex items-center gap-0.5 text-slate-400 font-bold uppercase tracking-wider">
                    <ChevronLeft size={10} /> {focusedIndex === 0 ? "Exit" : "Back"}
                  </span>
                  <span className="bg-orange-500 text-white rounded-lg px-3 py-1 text-[9px] font-bold shadow-xs flex items-center gap-1">
                    Next <ArrowRight size={9} />
                  </span>
                </div>
              </div>
            )}

            {/* Bottom dot indicators */}
            {activeQuestions.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1 py-1">
                {activeQuestions.slice(0, 7).map((q, i) => (
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
