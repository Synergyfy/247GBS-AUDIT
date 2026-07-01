"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Download, Printer, Share2,
  AlertTriangle, TrendingUp, Target, ChevronDown, ChevronUp,
  Clock, DollarSign, Layers, CheckCircle2, Briefcase, BarChart3, Zap, Users, Eye, Lightbulb, Flag
} from "lucide-react";
import { SolutionPlan, RecommendationCard, ImplementationPhase } from "@/data/solutions";

const PRIORITY_CONFIG = {
  high: { label: "High Priority", color: "bg-red-50 border-red-200 text-red-700", badge: "bg-red-500" },
  medium: { label: "Medium Priority", color: "bg-amber-50 border-amber-200 text-amber-700", badge: "bg-amber-500" },
  future: { label: "Future Growth", color: "bg-blue-50 border-blue-200 text-blue-700", badge: "bg-blue-500" }
} as const;

export default function SolutionsPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<SolutionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);

  useEffect(() => {
    const planStr = localStorage.getItem("247gbs_solutions_plan");
    if (planStr) {
      try {
        setPlan(JSON.parse(planStr));
      } catch {}
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto">
            <AlertTriangle size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Improvement Plan Found</h2>
          <p className="text-slate-500 text-sm">Please complete your budget and timeframe preferences to generate your plan.</p>
          <Link href="/solutions" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
            Start Your Improvement Plan
          </Link>
        </div>
      </div>
    );
  }

  const highRecs = plan.recommendations.filter(r => r.implementationPriority === 'high');
  const mediumRecs = plan.recommendations.filter(r => r.implementationPriority === 'medium');
  const futureRecs = plan.recommendations.filter(r => r.implementationPriority === 'future');
  const phases = plan.phases;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Print-only header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold">Business Improvement Plan</h1>
        <p className="text-sm text-slate-500">Generated {new Date(plan.createdAt).toLocaleDateString('en-GB')}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-24 sm:pt-28 pb-8 sm:pb-12 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <BarChart3 size={24} className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Recommended Solutions</h1>
              <p className="text-sm text-slate-500">Generated {new Date(plan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <p className="text-slate-600">
            The following recommendations have been prioritised according to the impact they are expected to have on your business.
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "High Priority", value: plan.summary.highPriority, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
            { label: "Medium Priority", value: plan.summary.mediumPriority, color: "text-amber-600", bg: "bg-amber-50", icon: Target },
            { label: "Future Growth", value: plan.summary.futureGrowth, color: "text-blue-600", bg: "bg-blue-50", icon: TrendingUp },
            { label: "Overall Timeline", value: plan.summary.estimatedOverallTimeline, color: "text-green-600", bg: "bg-green-50", icon: Clock }
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-2xl p-4 text-center`}>
              <item.icon size={20} className={`${item.color} mx-auto mb-2`} />
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-slate-500 mt-1">{item.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Recommendation Groups */}
        {[
          { title: "Immediate Actions", desc: "Problems requiring urgent attention", recs: highRecs, key: 'high' as const },
          { title: "Growth Actions", desc: "Initiatives to drive business growth", recs: mediumRecs, key: 'medium' as const },
          { title: "Future Expansion", desc: "Long-term strategic opportunities", recs: futureRecs, key: 'future' as const }
        ].map((group, gi) => group.recs.length > 0 && (
          <motion.section key={group.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + gi * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-1 h-8 rounded-full ${PRIORITY_CONFIG[group.key].badge}`} />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{group.title}</h2>
                <p className="text-sm text-slate-500">{group.desc}</p>
              </div>
            </div>
            <div className="space-y-4">
              {group.recs.map((rec, ri) => (
                <RecommendationCardComponent
                  key={rec.id}
                  rec={rec}
                  isExpanded={expandedRec === rec.id}
                  onToggle={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                  index={ri + 1}
                />
              ))}
            </div>
          </motion.section>
        ))}

        {/* Implementation Phases */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-2">Implementation Roadmap</h2>
          <p className="text-sm text-slate-500 mb-6">Your improvement plan delivered in structured phases.</p>
          <div className="space-y-4">
            {phases.filter(p => p.problemsAddressed.length > 0).map((phase, i) => (
              <PhaseCard
                key={phase.phaseNumber}
                phase={phase}
                isExpanded={expandedPhase === phase.phaseNumber}
                onToggle={() => setExpandedPhase(expandedPhase === phase.phaseNumber ? null : phase.phaseNumber)}
                index={i + 1}
              />
            ))}
          </div>
        </motion.section>

        {/* Business Impact Summary */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-green-200"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 size={22} className="text-green-600" />
            Expected Business Impact
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {plan.expectedBusinessOutcomes.map((outcome, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={14} className="text-green-600" />
                </div>
                <span className="text-sm text-slate-700">{outcome}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* MCOM Service Mapping */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-2">Recommended MCOM Services</h2>
          <p className="text-sm text-slate-500 mb-4">Every recommendation maps to a specific MCOM ecosystem service.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 font-semibold text-slate-700">Business Issue</th>
                  <th className="text-left py-2 font-semibold text-slate-700">Recommended MCOM Service</th>
                </tr>
              </thead>
              <tbody>
                {plan.mcomServiceMapping.map((m, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-4 text-slate-600">{m.issue}</td>
                    <td className="py-2.5 font-medium text-orange-700">{m.solution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Download / Print / Share */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-3"
        >
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-3 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-3 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all">
            <Share2 size={16} /> Share
          </button>
        </motion.div>

        {/* Next Step */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Ready to Move Forward?</h2>
          <p className="text-white/80 text-sm max-w-lg mx-auto mb-6">
            Your Business Improvement Plan is ready. The next step is to review your recommendations with an MCOM Account Manager, who will validate the plan, answer your questions, and prepare your implementation proposal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                localStorage.setItem("247gbs_solutions_complete", "true");
                router.push("/dashboard");
              }}
              className="bg-white text-orange-700 px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-lg"
            >
              Continue to Account Manager Review
              <ArrowRight size={16} />
            </button>
            <button onClick={() => window.print()} className="bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
              <Download size={16} />
              Download My Improvement Plan
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function RecommendationCardComponent({ rec, isExpanded, onToggle, index }: {
  rec: RecommendationCard;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const cfg = PRIORITY_CONFIG[rec.implementationPriority];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-5 hover:bg-slate-50 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${cfg.badge}`}>
              {index}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-slate-900">{rec.businessIssue}</span>
              </div>
              <p className="text-sm text-orange-700 font-medium">{rec.recommendedSolution}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
              {cfg.label}
            </span>
            {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5 pt-0 border-t border-slate-100"
        >
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-3">
              <InfoBlock icon={AlertTriangle} label="Evidence" value={rec.evidence} />
              <InfoBlock icon={Zap} label="Why This Solution?" value={rec.whyThisSolution} />
              <InfoBlock icon={Flag} label="Severity" value={rec.severity} />
              {rec.businessImpact.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Business Impact</p>
                  <ul className="space-y-1">
                    {rec.businessImpact.map((imp, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MiniStat icon={Clock} label="Timeline" value={rec.estimatedTimeline} />
                <MiniStat icon={DollarSign} label="Investment" value={rec.estimatedInvestment} />
                <MiniStat icon={Target} label="Priority" value={cfg.label} />
                <MiniStat icon={BarChart3} label="Impact" value={rec.expectedBusinessImpact === 'high' ? 'High' : rec.expectedBusinessImpact === 'medium' ? 'Medium' : 'Low'} />
              </div>
              {rec.expectedOutcomes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expected Outcomes</p>
                  <ul className="space-y-1">
                    {rec.expectedOutcomes.map((outcome, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                href={`/solutions/${rec.solutionId}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 mt-2"
              >
                View Solution Details
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PhaseCard({ phase, isExpanded, onToggle, index }: {
  phase: ImplementationPhase;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-700 font-bold text-sm">
            {index}
          </div>
          <div>
            <p className="font-bold text-slate-900">{phase.title}</p>
            <p className="text-sm text-slate-500">{phase.estimatedDuration}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {isExpanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t border-slate-100">
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Objectives</p>
                <ul className="space-y-1">
                  {phase.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={14} className="text-orange-500 shrink-0 mt-0.5" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Problems Addressed</p>
                <div className="flex flex-wrap gap-1.5">
                  {phase.problemsAddressed.map((p, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">{p}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expected Outcome</p>
                <p className="text-sm text-slate-700">{phase.expectedOutcome}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Prerequisites</p>
                <p className="text-sm text-slate-700">{phase.prerequisites}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <Icon size={12} className="text-slate-400" />
        {label}
      </p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        <Icon size={12} />
        {label}
      </div>
      <p className="font-bold text-slate-900 text-sm">{value}</p>
    </div>
  );
}
