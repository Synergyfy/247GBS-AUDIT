"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Clock,
  Zap,
  ShieldCheck,
  TrendingUp,
  Layers,
  PlayCircle,
  CreditCard,
  Target
} from "lucide-react";
import ChatFAB from "@/components/ChatFAB";

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      {/* Navigation */}


      {/* Hero Section */}
      <header className="relative pt-24 pb-20 overflow-hidden lg:pt-36 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full text-orange-600 font-bold text-sm mb-6">
                <BarChart3 size={16} />
                <span>Next-Gen Business Optimization</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
                Turn Idle <span className="text-orange-500">Resources</span> Into <span className="text-orange-500">Revenue</span>.
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                Identify, measure, and monetise unused staff time, underutilised equipment, and excess inventory with our structured business audits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signin"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-orange-200 transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  Start Your Audit
                  <ArrowRight size={20} />
                </Link>
                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <PlayCircle className="text-orange-500" size={24} />
                  </div>
                  <span className="font-bold text-slate-700">Watch the Explainer</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 bg-white p-4 rounded-[2rem] shadow-2xl shadow-orange-100 border border-orange-50">
                <img
                  src="/audit_hero_abstract.png"
                  alt="Business Growth Visualization"
                  className="rounded-[1.5rem] w-full"
                />

                {/* Floating Stats Card */}
                <motion.div
                  initial={{ x: 20, y: 20 }}
                  animate={{ x: 0, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-500">Potential Recovery</div>
                    <div className="text-2xl font-black text-slate-900">£12,450 /mo</div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-100/30 rounded-full blur-3xl -z-10 animate-pulse" />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Audit Comparison Panel */}
      <section id="comparison" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Strategic Audit Options</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Choose the depth that matches your operational complexity. Whether you need a quick pulse-check or a deep forensic analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {/* Short Form Audit */}
            <motion.div
              {...fadeIn}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Short Form Audit</h3>
              <p className="text-slate-500 text-lg mb-8 italic">"A quick health check of your unused business capacity."</p>

              <ul className="space-y-4 mb-10">
                {[
                  "Fast, self-service assessment",
                  "No consultant guidance required",
                  "8-12 Essential questions",
                  "Instant automated results",
                  "Ideal for simple business models"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-orange-500 mt-1 shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signin"
                className="w-full py-4 rounded-xl border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-500 hover:text-white transition-all text-center flex items-center justify-center gap-2"
              >
                Select Short Form
              </Link>
            </motion.div>

            {/* Long Form Audit */}
            <motion.div
              {...fadeIn}
              className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group"
            >
              {/* Highlight badge */}
              <div className="absolute top-8 right-8 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Recommended for growth
              </div>

              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500 mb-8 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                <Layers size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Long Form Audit</h3>
              <p className="text-slate-400 text-lg mb-8 italic">"A full operational audit designed to unlock hidden revenue."</p>

              <ul className="space-y-4 mb-10">
                {[
                  "Deep, guided business analysis",
                  "Sector- and niche-specific logic",
                  "Optional AI assistant or consultant support",
                  "Scenario modelling & forecasting",
                  "Strategic growth optimization plans"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-orange-500 mt-1 shrink-0" />
                    <span className="text-slate-200 font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signin"
                className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all text-center flex items-center justify-center gap-2 shadow-xl shadow-orange-950/20"
              >
                Select Long Form
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 opacity-50" />
      </section>

      {/* Why Quarterly Audits Matter */}
      <section id="why" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-4xl lg:text-5xl font-bold mb-10 leading-tight">
                Why <span className="text-orange-500">Quarterly Audits</span> are Essential for Survival
              </h2>
              <p className="text-lg text-slate-600 mb-12">
                Business operations are fluid. What was efficient last month may be leaking profit today. Consistent auditing ensures your business remains lean and responsive to market shifts.
              </p>

              <div className="grid gap-8">
                {[
                  {
                    icon: <Target className="text-orange-500" />,
                    title: "Identify Profit Leakage",
                    desc: "Spot where money is slipping through the cracks in real-time."
                  },
                  {
                    icon: <Clock className="text-orange-500" />,
                    title: "Adjust for Seasonality",
                    desc: "Adapt resource usage based on seasonal demand fluctuations."
                  },
                  {
                    icon: <TrendingUp className="text-orange-500" />,
                    title: "Improve Cash Flow",
                    desc: "Turn excess stock into working capital precisely when needed."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-slate-900 rounded-[3rem] overflow-hidden p-12 flex flex-col justify-end text-white">
                <div className="mb-auto">
                  <div className="w-16 h-1 bg-orange-500 mb-6" />
                  <p className="text-3xl font-bold leading-relaxed">
                    "This is not a survey. It is a business optimization engine designed to reduce waste and increase margins."
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center font-bold">SM</div>
                  <div>
                    <div className="font-bold">Strategy Metrics</div>
                    <div className="text-sm text-slate-400 font-medium tracking-widest uppercase">247GBS Ecosystem</div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* PHASE 8: Token, Access & Credibility Layer */}
      <section id="access" className="py-24 bg-orange-50 relative overflow-hidden font-sans">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-5 gap-8 items-stretch">

            {/* Trust & Methodology Card */}
            <motion.div
              {...fadeIn}
              className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />
              <div className="flex items-center gap-3 text-orange-500 mb-8">
                <ShieldCheck size={28} />
                <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Data Integrity Protocol</span>
              </div>
              <h3 className="text-3xl font-black mb-6 leading-tight">
                Why our Audits are <span className="text-orange-500 underline decoration-white/20 underline-offset-8">Authoritative</span>.
              </h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-10">
                Our system isn't just a form. It's built on the <span className="text-white">247GBS Ecological Redistribution Framework</span>. We use verified sector benchmarks to ensure your recovery projections are commercially accurate and IMPLEMENTABLE.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Verified Benchmarks</h4>
                    <p className="text-xs text-slate-500">Cross-referenced against real-world sector performance data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Quarterly Lifecycle</h4>
                    <p className="text-xs text-slate-500">Automatic reminders to refresh your audit every 90 days for maximum efficiency.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tokenized Access Card */}
            <motion.div
              {...fadeIn}
              className="lg:col-span-3 bg-white rounded-[3rem] p-10 md:p-12 border border-orange-100 shadow-xl relative"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h3 className="text-3xl font-black text-slate-900">Tokenized Access</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Simple. Transparent. Scalable.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your VAULT</div>
                    <div className="text-lg font-black text-slate-900">0 Tokens Available</div>
                  </div>
                </div>
              </header>

              <div className="grid md:grid-cols-2 gap-10 mb-12">
                <div>
                  <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-orange-500" />
                    Directory Members
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Membership level determines your quarterly token allocation. Gold and Platinum levels include **unlimited Forensic Audits**.
                  </p>
                  <button className="text-orange-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                    Member Dashboard <ArrowRight size={14} />
                  </button>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-orange-500" />
                    Single Pass
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    Not a member? Purchase a single audit token for as little as £49 to identify your business leakage.
                  </p>
                  <div className="flex gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4" alt="Stripe" />
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">Seasonal Promo</div>
                  <div className="text-lg font-black text-slate-900">New Members get 2 Free Tokens</div>
                </div>
                <Link
                  href="/pricing"
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-200"
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-slate-900 text-white relative font-sans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-xl text-white">A</div>
                <span className="font-black text-2xl tracking-tighter">247GBS AUDIT</span>
              </div>
              <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
                Transforming global business waste into measurable growth through structured ecological redistribution. Authoritative. Transparent. Scalable.
              </p>
            </div>
            <div>
              <h5 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-8">Platform</h5>
              <div className="flex flex-col gap-4 font-bold text-slate-300">
                <a href="#" className="hover:text-orange-500 transition-colors">Audit Methodology</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Sector Specialist</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Vault Tokens</a>
              </div>
            </div>
            <div>
              <h5 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-8">Authoritative Support</h5>
              <div className="flex flex-col gap-4 font-bold text-slate-300">
                <a href="#" className="hover:text-orange-500 transition-colors">Help Centre</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Specialist Booking</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Compliance</a>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <p>© 2026 247 Global Business Solutions Ltd. All rights reserved.</p>
            <div className="flex gap-10">
              <a href="#" className="hover:text-white transition-all">Privacy Framework</a>
              <a href="#" className="hover:text-white transition-all">Terms of Access</a>
            </div>
          </div>
        </div>
      </footer>
      <ChatFAB />
    </div>
  );
}
