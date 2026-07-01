"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 px-6 sm:px-10 py-8 sm:py-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Welcome, {firstName}
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
              Your business profile has already been created through MCOM Central.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-10 py-8 sm:py-10">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                The Next Step: Free Business Triage
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                This short assessment helps us understand your business and determine which audit is most appropriate for you.
              </p>
            </div>

            {/* Time estimate */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <Clock size={16} className="text-orange-500" />
              <span className="text-sm font-bold text-slate-700">
                Estimated completion time: <span className="text-orange-600">Approximately 5 minutes</span>
              </span>
            </div>

            {/* Info box */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 sm:p-6 mb-8">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-orange-500" />
                The Business Triage:
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Is free",
                  "Is not the full audit",
                  "Does not require preparation",
                  "Helps determine the appropriate audit",
                  "Forms the starting point for your business assessment"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push("/audit/triage")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Start Free Business Triage
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
