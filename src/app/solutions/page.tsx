"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, BarChart3, Lightbulb, Target, Clock, ShieldCheck, Layers } from "lucide-react";

export default function SolutionsIntroductionPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <FileText size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">Module 4 of 6</p>
                <p className="text-xs text-slate-400">Recommended Solutions</p>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Your Business Improvement Plan
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Based on your Business Audit and Business Diagnosis, we have prepared a personalised Business Improvement Plan.
            </p>
          </div>

          {/* How recommendations are made */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-orange-500" />
              How Your Recommendations Are Selected
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: BarChart3, label: "Your Business Sector", desc: "Recommendations tailored to your industry" },
                { icon: Target, label: "Your Audit Responses", desc: "Based on what you told us about your business" },
                { icon: ShieldCheck, label: "Your Business Health", desc: "Informed by your diagnosis results" },
                { icon: Layers, label: "Your Opportunities", desc: "Focused on your growth potential" }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What to expect */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-orange-500" />
              What to Expect
            </h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Tell Us Your Budget", desc: "Help us understand the level of investment you're prepared to make." },
                { step: "2", title: "Set Your Timeframe", desc: "Tell us how quickly you want to see measurable results." },
                { step: "3", title: "Receive Your Plan", desc: "Get a complete Business Improvement Plan with prioritised recommendations." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/solutions/budget"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200"
            >
              Continue to Budget
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/dashboard"
              className="bg-white border border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
