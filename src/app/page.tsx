"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  CreditCard,
  Target,
  ChevronLeft,
  ChevronRight,
  Package
} from "lucide-react";
import ChatFAB from "@/components/ChatFAB";
import { useAuth } from "@/context/AuthContext";

interface HeroSlide {
  image: string;
  heading: React.ReactNode;
  body: string;
}

const SLIDES: HeroSlide[] = [
  {
    image: "/paperwork.webp",
    heading: <>Discover What's <span className="text-orange-400">Holding</span> Your Business <span className="text-orange-400">Back</span></>,
    body: "Identify hidden inefficiencies, missed revenue, and growth opportunities across your business."
  },
  {
    image: "/african-american-consultant-studying-constitutional-records.webp",
    heading: <>Turn <span className="text-orange-400">Waste</span> Into <span className="text-orange-400">Revenue</span></>,
    body: "Excess stock, idle capacity, untapped customers — we help you convert them into profit."
  },
  {
    image: "/professional-project-businesswoman-hands-work-executive.webp",
    heading: <>Know Your Business <span className="text-orange-400">Inside</span> Out</>,
    body: "Get a clear diagnosis of where your business stands and what needs to change."
  },
  {
    image: "/workplace-results-professional-report-accounting.webp",
    heading: <>A Plan Built <span className="text-orange-400">For You</span></>,
    body: "Tailored solutions matched to your sector, budget, and goals."
  },
];

