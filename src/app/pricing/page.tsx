"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Award, Star, Crown, Medal, Sparkles
} from "lucide-react";
import { PRICING_PLANS, PricingPlan, PlanTier } from "@/data/pricing";

const ICON_MAP: Record<string, React.ReactNode> = {
  Award: <Award size={24} />,
  Medal: <Medal size={24} />,
  Star: <Star size={24} />,
  Crown: <Crown size={24} />
};

export default function PricingPage() {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full text-orange-700 font-bold text-sm">
            <Sparkles size={16} />
            Pricing Plans
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900">
            Choose Your Plan
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Every plan includes a free Business Triage. Upgrade to unlock deeper diagnostics, recommendations, and dedicated support.
          </p>
        </motion.div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 pb-20 space-y-8">
        {PRICING_PLANS.map((plan, pi) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pi * 0.1 }}
            className={`bg-gradient-to-br ${plan.bgGradient} rounded-3xl border border-slate-200 overflow-hidden`}
          >
            {/* Plan Header */}
            <button
              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-white/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.badgeColor}`}>
                  {ICON_MAP[plan.icon]}
                </div>
                <div className="text-left">
                  <h2 className={`text-xl sm:text-2xl font-bold ${plan.color}`}>{plan.name}</h2>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`hidden sm:inline text-xs font-bold px-3 py-1.5 rounded-full ${plan.badgeColor}`}>
                  {plan.tiers.length} tiers
                </span>
                {expandedPlan === plan.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </div>
            </button>

            {/* Tiers */}
            {expandedPlan === plan.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-6 sm:px-8 pb-8"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  {plan.tiers.map((tier) => (
                    <TierCard key={tier.id} plan={plan} tier={tier} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Desktop: always show tiers */}
            <div className="hidden md:block px-6 sm:px-8 pb-8">
              <div className="grid md:grid-cols-3 gap-4">
                {plan.tiers.map((tier) => (
                  <TierCard key={tier.id} plan={plan} tier={tier} />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Not Sure Which Plan Fits?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Start with a free Business Triage. We'll recommend the right plan based on your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signin"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              Start Free Triage
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/"
              className="bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TierCard({ plan, tier }: { plan: PricingPlan; tier: PlanTier }) {
  return (
    <div className={`bg-white rounded-2xl border-2 p-5 flex flex-col ${
      tier.highlighted ? 'border-orange-500 shadow-lg shadow-orange-200/30 ring-1 ring-orange-500' : 'border-slate-200'
    }`}>
      {tier.highlighted && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full self-start mb-3">
          <Star size={12} />
          Most Popular
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-slate-900">{tier.price}</span>
          {tier.priceSuffix && <span className="text-sm text-slate-500">{tier.priceSuffix}</span>}
        </div>
      </div>
      <ul className="space-y-2.5 mb-6 flex-1">
        {tier.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${tier.highlighted ? 'text-orange-500' : 'text-green-500'}`} />
            <span className={feat.endsWith(':') ? 'font-semibold text-slate-900' : 'text-slate-600'}>{feat}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/auth/signup"
        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          tier.highlighted
            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        }`}
      >
        Get Started <ArrowRight size={14} />
      </Link>
    </div>
  );
}
