"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  X,
  Zap,
  ShieldCheck,
  Crown,
  Star,
  ArrowRight,
} from "lucide-react";

const plans = [
  {
    name: "Bronze",
    price: "Free",
    period: "forever",
    description: "Get started with a basic business health check.",
    icon: <Zap size={24} />,
    color: "slate",
    popular: false,
    features: [
      { text: "2 Business Assessments", included: true },
      { text: "Quick Review Only", included: true },
      { text: "Basic Health Score", included: true },
      { text: "Email Results", included: true },
      { text: "Sector-Specific Audit", included: false },
      { text: "AI-Powered Insights", included: false },
      { text: "Growth Roadmap", included: false },
      { text: "Priority Support", included: false },
      { text: "Account Manager", included: false },
    ],
    cta: "Get Started Free",
    href: "/auth/signup",
  },
  {
    name: "Silver",
    price: "£49",
    period: "one-time",
    description: "A full audit with actionable recommendations.",
    icon: <Star size={24} />,
    color: "slate",
    popular: false,
    features: [
      { text: "4 Business Assessments", included: true },
      { text: "Quick & Strategic Reviews", included: true },
      { text: "Full Health Dashboard", included: true },
      { text: "Email & PDF Results", included: true },
      { text: "Sector-Specific Audit", included: true },
      { text: "AI-Powered Insights", included: true },
      { text: "Growth Roadmap", included: false },
      { text: "Priority Support", included: false },
      { text: "Account Manager", included: false },
    ],
    cta: "Choose Silver",
    href: "/auth/signup?plan=silver",
  },
  {
    name: "Gold",
    price: "£149",
    period: "per quarter",
    description: "Ongoing monitoring with expert guidance.",
    icon: <ShieldCheck size={24} />,
    color: "orange",
    popular: true,
    features: [
      { text: "Unlimited Assessments", included: true },
      { text: "Quick & Strategic Reviews", included: true },
      { text: "Full Health Dashboard", included: true },
      { text: "Email & PDF Results", included: true },
      { text: "Sector-Specific Audit", included: true },
      { text: "AI-Powered Insights", included: true },
      { text: "Growth Roadmap", included: true },
      { text: "Priority Support", included: true },
      { text: "Account Manager", included: false },
    ],
    cta: "Choose Gold",
    href: "/auth/signup?plan=gold",
  },
  {
    name: "Platinum",
    price: "£399",
    period: "per quarter",
    description: "Full consultancy with dedicated account management.",
    icon: <Crown size={24} />,
    color: "orange",
    popular: false,
    features: [
      { text: "Unlimited Assessments", included: true },
      { text: "Quick & Strategic Reviews", included: true },
      { text: "Full Health Dashboard", included: true },
      { text: "Email & PDF Results", included: true },
      { text: "Sector-Specific Audit", included: true },
      { text: "AI-Powered Insights", included: true },
      { text: "Growth Roadmap", included: true },
      { text: "Priority Support", included: true },
      { text: "Dedicated Account Manager", included: true },
    ],
    cta: "Choose Platinum",
    href: "/auth/signup?plan=platinum",
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* Header */}
      <section className="pt-28 pb-12 lg:pt-36 lg:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full text-orange-600 font-bold text-xs sm:text-sm mb-5 lg:mb-6"
          >
            <span>Simple, Transparent Pricing</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6"
          >
            Choose Your <span className="text-orange-500">Growth Plan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base lg:text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Start free and upgrade as your business grows. Every plan includes access to our business diagnostic platform.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 lg:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                {...fadeIn}
                transition={{ delay: 0.1 + i * 0.1 }}
                className={`relative rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 border-2 transition-all duration-300 flex flex-col ${
                  plan.popular
                    ? "bg-slate-900 text-white border-orange-500 shadow-2xl shadow-orange-200 scale-[1.02] lg:scale-105 z-10"
                    : "bg-white text-slate-900 border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div className="mb-6 lg:mb-8">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      plan.popular
                        ? "bg-orange-500 text-white"
                        : plan.color === "orange"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p
                    className={`text-sm ${
                      plan.popular ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6 lg:mb-8">
                  <span className="text-4xl lg:text-5xl font-bold">
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ml-1 ${
                      plan.popular ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    / {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 lg:mb-10 flex-1">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle2
                          size={16}
                          className={`mt-0.5 shrink-0 ${
                            plan.popular ? "text-orange-500" : "text-orange-500"
                          }`}
                        />
                      ) : (
                        <X
                          size={16}
                          className={`mt-0.5 shrink-0 ${
                            plan.popular
                              ? "text-slate-600"
                              : "text-slate-300"
                          }`}
                        />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? ""
                            : plan.popular
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all ${
                    plan.popular
                      ? "bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-950/20"
                      : plan.color === "orange"
                      ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 lg:py-24 bg-slate-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Compare Plans in Detail
            </h2>
            <p className="text-slate-500 text-sm lg:text-base">
              See exactly what you get with each plan.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-5 px-8 text-sm font-bold text-slate-500 uppercase tracking-widest w-1/3">
                      Feature
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.name}
                        className={`py-5 px-6 text-center text-sm font-bold ${
                          plan.popular ? "text-orange-600 bg-orange-50/50" : "text-slate-900"
                        }`}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plans[0].features.map((_, fi) => (
                    <tr
                      key={fi}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="py-4 px-8 text-sm font-medium text-slate-700">
                        {plans[0].features[fi].text}
                      </td>
                      {plans.map((plan) => (
                        <td
                          key={plan.name}
                          className={`py-4 px-6 text-center ${
                            plan.popular ? "bg-orange-50/50" : ""
                          }`}
                        >
                          {plan.features[fi].included ? (
                            <CheckCircle2
                              size={18}
                              className="text-orange-500 mx-auto"
                            />
                          ) : (
                            <X
                              size={18}
                              className="text-slate-300 mx-auto"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Price Row */}
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td className="py-5 px-8 text-sm font-bold text-slate-900 uppercase tracking-widest">
                      Price
                    </td>
                    {plans.map((plan) => (
                      <td
                        key={plan.name}
                        className={`py-5 px-6 text-center ${
                          plan.popular ? "bg-orange-50/50" : ""
                        }`}
                      >
                        <span className="text-lg font-bold text-slate-900">
                          {plan.price}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          / {plan.period}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Comparison */}
            <div className="lg:hidden divide-y divide-slate-100">
              {plans[0].features.map((_, fi) => (
                <div key={fi} className="p-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    {plans[0].features[fi].text}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {plans.map((plan) => (
                      <div
                        key={plan.name}
                        className={`text-center py-2 rounded-lg ${
                          plan.popular ? "bg-orange-50" : "bg-slate-50"
                        }`}
                      >
                        <div className="text-[10px] font-bold text-slate-400 mb-1">
                          {plan.name.slice(0, 3)}
                        </div>
                        {plan.features[fi].included ? (
                          <CheckCircle2
                            size={14}
                            className="text-orange-500 mx-auto"
                          />
                        ) : (
                          <X size={14} className="text-slate-300 mx-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Mobile Price Row */}
              <div className="p-4 bg-slate-50">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Price
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`text-center py-2 rounded-lg ${
                        plan.popular ? "bg-orange-50" : "bg-white"
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-400 mb-1">
                        {plan.name.slice(0, 3)}
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {plan.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / CTA */}
      <section className="py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">
            Not Sure Which Plan?
          </h2>
          <p className="text-slate-500 text-sm lg:text-base mb-8 lg:mb-10 max-w-xl mx-auto">
            Start with our free Bronze plan. You can upgrade at any time when you&apos;re ready for deeper insights and expert support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-orange-200 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Start Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/"
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold text-base transition-all text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 lg:py-24 bg-slate-900 text-white relative font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12 lg:mb-20">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-5 lg:mb-6">
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-orange-500 rounded-lg lg:rounded-xl flex items-center justify-center font-bold text-base lg:text-xl text-white">
                  A
                </div>
                <span className="font-bold text-xl lg:text-2xl tracking-tighter uppercase">
                  247GBS
                </span>
              </div>
              <p className="text-slate-400 max-w-sm font-medium leading-relaxed text-sm lg:text-base">
                Transforming global business waste into measurable growth
                through structured redistribution. Simple. Transparent.
                Scalable.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-5 lg:mb-8">
                Platform
              </h5>
              <div className="flex flex-col gap-3 lg:gap-4 font-bold text-sm lg:text-base text-slate-300">
                <a href="/#comparison" className="hover:text-orange-500 transition-colors">
                  How it Works
                </a>
                <a href="/pricing" className="hover:text-orange-500 transition-colors">
                  Pricing
                </a>
                <a href="/#why" className="hover:text-orange-500 transition-colors">
                  Why Seasonal?
                </a>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-5 lg:mb-8">
                Support
              </h5>
              <div className="flex flex-col gap-3 lg:gap-4 font-bold text-sm lg:text-base text-slate-300">
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Help Center
                </a>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Book a Partner
                </a>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 lg:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <p>&copy; 2026 247 Global Business Solutions Ltd. Business Growth Platform.</p>
            <div className="flex gap-6 sm:gap-10">
              <a href="#" className="hover:text-white transition-all">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-all">
                Terms of Access
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