function HeroSlider({ onStartReview }: { onStartReview: () => void }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative min-h-[600px] lg:min-h-[700px] overflow-hidden flex items-center">
      {/* Slider Background */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={slide.image} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />

      {/* Slider dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? "w-8 bg-orange-500" : "w-3 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Left arrow */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
      >
        <ChevronRight size={20} />
      </button>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full py-24 lg:py-0">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-orange-400 font-bold text-xs sm:text-sm mb-5 lg:mb-6">
            <BarChart3 size={14} />
            <span>Business Audit Platform</span>
          </div>
          {SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              className="transition-all duration-[1200ms] ease-in-out"
              style={{ opacity: i === current ? 1 : 0, display: i === current ? 'block' : 'none' }}
            >
              <h1 className="text-[2rem] sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 lg:mb-8">
                {slide.heading}
              </h1>
              <p className="text-base sm:text-xl text-slate-300 mb-8 lg:mb-10 leading-relaxed max-w-xl">
                {slide.body}
              </p>
            </div>
          ))}
          <p className="text-sm sm:text-base text-slate-400 mb-8 lg:mb-10 leading-relaxed max-w-xl">
            Start with a <strong className="text-orange-400">free Business Triage</strong> — takes 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onStartReview}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Get Started
              <ArrowRight size={18} />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer group text-center justify-center"
            >
              <span className="font-bold text-sm sm:text-base text-white">Learn More</span>
            </a>
          </div>
        </div>
      </div>

    </header>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleStartReview = () => {
    // Triage is now public
    router.push("/audit/welcome");
  };

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


      {/* Hero Section — Background Slider */}
      <HeroSlider onStartReview={handleStartReview} />

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 lg:mb-6">How The Audit Helps Your Business</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base lg:text-lg">
              Our Business Audit identifies key areas where your business can recover lost revenue, improve efficiency, and build a structured growth plan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: <Target className="text-orange-500" size={24} />, title: "Identify Hidden Profit", desc: "Discover revenue opportunities trapped in excess stock, unused capacity, and operational waste." },
              { icon: <Package className="text-orange-500" size={24} />, title: "Discover Excess Stock", desc: "Identify slow-moving inventory tying up cash and consuming storage space." },
              { icon: <Clock className="text-orange-500" size={24} />, title: "Identify Spare Capacity", desc: "Uncover unused staff time, equipment, and operational windows." },
              { icon: <CheckCircle2 className="text-orange-500" size={24} />, title: "Improve Customer Retention", desc: "Understand how to keep existing customers and increase lifetime value." },
              { icon: <BarChart3 className="text-orange-500" size={24} />, title: "Increase Visibility", desc: "Find marketing gaps and learn how new customers discover your business." },
              { icon: <Zap className="text-orange-500" size={24} />, title: "Improve Operational Efficiency", desc: "Streamline processes and reduce unnecessary costs affecting your margins." },
              { icon: <Layers className="text-orange-500" size={24} />, title: "Build a Growth Plan", desc: "Receive a prioritised roadmap with specific, actionable recommendations." }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10 lg:mt-14">
            <button
              onClick={handleStartReview}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-base lg:text-lg inline-flex items-center gap-2 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1"
            >
              Get Started
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Why Audit Matters */}
      <section id="why" className="py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 lg:mb-10 leading-tight">
                Why <span className="text-orange-500">Regular Audits</span> Are Essential for Growth
              </h2>
              <p className="text-base lg:text-lg text-slate-600 mb-8 lg:mb-12">
                Business operations are fluid. What was efficient last month may be leaking profit today. A structured audit ensures your business remains lean, competitive, and ready to grow.
              </p>

              <div className="grid gap-6 lg:gap-8">
                {[
                  {
                    icon: <Target className="text-orange-500" />,
                    title: "Find Hidden Profit",
                    desc: "Discover revenue trapped in excess stock, unused capacity, and operational waste."
                  },
                  {
                    icon: <TrendingUp className="text-orange-500" />,
                    title: "Reduce Unnecessary Costs",
                    desc: "Identify exactly where your money is going and what can be reclaimed."
                  },
                  {
                    icon: <Zap className="text-orange-500" />,
                    title: "Build a Structured Growth Plan",
                    desc: "Get a clear, prioritised roadmap with specific recommendations for your business."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 lg:gap-5">
                    <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-base lg:text-xl font-bold text-slate-900 mb-1 lg:mb-2">{item.title}</h4>
                      <p className="text-sm lg:text-base text-slate-600">{item.desc}</p>
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
              <div className="bg-slate-900 rounded-[2rem] lg:rounded-[3rem] overflow-hidden p-6 lg:p-12 flex flex-col justify-end text-white">
                <div className="mb-auto">
                  <div className="w-12 lg:w-16 h-1 bg-orange-500 mb-4 lg:mb-6" />
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed">
                    "This is not a survey. It is a business optimisation engine designed to reduce waste and increase margins."
                  </p>
                </div>
                <div className="flex items-center gap-3 lg:gap-4 mt-6 lg:mt-8">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-full flex items-center justify-center font-bold text-sm lg:text-base">SM</div>
                  <div>
                    <div className="font-bold text-sm lg:text-base">Strategy Metrics</div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-slate-400 font-medium tracking-widest uppercase">247GBS Platform</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* PHASE 8: Token, Access & Credibility Layer */}
      <section id="access" className="py-16 lg:py-24 bg-orange-50 relative overflow-hidden font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">

            {/* Trust & Methodology Card */}
            <motion.div
              {...fadeIn}
              className="lg:col-span-2 bg-slate-900 rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />
              <div className="flex items-center gap-3 text-orange-500 mb-6 lg:mb-8">
                <ShieldCheck size={24} />
                <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-slate-400">Data Integrity System</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 lg:mb-6 leading-tight">
                Why our reviews are <span className="text-orange-500 underline decoration-white/20 underline-offset-8">Authoritative</span>.
              </h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-8 lg:mb-10 text-sm lg:text-base">
                Our system isn't just a form. It's built on a proven business growth framework. We use verified industry data to ensure your growth plans are accurate and easy to implement.
              </p>

              <div className="space-y-5 lg:space-y-6">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-green-50" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Verified Benchmarks</h4>
                    <p className="text-xs text-slate-500">Cross-referenced against real-world sector performance data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Lifecycle Management</h4>
                    <p className="text-xs text-slate-500">Automatic reminders to refresh your review every 90 days for maximum efficiency.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tokenized Access Card */}
            <motion.div
              {...fadeIn}
              className="lg:col-span-3 bg-white rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-10 lg:p-12 border border-orange-100 shadow-xl relative"
            >
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 lg:mb-12">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Tokenized Access</h3>
                  <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Simple. Transparent. Scalable.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Balance</div>
                    <div className="text-base sm:text-lg font-bold text-slate-900">0 Tokens Available</div>
                  </div>
                </div>
              </header>

              <div className="grid sm:grid-cols-2 gap-6 lg:gap-10 mb-8 lg:mb-12">
                <div>
                  <h4 className="font-bold text-slate-900 mb-3 lg:mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="text-orange-500" />
                    Member Benefits
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5 lg:mb-6">
                    Membership level determines your token allocation. Gold and Platinum levels include **unlimited Business Reviews**.
                  </p>
                  <button className="text-orange-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                    Member Dashboard <ArrowRight size={12} />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-3 lg:mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-orange-500" />
                    One-Time Review
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5 lg:mb-6">
                    Not a member? Purchase a single review token for as little as £49 to identify your business growth potential.
                  </p>
                  <div className="flex gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-3 sm:h-4" alt="PayPal" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-3 sm:h-4" alt="Stripe" />
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeIn} className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Choose a Plan That <span className="text-orange-500">Fits Your Business</span>
            </h2>
            <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
              From free triage to enterprise-grade diagnostics — pick the level of support your business needs.
            </p>
            <Link
              href="/pricing"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-base lg:text-lg inline-flex items-center gap-2 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1"
            >
              View Pricing Plans
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 lg:py-24 bg-slate-900 text-white relative font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12 lg:mb-20">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-5 lg:mb-6">
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-orange-500 rounded-lg lg:rounded-xl flex items-center justify-center font-bold text-base lg:text-xl text-white">A</div>
                <span className="font-bold text-xl lg:text-2xl tracking-tighter uppercase">247GBS</span>
              </div>
              <p className="text-slate-400 max-w-sm font-medium leading-relaxed text-sm lg:text-base">
                Transforming global business waste into measurable growth through structured redistribution. Simple. Transparent. Scalable.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-5 lg:mb-8">Platform</h5>
              <div className="flex flex-col gap-3 lg:gap-4 font-bold text-sm lg:text-base text-slate-300">
                <a href="#" className="hover:text-orange-500 transition-colors">How it Works</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Expert Directory</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Review Tokens</a>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-5 lg:mb-8">Support</h5>
              <div className="flex flex-col gap-3 lg:gap-4 font-bold text-sm lg:text-base text-slate-300">
                <a href="#" className="hover:text-orange-500 transition-colors">Help Center</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Book a Partner</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="pt-8 lg:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <p>© 2026 247 Global Business Solutions Ltd. Business Growth Platform.</p>
            <div className="flex gap-6 sm:gap-10">
              <a href="#" className="hover:text-white transition-all">Privacy</a>
              <a href="#" className="hover:text-white transition-all">Terms of Access</a>
            </div>
          </div>
        </div>
      </footer>
      <ChatFAB />
    </div>
  );
}
