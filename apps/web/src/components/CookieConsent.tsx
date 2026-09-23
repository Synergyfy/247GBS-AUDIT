"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { hasConsent, setConsent } from "@/lib/cookies";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsent()) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setConsent();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />

            <div className="p-6 sm:p-8">
              {/* Icon */}
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mb-5">
                <ShieldCheck size={28} />
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                We Value Your Privacy
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                We use cookies to <strong className="text-slate-700">save your progress</strong> as you move through the assessment. This means if your phone dies, you close the browser, or you need to step away — your answers are safe and you can pick up right where you left off.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-bold">1</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-900">Save your stage</strong> — We remember where you stopped so you can continue later.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-bold">2</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-900">No tracking</strong> — We don&apos;t use cookies for advertising or share your data with third parties.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-bold">3</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-900">Essential only</strong> — Cookies are used strictly for the platform to function properly.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAccept}
                  className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200 active:scale-95"
                >
                  Accept & Continue
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                >
                  Accept All
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center mt-4">
                By accepting, you agree to our{" "}
                <a href="#" className="underline hover:text-orange-500 transition-colors">
                  Terms of Access
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-orange-500 transition-colors">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
