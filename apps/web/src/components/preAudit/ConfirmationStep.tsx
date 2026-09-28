import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home } from "lucide-react";
import type { PreAuditSubmission } from "@/lib/preAudit/types";
import { DESTINATION_LABELS, type TriageDestinationType } from "@/services/triage/types";

interface ConfirmationStepProps {
  submission: PreAuditSubmission;
  isDuplicate: boolean;
  afterSubmitHref?: string;
  customMessage?: string | null;
}

interface DestinationContent {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  isAudit: boolean;
}

function destinationContent(
  destinationType: TriageDestinationType | null,
  destinationTarget: string | null,
  recommendedAudit: string | null
): DestinationContent {
  switch (destinationType) {
    case "SHORT_FORM":
      return {
        title: DESTINATION_LABELS.SHORT_FORM,
        description:
          "Based on your answers, a short audit is the right next step. It keeps the process focused and produces your personalised diagnosis quickly.",
        ctaLabel: "Start the Short Audit",
        ctaHref: "/audit/flow?type=SHORT_FORM",
        isAudit: true,
      };
    case "LONG_FORM":
      return {
        title: DESTINATION_LABELS.LONG_FORM,
        description:
          "Based on your answers, a full business audit is the right next step. It explores your business in depth so your personalised diagnosis is accurate.",
        ctaLabel: "Start the Full Business Audit",
        ctaHref: "/audit/flow?type=LONG_FORM",
        isAudit: true,
      };
    case "SECTOR":
      return {
        title: DESTINATION_LABELS.SECTOR,
        description: destinationTarget
          ? `Based on your answers, a sector-specific audit (${destinationTarget}) is recommended.`
          : "Based on your answers, a sector-specific audit is recommended for your business.",
        ctaLabel: "Start the Sector Audit",
        ctaHref: destinationTarget
          ? `/audit/flow?type=LONG_FORM&sector=${encodeURIComponent(destinationTarget)}`
          : "/audit/flow?type=LONG_FORM",
        isAudit: true,
      };
    case "SUPPORT":
      return {
        title: DESTINATION_LABELS.SUPPORT,
        description:
          "You don't need a full audit right now — our team can answer your questions directly.",
        ctaLabel: "Get Support & Information",
        ctaHref: "/support",
        isAudit: false,
      };
    case "FUND_OR_DONATE":
      return {
        title: DESTINATION_LABELS.FUND_OR_DONATE,
        description:
          "Your answers suggest you'd like to support our work. Thank you — every contribution helps businesses get the guidance they need.",
        ctaLabel: "Make a Contribution",
        ctaHref: destinationTarget || "/funding",
        isAudit: false,
      };
    case "MCOM":
      return {
        title: DESTINATION_LABELS.MCOM,
        description: destinationTarget
          ? `Your answers point to another MCOM service (${destinationTarget}).`
          : "Your answers point to another MCOM service.",
        ctaLabel: "Go to the Service",
        ctaHref: destinationTarget ? `/${destinationTarget}` : "/services",
        isAudit: false,
      };
    case "HUMAN_REVIEW":
      return {
        title: DESTINATION_LABELS.HUMAN_REVIEW,
        description:
          "A member of our team will review your answers and get back to you with the right next step.",
        ctaLabel: "Return to Home",
        ctaHref: "/",
        isAudit: false,
      };
    case "NO_ACTION":
      return {
        title: DESTINATION_LABELS.NO_ACTION,
        description:
          "Based on your answers there's no immediate action needed. You can revisit the pre-audit any time.",
        ctaLabel: "Return to Home",
        ctaHref: "/",
        isAudit: false,
      };
    case "CUSTOM":
      return {
        title: destinationTarget || DESTINATION_LABELS.CUSTOM,
        description: "Based on your answers, here's where you're headed next.",
        ctaLabel: destinationTarget || DESTINATION_LABELS.CUSTOM,
        ctaHref: destinationTarget ? `/${destinationTarget}` : "/",
        isAudit: false,
      };
    default:
      if (recommendedAudit === "LONG_FORM" || recommendedAudit === "SHORT_FORM") {
        return {
          title: recommendedAudit === "LONG_FORM" ? DESTINATION_LABELS.LONG_FORM : DESTINATION_LABELS.SHORT_FORM,
          description:
            "Based on your answers, this is the most appropriate full audit for your business.",
          ctaLabel: "Start the Full Business Audit",
          ctaHref: `/audit/flow?type=${recommendedAudit}`,
          isAudit: true,
        };
      }
      return {
        title: "Pre-Audit Complete",
        description: "Your responses are saved and ready for the next step.",
        ctaLabel: "Create a Free Account",
        ctaHref: "/auth/signup",
        isAudit: false,
      };
  }
}

export function ConfirmationStep({ submission, isDuplicate, afterSubmitHref, customMessage }: ConfirmationStepProps) {
  const recommendedAuditType = submission.recommendedAudit;
  const content = afterSubmitHref
    ? { ...destinationContent(submission.destinationType, submission.destinationTarget, recommendedAuditType), ctaHref: afterSubmitHref }
    : destinationContent(submission.destinationType, submission.destinationTarget, recommendedAuditType);

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
            : submission.email
              ? `Your responses are saved on this device, with ${submission.email} recorded as your results email.`
              : "Your responses are saved on this device."}
        </p>
        {customMessage && (
          <p className="text-orange-200 text-sm sm:text-base max-w-md mx-auto mt-3">
            {customMessage}
          </p>
        )}
      </div>

      <div className="px-6 sm:px-10 py-8 sm:py-10">
        <div className="border-2 border-orange-500 bg-orange-50 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="text-center">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
              Recommended next step
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-orange-600 mb-2">{content.title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">{content.description}</p>
            {submission.serverAuthoritative && (
              <p className="mt-2 text-[10px] sm:text-[11px] font-bold text-green-600 uppercase tracking-widest">
                Verified by our team
              </p>
            )}
          </div>
        </div>

        <ul className="space-y-2.5 mb-8">
          {[
            "Your answers are stored securely on your device.",
            "Creating an account keeps everything in one place.",
            "You can repeat this pre-audit anytime to track changes in your business.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700 font-medium">{item}</span>
            </li>
          ))}
        </ul>

        <Link
          href={content.ctaHref}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
        >
          {content.ctaLabel}
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