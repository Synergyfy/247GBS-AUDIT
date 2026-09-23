import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronLeft, ShieldCheck } from "lucide-react";

interface ConsentStepProps {
  consentGranted: boolean;
  disabled: boolean;
  onConsentChange: (granted: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const CONSENT_BULLETS = [
  "Your answers are stored so we can match them to your results.",
  "Your email is only used to associate the audit with you — never shared.",
  "You can repeat the pre-audit anytime; no account is required to start.",
];

/** Explicit consent gate placed between email and submission. */
export function ConsentStep({ consentGranted, disabled, onConsentChange, onBack, onSubmit }: ConsentStepProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 relative z-10 overflow-hidden">
      <div className="p-6 sm:p-10 lg:p-14">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
            <ShieldCheck size={16} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            One last thing — your permission
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 leading-tight">
          Do you agree to us processing this pre-audit?
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6">
          To give you an accurate recommendation we store the answers you entered and the email you
          provided. You won&apos;t be contacted unless you choose to continue to a full audit.
        </p>

        <ul className="space-y-2.5 mb-6">
          {CONSENT_BULLETS.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <span className="text-sm text-slate-700 font-medium">{item}</span>
            </li>
          ))}
        </ul>

        <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 cursor-pointer select-none hover:border-orange-300 transition-all">
          <input
            type="checkbox"
            checked={consentGranted}
            disabled={disabled}
            onChange={(event) => onConsentChange(event.target.checked)}
            className="mt-1 w-5 h-5 rounded accent-orange-500"
          />
          <span className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
            I understand and agree to my answers and results email being stored to provide this pre-audit.
          </span>
        </label>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={onBack}
            disabled={disabled}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <ChevronLeft size={14} />
            Change email
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={disabled || !consentGranted}
            onClick={onSubmit}
            className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            Submit My Pre-Audit
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}