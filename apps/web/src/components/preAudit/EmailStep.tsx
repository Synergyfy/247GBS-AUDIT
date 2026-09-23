import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Mail } from "lucide-react";

interface EmailStepProps {
  email: string;
  error: string | null;
  disabled: boolean;
  onEmailChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

/** /** Email is collected near the end so results can be associated with the user. */
export function EmailStep({ email, error, disabled, onEmailChange, onContinue, onBack }: EmailStepProps) {
  const inputId = "pre-audit-email";

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 relative z-10 overflow-hidden">
      <div className="p-6 sm:p-10 lg:p-14">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
            <Mail size={16} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Nearly there — your results
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 leading-tight">
          Which email should we link to your results?
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8">
          We simply record this address with your saved results. No email is sent at this step, and
          you can still continue without creating an account.
        </p>

        <label htmlFor={inputId} className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Email address <span className="text-orange-500">*</span>
        </label>
        <input
          id={inputId}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          disabled={disabled}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="name@company.com"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "pre-audit-email-error" : undefined}
          className={`w-full rounded-2xl border-2 px-4 sm:px-5 py-4 text-base sm:text-lg font-semibold text-slate-900 outline-none transition-all ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-400"
              : "border-slate-200 bg-white focus:border-orange-400 input-glow"
          }`}
        />
        {error ? (
          <p id="pre-audit-email-error" role="alert" className="mt-2 text-sm font-semibold text-red-500">
            {error}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-400">
            We’ll never share your email. You can change it before you submit.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={disabled}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <ChevronLeft size={14} />
            Back to review
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
          >
            Continue to consent
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}