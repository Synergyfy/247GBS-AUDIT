"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Clock, Gauge } from "lucide-react";
import { TimeToResults, PriorityApproach, TimeframeSelection, BudgetSelection } from "@/data/solutions";
import { BusinessDiagnosis, generateDiagnosis } from "@/lib/diagnosis";
import { generateSolutionPlan } from "@/lib/solutions";

const TIME_OPTIONS: { value: TimeToResults; label: string }[] = [
  { value: "immediately", label: "Immediately" },
  { value: "within-30", label: "Within 30 Days" },
  { value: "within-60", label: "Within 60 Days" },
  { value: "within-90", label: "Within 90 Days" },
  { value: "within-6-months", label: "Within 6 Months" },
  { value: "long-term", label: "Long-Term Strategic Growth" }
];

const PRIORITY_OPTIONS: { value: PriorityApproach; label: string; desc: string }[] = [
  { value: "faster", label: "Faster Implementation", desc: "Quick results matter most" },
  { value: "lower-investment", label: "Lower Investment", desc: "Minimise upfront cost" },
  { value: "max-return", label: "Maximum Long-Term Return", desc: "Best value over time" },
  { value: "balanced", label: "Balanced Approach", desc: "Good balance of speed and cost" }
];

export default function TimeframePage() {
  const router = useRouter();
  const [timeToResults, setTimeToResults] = useState<TimeToResults | null>(null);
  const [priorityApproach, setPriorityApproach] = useState<PriorityApproach | null>(null);
  const [generating, setGenerating] = useState(false);

  const isComplete = timeToResults && priorityApproach;

  const handleGenerate = async () => {
    if (!isComplete) return;
    setGenerating(true);

    try {
      const budgetStr = localStorage.getItem("247gbs_solutions_budget");
      if (!budgetStr) { router.push("/solutions/budget"); return; }
      const budget: BudgetSelection = JSON.parse(budgetStr);
      const timeframe: TimeframeSelection = { timeToResults, priorityApproach };

      const auditStr = localStorage.getItem("247gbs_audit_completed");
      if (!auditStr) { router.push("/dashboard"); return; }
      const audit = JSON.parse(auditStr);

      const flowStr = localStorage.getItem("247gbs_audit_flow");
      const answers = flowStr ? JSON.parse(flowStr) : {};

      const diagnosisStr = localStorage.getItem("247gbs_diagnosis");
      let diagnosis: BusinessDiagnosis;
      if (diagnosisStr) {
        diagnosis = JSON.parse(diagnosisStr);
      } else {
        diagnosis = generateDiagnosis(answers);
      }

      const plan = generateSolutionPlan(diagnosis, budget, timeframe, audit.sectorId || "");
      localStorage.setItem("247gbs_solutions_plan", JSON.stringify(plan));
      localStorage.setItem("247gbs_solutions_prefs", JSON.stringify(timeframe));
      localStorage.setItem("247gbs_improvement_plan_complete", "true");

      router.push("/solutions/plan");
    } catch {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Back */}
          <button
            onClick={() => router.push("/solutions/budget")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
              <Clock size={16} />
              Step 2 of 3
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Implementation Timeframe</h1>
            <p className="text-slate-600">
              Different improvement strategies produce results over different timeframes. Help us understand how quickly you want to see measurable improvements.
            </p>
          </div>

          {/* Time to Results */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              Desired Timeframe
            </h2>
            <p className="text-sm text-slate-500">How quickly would you like to begin seeing measurable results?</p>
            <div className="grid gap-2">
              {TIME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTimeToResults(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    timeToResults === opt.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Approach */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Gauge size={18} className="text-orange-500" />
              Your Priority
            </h2>
            <p className="text-sm text-slate-500">Which is most important to you?</p>
            <div className="grid gap-2">
              {PRIORITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPriorityApproach(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    priorityApproach === opt.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="font-medium text-sm text-slate-900 block">{opt.label}</span>
                  <span className="text-xs text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={!isComplete || generating}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              isComplete && !generating
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {generating ? (
              <>Generating Your Plan...</>
            ) : (
              <>
                Generate My Business Improvement Plan
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
