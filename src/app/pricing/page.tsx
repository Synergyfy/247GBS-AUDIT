"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check, Star, Zap, ArrowRight, Shield, Award, Crown, Medal, Sparkles, ChevronDown, ChevronUp, CheckCircle2, Minus
} from "lucide-react";
import { PRICING_PLANS, PricingPlan, PlanTier, TierId } from "@/data/pricing";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  Award: <Award className="w-full h-full" />,
  Medal: <Medal className="w-full h-full" />,
  Star: <Star className="w-full h-full" />,
  Crown: <Crown className="w-full h-full" />
};

type BillingCycle = 'monthly' | 'quarterly' | 'annual';

function parsePrice(priceStr: string): number {
  if (priceStr.toLowerCase() === 'free') return 0;
  const numStr = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(numStr) || 0;
}

function getDiscountedPrice(basePrice: number, cycle: BillingCycle): number {
  if (basePrice === 0) return 0;
  if (cycle === 'quarterly') return Math.floor(basePrice * 0.9);
  if (cycle === 'annual') return Math.floor(basePrice * 0.8);
  return basePrice;
}

function formatPrice(price: number, originalStr: string): string {
  if (price === 0 && originalStr.toLowerCase() === 'free') return 'Free';
  if (price === 0) return '£0';
  const symbol = originalStr.replace(/[0-9.,]/g, '').trim() || '£';
  return `${symbol}${price.toLocaleString()}`;
}

function getComparisonTableData(selectedSubTier: TierId) {
  const allFeatures = new Set<string>();
  
  PRICING_PLANS.forEach(plan => {
    const tierData = plan.tiers.find(t => t.id === selectedSubTier);
    if (tierData) {
      tierData.features.forEach(f => {
        if (!f.toLowerCase().startsWith('everything in')) {
          allFeatures.add(f);
        }
      });
    }
  });

  return Array.from(allFeatures);
}

