"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Home,
  Layers,
  PoundSterling,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import type { PreAuditSubmission } from "@/lib/preAudit/types";
import { DESTINATION_LABELS, type TriageDestinationType } from "@/services/triage/types";
import { calculatePreAuditDiagnosis, type PreAuditDiagnosticSummary } from "@/lib/preAudit/calculator";

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
          "Based on your answers, a short audit is the right next step. It keeps the process focused and produces your personalized diagnosis quickly.",
        ctaLabel: "Start the Short Audit",
        ctaHref: "/audit/flow?type=SHORT_FORM",
        isAudit: true,
      };
    case "LONG_FORM":
      return {
        title: DESTINATION_LABELS.LONG_FORM,
        description:
          "Based on your answers, a full business audit is the right next step. It explores your business in depth so your recovery potential and action plan are accurate.",
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
          ? `Your answers point to another Central Hub Solution service (${destinationTarget}).`
          : "Your answers point to another Central Hub Solution service.",
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

export function ConfirmationStep({
  submission,
  isDuplicate,
  afterSubmitHref,
  customMessage,
}: ConfirmationStepProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  // Compute or extract the diagnostic synthesis
  const diagnostic: PreAuditDiagnosticSummary =
    submission.diagnosticSummary ||
    calculatePreAuditDiagnosis(
      (submission.answers || []).map((a) => ({
        questionId: a.questionId,
        questionText: a.questionText,
        answerTexts: a.answerTexts,
        value: a.value,
      }))
    );

  const recommendedAuditType =
    submission.recommendedAudit || diagnostic.recommendation.auditType;
  const content = afterSubmitHref
    ? {
        ...destinationContent(
          submission.destinationType,
          submission.destinationTarget,
          recommendedAuditType
        ),
        ctaHref: afterSubmitHref,
      }
    : destinationContent(
        submission.destinationType,
        submission.destinationTarget,
        recommendedAuditType
      );

  const funding = diagnostic.funding;
  const operations = diagnostic.operations;
  const business = diagnostic.business;
  const readiness = diagnostic.readiness;
  const accountant = diagnostic.accountant;

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-6 sm:px-10 py-8 sm:py-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            isDuplicate ? "bg-slate-700" : "bg-gradient-to-tr from-orange-500 to-amber-400"
          } shadow-lg shadow-orange-500/20`}
        >
          <Sparkles size={28} className="text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-orange-400 text-xs font-semibold tracking-wide uppercase mb-3">
          <ShieldCheck size={14} />
          Pre-Audit Initial Diagnostic
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          {isDuplicate ? "Your Pre-Audit Diagnostic" : "Where Your Business Currently Stands"}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
          {submission.email
            ? `Your answers and initial diagnosis are saved on this device (${submission.email}).`
            : "Your initial diagnosis is ready. Here is what your numbers tell us:"}
        </p>
        {customMessage && (
          <p className="text-orange-200 text-xs sm:text-sm max-w-md mx-auto mt-2">
            {customMessage}
          </p>
        )}
      </div>

      <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Business Foundation Badges */}
        {(business.category || business.operatingTenure || business.location) && (
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
            {business.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
                <Building2 size={13} className="text-slate-500" />
                {business.category}
              </span>
            )}
            {business.operatingTenure && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
                <Calendar size={13} className="text-slate-500" />
                Operating: {business.operatingTenure}
              </span>
            )}
            {business.location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
                📍 {business.location}
              </span>
            )}
            {readiness.level !== "not_specified" && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  readiness.level === "immediate"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : readiness.level === "preparation_needed"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <Zap size={13} />
                {readiness.label}
              </span>
            )}
          </div>
        )}

        {/* 1. FINANCIAL POSITION & FUNDING GAP SPOTLIGHT */}
        {funding.status === "gap_identified" && funding.fundingGap !== null && (
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50/70 via-orange-50/50 to-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                  <PoundSterling size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Funding Gap Analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    What your business needs vs. what you currently have
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                Gap Identified
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-4 text-center">
              <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-orange-100 shadow-xs">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Required Need
                </span>
                <span className="text-sm sm:text-lg font-extrabold text-slate-800">
                  {funding.fundingNeedFormatted || "—"}
                </span>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-orange-100 shadow-xs">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Own Funds
                </span>
                <span className="text-sm sm:text-lg font-extrabold text-slate-800">
                  {funding.ownContributionFormatted || "£0"}
                </span>
              </div>
              <div className="bg-orange-500 text-white rounded-xl p-3 shadow-md shadow-orange-500/20">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-100 block mb-1">
                  Estimated Gap
                </span>
                <span className="text-sm sm:text-lg font-black">
                  {funding.fundingGapFormatted}
                </span>
              </div>
            </div>

            <div className="bg-white/90 rounded-xl p-3.5 border border-amber-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <strong>Strategic Takeaway:</strong> Your available budget (
                {funding.ownContributionFormatted || "£0"}) does not match your total operational need (
                {funding.fundingNeedFormatted}). The recommended full audit will map out alternative
                cost-neutral recovery, campaign options, and unmonetized capacity to help close this{" "}
                <strong>{funding.fundingGapFormatted} gap</strong> without requiring you to fund it all upfront.
              </div>
            </div>
          </div>
        )}

        {funding.status === "fully_funded" && funding.fundingNeed !== null && (
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-4 sm:p-5 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-green-900">
                Funding Requirement Fully Covered
              </h4>
              <p className="text-xs text-green-700 mt-1">
                Your available funds ({funding.ownContributionFormatted}) match or exceed your immediate need (
                {funding.fundingNeedFormatted}). The next step is directing those funds into maximum ROI.
              </p>
            </div>
          </div>
        )}

        {/* 2. OPERATIONAL & SEASONAL HIGHLIGHTS */}
        {(operations.excessStockLevel || operations.spareCapacityLevel) && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={18} className="text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Operational &amp; Seasonal Capacity
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {operations.excessStockLevel && (
                <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Excess / Slow-Moving Stock
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {operations.excessStockLevel}
                  </p>
                  {operations.excessStockPeakSeason && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1 font-medium">
                      <span>🍂 Peak Pressure:</span> {operations.excessStockPeakSeason}
                    </p>
                  )}
                </div>
              )}
              {operations.spareCapacityLevel && (
                <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Unused Operational Capacity
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {operations.spareCapacityLevel}
                  </p>
                  {operations.spareCapacityType.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Type: {operations.spareCapacityType.join(", ")}
                    </p>
                  )}
                  {operations.spareCapacityPeakSeason && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1 font-medium">
                      <span>⏱ Highest Idle:</span> {operations.spareCapacityPeakSeason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. ACCOUNTANT COLLABORATION CALLOUT */}
        {accountant.involved && accountant.email && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 flex items-start gap-3">
            <UserCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900">
                Accountant Collaboration Active
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                We have recorded <strong>{accountant.email}</strong> as your financial collaborator.
                A pre-audit review request with your recorded figures has been queued for their review.
              </p>
            </div>
          </div>
        )}

        {/* 4. RECOMMENDED NEXT STEP */}
        <div className="border-2 border-orange-500 bg-orange-50/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="max-w-xl mx-auto text-center">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full inline-block mb-3">
              Tailored Recommendation
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              {content.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {diagnostic.recommendation.rationale || content.description}
            </p>

            <Link
              href={content.ctaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {content.ctaLabel}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 5. ANSWERS ACCORDION (Review submitted data) */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-slate-500" />
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                Review Your Submitted Answers ({submission.answers.length})
              </span>
            </div>
            {showAnswers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAnswers && (
            <div className="divide-y divide-slate-100 p-4 bg-white text-xs max-h-80 overflow-y-auto">
              {submission.answers.map((ans, idx) => (
                <div key={ans.questionId || idx} className="py-2.5">
                  <p className="font-semibold text-slate-800">{ans.questionText}</p>
                  <p className="text-orange-600 font-medium mt-0.5">
                    {ans.answerTexts?.length
                      ? ans.answerTexts.join(", ")
                      : ans.value !== undefined && ans.value !== null
                      ? String(ans.value)
                      : "No answer"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/"
          className="w-full pt-2 inline-flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <Home size={14} />
          Return to Home
        </Link>
      </div>
    </div>
  );
}