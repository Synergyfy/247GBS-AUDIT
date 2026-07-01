"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, PoundSterling, CreditCard, Users } from "lucide-react";
import { BudgetRange, PaymentApproach, InternalResources, BudgetSelection } from "@/data/solutions";

const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "under-500", label: "Under £500" },
  { value: "500-2000", label: "£500 – £2,000" },
  { value: "2000-5000", label: "£2,000 – £5,000" },
  { value: "5000-10000", label: "£5,000 – £10,000" },
  { value: "10000-plus", label: "£10,000+" }
];

const PAYMENT_OPTIONS: { value: PaymentApproach; label: string; desc: string }[] = [
  { value: "one-time", label: "One-Time Investment", desc: "Single upfront payment" },
  { value: "monthly", label: "Monthly Investment", desc: "Spread cost over monthly payments" },
  { value: "flexible", label: "Flexible", desc: "Mix of one-time and monthly" }
];

const RESOURCE_OPTIONS: { value: InternalResources; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" }
];

export default function BudgetPage() {
  const router = useRouter();
  const [budgetRange, setBudgetRange] = useState<BudgetRange | null>(null);
  const [paymentApproach, setPaymentApproach] = useState<PaymentApproach | null>(null);
  const [internalResources, setInternalResources] = useState<InternalResources | null>(null);

  const isComplete = budgetRange && paymentApproach && internalResources;

  const handleContinue = () => {
    if (!isComplete) return;
    const selection: BudgetSelection = { budgetRange, paymentApproach, internalResources };
    localStorage.setItem("247gbs_solutions_budget", JSON.stringify(selection));
    router.push("/solutions/timeframe");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Back */}
          <button
            onClick={() => router.push("/solutions")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
              <PoundSterling size={16} />
              Step 1 of 3
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Implementation Budget</h1>
            <p className="text-slate-600">
              To help us prioritise the most practical recommendations, we'd like to understand the level of investment you're prepared to make in improving your business.
            </p>
          </div>

          {/* Budget Range */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <PoundSterling size={18} className="text-orange-500" />
              Budget Range
            </h2>
            <p className="text-sm text-slate-500">What level of investment are you prepared to make over the next 12 months?</p>
            <div className="grid gap-2">
              {BUDGET_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBudgetRange(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    budgetRange === opt.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Approach */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-500" />
              Preferred Payment Approach
            </h2>
            <div className="grid gap-2">
              {PAYMENT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPaymentApproach(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    paymentApproach === opt.value
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

          {/* Internal Resources */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              Internal Resources
            </h2>
            <p className="text-sm text-slate-500">Do you already have internal staff available to assist with implementation?</p>
            <div className="flex gap-2">
              {RESOURCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setInternalResources(opt.value)}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    internalResources === opt.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={!isComplete}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              isComplete
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