export default function PricingPage() {
  const [selectedSubTier, setSelectedSubTier] = useState<TierId>('normal');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showComparison, setShowComparison] = useState(false);
  const comparisonFeatures = getComparisonTableData(selectedSubTier);

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Pricing Plans
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              Choose Your <span className="text-orange-500">Plan</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 font-medium">
              Every plan includes a free Business Triage. Upgrade to unlock deeper diagnostics, recommendations, and dedicated support.
            </p>
          </motion.div>

          <div className="mt-8 md:mt-12 flex flex-col items-center gap-6">
            {/* Billing Cycle Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-full">
              {(['monthly', 'quarterly', 'annual'] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center",
                    billingCycle === cycle ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <span className="capitalize">{cycle}</span>
                  {cycle === 'quarterly' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">Save 10%</span>}
                  {cycle === 'annual' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">Save 20%</span>}
                </button>
              ))}
            </div>

            {/* Sub-tier Toggle */}
            <div className="flex gap-2 p-1.5 bg-orange-500/5 rounded-2xl border border-orange-500/10 overflow-x-auto w-full sm:w-auto">
              {(['normal', 'pro', 'pro-plus'] as TierId[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedSubTier(tier)}
                  className={cn(
                    "px-4 md:px-6 py-3 rounded-xl text-sm font-semibold transition-all flex flex-col items-center min-w-[90px] md:min-w-[120px]",
                    selectedSubTier === tier 
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" 
                      : "text-orange-500/60 hover:text-orange-500 hover:bg-orange-500/10"
                  )}
                >
                  {tier === 'normal' ? 'Normal' : tier === 'pro' ? 'Pro' : 'Pro+'}
                  <span className="text-[10px] opacity-80 font-normal mt-1">
                    {tier === 'normal' && 'Basic Access'}
                    {tier === 'pro' && 'More Growth'}
                    {tier === 'pro-plus' && 'Max Visibility'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Membership Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-32">
          {PRICING_PLANS.map((plan, index) => {
            const isGold = plan.id === 'gold';
            const tierData = plan.tiers.find(t => t.id === selectedSubTier) || plan.tiers[0];
            const PlanIcon = ICON_MAP[plan.icon] || ICON_MAP['Star'];
            
            const basePrice = parsePrice(tierData.price);
            const discountedPrice = getDiscountedPrice(basePrice, billingCycle);
            const displayPrice = formatPrice(discountedPrice, tierData.price);
            const totalBilled = billingCycle === 'annual' ? discountedPrice * 12 : billingCycle === 'quarterly' ? discountedPrice * 3 : discountedPrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={cn(
                  "relative p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] flex flex-col transition-all duration-500",
                  isGold 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/40 scale-[1.02] md:scale-105 z-10" 
                    : "bg-white border border-slate-100 hover:border-orange-500/20 hover:shadow-2xl"
                )}
              >
                {isGold && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 font-bold px-3 md:px-4 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg whitespace-nowrap">
                    <Star className="w-3 h-3 fill-current" /> MOST POPULAR
                  </div>
                )}

                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center p-2.5 md:p-3 shadow-sm transition-transform group-hover:scale-110", isGold ? "bg-white/10 text-white" : plan.badgeColor)}>
                    {PlanIcon}
                  </div>
                  <div className={cn("text-xs font-semibold uppercase tracking-widest", isGold ? "text-slate-300" : "text-slate-400")}>
                    {plan.name}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold">{displayPrice}</span>
                    {tierData.priceSuffix && <span className={cn("text-sm", isGold ? "text-slate-400" : "text-slate-500")}>{tierData.priceSuffix}</span>}
                  </div>
                  {basePrice > 0 && billingCycle !== 'monthly' && (
                    <div className={cn("text-xs font-bold mt-1", isGold ? "text-green-400" : "text-green-600")}>
                      Billed {formatPrice(totalBilled, tierData.price)} {billingCycle === 'annual' ? 'yearly' : 'quarterly'}
                    </div>
                  )}
                </div>

                <p className={cn("mb-6 md:mb-8 text-sm font-medium leading-relaxed", isGold ? "text-slate-300" : "text-slate-500")}>
                  {plan.description}
                </p>

                <div className={cn("h-px w-full mb-6 md:mb-8", isGold ? "bg-white/20" : "bg-slate-100")} />

                <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-1">
                  <div className={cn("text-xs font-bold uppercase tracking-widest", isGold ? "text-slate-400" : "text-slate-400")}>Features</div>
                  {tierData.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className={cn("w-4 h-4 shrink-0 mt-0.5", isGold ? "text-orange-400" : "text-orange-500")} />
                      <span className={cn("text-sm font-semibold", isGold ? "text-white" : "text-slate-700")}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  href="/auth/signup"
                  className={cn(
                  "w-full py-3 md:py-4 rounded-2xl font-black text-base md:text-lg transition-all active:scale-95 shadow-lg text-center",
                  isGold ? "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20" : "bg-slate-900 text-white hover:bg-black shadow-slate-900/20"
                )}>
                  Select Plan
                </Link>

              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table Section */}
        <div className="max-w-5xl mx-auto px-4 mb-16 md:mb-32">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 text-slate-900 font-bold text-lg sm:text-xl hover:text-orange-600 transition-colors"
            >
              Compare All Features
              {showComparison ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            <p className="text-slate-500 text-sm mt-2">See exactly what's included in each plan at the {selectedSubTier === 'normal' ? 'Normal' : selectedSubTier === 'pro' ? 'Pro' : 'Pro+'} tier level.</p>
          </div>

          <motion.div
            initial={false}
            animate={{ height: showComparison ? "auto" : 0, opacity: showComparison ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-xl">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-6 border-b border-slate-200 bg-slate-50 w-1/3">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Features</span>
                    </th>
                    {PRICING_PLANS.map(plan => (
                      <th key={plan.id} className="p-6 border-b border-slate-200 text-center w-1/6">
                        <span className={cn("text-lg font-bold", plan.id === 'gold' ? "text-orange-500" : "text-slate-900")}>
                          {plan.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 sm:p-6 border-b border-slate-100 text-sm font-medium text-slate-700">
                        {feature}
                      </td>
                      {PRICING_PLANS.map(plan => {
                        const tierData = plan.tiers.find(t => t.id === selectedSubTier);
                        const hasFeature = tierData?.features.includes(feature);
                        return (
                          <td key={plan.id} className="p-4 sm:p-6 border-b border-slate-100 text-center">
                            {hasFeature ? (
                              <CheckCircle2 size={20} className="text-orange-500 mx-auto" />
                            ) : (
                              <Minus size={20} className="text-slate-200 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Compare Plans CTA */}
        <div className="text-center mb-16 md:mb-32">
          <div className="max-w-2xl mx-auto bg-slate-50 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-slate-100">
            <Shield className="w-10 h-10 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Not sure which plan fits?</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Start with a free Business Triage. We'll recommend the right plan based on your business needs.</p>
            <Link href="/auth/signin" className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
              Start Free Triage <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Trust Points */}
        <div className="grid sm:grid-cols-3 gap-8 md:gap-12">
          {[
            { title: 'Built for real businesses', desc: 'Every tool is optimized for actual market performance and real-world growth.' },
            { title: 'Easy to upgrade anytime', desc: 'Scale your membership as your business grows. No lock-ins, just flexibility.' },
            { title: 'Designed to scale with you', desc: 'From startups to enterprises, our ecosystem scales alongside your success.' },
          ].map((item, i) => (
            <div key={i} className="text-center p-6 md:p-8">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-sm md:text-base text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
