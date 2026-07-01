"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, DollarSign,
  AlertTriangle, Link2, Package, Zap, Heart, Store, Megaphone,
  UserCheck, Briefcase, Mail, Monitor, TrendingUp, Globe, BrainCircuit, Lightbulb
} from "lucide-react";
import { getSolutionById } from "@/data/solutions-catalog";
import { SolutionPlan } from "@/data/solutions";

const ICON_MAP: Record<string, any> = {
  Package, Zap, Heart, Store, Megaphone, UserCheck, Briefcase, Mail, Monitor, TrendingUp, Globe, BrainCircuit
};

export default function SolutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const solution = getSolutionById(id);

  if (!solution) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto">
            <AlertTriangle size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Solution Not Found</h2>
          <p className="text-slate-500 text-sm">The solution you are looking for could not be found.</p>
          <Link href="/solutions/plan" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
            Back to Improvement Plan
          </Link>
        </div>
      </div>
    );
  }

  const SolIcon = ICON_MAP[solution.icon] || Lightbulb;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-8 sm:pb-12 space-y-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Improvement Plan
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                <SolIcon size={32} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{solution.solutionName}</h1>
                <p className="text-sm text-slate-500">{solution.mcomService}</p>
              </div>
            </div>
          </div>

          {/* Problem & Evidence */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              Problem Summary
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{solution.description}</p>
          </div>

          {/* Why This Solution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb size={18} className="text-orange-500" />
              Why This Recommendation?
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{solution.whyThisSolution}</p>
          </div>

          {/* Implementation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              Implementation Activities
            </h2>
            <ul className="space-y-2">
              {solution.implementationActivities.map((activity, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  {activity}
                </li>
              ))}
            </ul>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Clock size={14} />
                  Estimated Timeline
                </div>
                <p className="font-bold text-slate-900">{solution.estimatedTimeline}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <DollarSign size={14} />
                  Estimated Investment
                </div>
                <p className="font-bold text-slate-900">{solution.estimatedInvestment}</p>
              </div>
            </div>
          </div>

          {/* Expected Outcomes */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              Expected Outcomes
            </h2>
            <ul className="space-y-2">
              {solution.expectedOutcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          {/* Dependencies */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Link2 size={18} className="text-orange-500" />
              Dependencies
            </h2>
            <ul className="space-y-1.5">
              {solution.dependencies.map((dep, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                  {dep}
                </li>
              ))}
            </ul>
          </div>

          {/* Related Services */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Link2 size={18} className="text-orange-500" />
              Related MCOM Services
            </h2>
            <div className="flex flex-wrap gap-2">
              {solution.relatedMcomServices.map((service, i) => (
                <span key={i} className="text-sm bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-medium">
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Back to Plan */}
          <div className="flex justify-center">
            <Link
              href="/solutions/plan"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-200"
            >
              Back to My Improvement Plan
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
