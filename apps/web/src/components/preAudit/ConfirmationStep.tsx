import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home } from "lucide-react";
import type { PreAuditSubmission } from "@/lib/preAudit/types";

interface ConfirmationStepProps {
  submission: PreAuditSubmission;
  isDuplicate: boolean;
  afterSubmitHref?: string;
}

function auditLabel(auditType: string | null): string {
  return auditType === "LONG_FORM" ? "Long Business Audit" : "Short Business Audit";
}

export function ConfirmationStep({ submission, isDuplicate, afterSubmitHref }: ConfirmationStepProps) {
  const recommended = submission.recommendedAudit;
  const continueHref =
    afterSubmitHref ?? (recommended ? `/audit/flow?type=${recommended}` : "/auth/signup");

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 px-6 sm:px-10 py-8 sm:py-12 text-center">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
            isDuplicate ? "bg-slate-700" : "bg-green-500"
          }`}
        >
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {isDuplicate ? "You've already completed this pre-audit" : "Pre-Audit Complete"}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
          {isDuplicate
            ? "We didn't create a duplicate — your original pre-audit is still saved."
            : `Your responses are saved on this device, with ${submission.email} recorded as your results email.`}
        </p>
      </div>

      <div className="px-6 sm:px-10 py-8 sm:py-10">
        {recommended ? (
          <div className="border-2 border-orange-500 bg-orange-50 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="text-center">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                Recommended next step
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-orange-600 mb-2">
                {auditLabel(recommended)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Based on your answers, this is the most appropriate full audit for your business. The
                full audit asks a deeper set of questions; your personalised diagnosis follows once
                you create an account.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 mb-6 text-center">
            <p className="text-sm sm:text-base font-bold text-slate-700 mb-2">
              {submission.answeredCount} question{submission.answeredCount === 1 ? "" : "s"} answered
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              Create a free account to continue with a full Business Audit and get your personalised
              diagnosis.
            </p>
          </div>
        )}

        <ul className="space-y-2.5 mb-8">
          {[
            "Your answers are stored securely on your device.",
            "Creating an account keeps everything in one place and unlocks the full audit.",
            "You can repeat this pre-audit anytime to track changes in your business.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700 font-medium">{item}</span>
            </li>
          ))}
        </ul>

        <Link
          href={continueHref}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
        >
          {recommended ? "Start the Full Business Audit" : "Create a Free Account"}
          <ArrowRight size={18} />
        </Link>
        {recommended && (
          <p className="mt-3 text-center text-[11px] text-slate-400 leading-relaxed">
            This starts a fresh audit — your pre-audit answers aren&apos;t carried across. Sign in first
            to have your full-audit results saved and analysed.
          </p>
        )}
        <Link
          href="/auth/signup"
          className="w-full mt-3 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
        >
          Create a Free Account to Save & Access Results
          <ArrowRight size={18} />
        </Link>
        <Link
          href="/"
          className="w-full mt-3 inline-flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all"
        >
          <Home size={14} />
          Return to Home
        </Link>
      </div>
    </div>
  );
}