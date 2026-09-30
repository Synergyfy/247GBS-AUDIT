"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Sparkles,
} from "lucide-react";
import { sendPreAuditOtp, verifyPreAuditOtp } from "@/services/preAudit/otp";

interface TriageEmailOtpStepProps {
  userEmail?: string | null;
  isAuthenticated: boolean;
  onVerified: (email: string) => Promise<void> | void;
  onBack: () => void;
  title?: string;
  subtitle?: string;
}

export function TriageEmailOtpStep({
  userEmail,
  isAuthenticated,
  onVerified,
  onBack,
  title = "Receive Your Pre-Audit Results",
  subtitle = "Verify your email to get your pre-audit summary, answers, and tailored roadmap sent directly to your inbox.",
}: TriageEmailOtpStepProps) {
  // If user is authenticated, we default to their email
  const [email, setEmail] = useState<string>(userEmail || "");
  const [step, setStep] = useState<"input-email" | "input-otp">(
    isAuthenticated && userEmail ? "input-email" : "input-email"
  );
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Focus first OTP input when step changes to input-otp
  useEffect(() => {
    if (step === "input-otp") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle Authenticated user 1-click continuation
  const handleAuthenticatedSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      await onVerified(email);
    } catch (err: any) {
      setError(err?.message || "Failed to finalize pre-audit. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await sendPreAuditOtp(trimmed);
      setSuccessMessage(res.message || "Verification code sent! Please check your inbox.");
      setStep("input-otp");
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (error) setError(null);
    // Allow only single numeric digit
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 1) {
      // User pasted full code
      handleOtpPaste(cleaned);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleaned && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle keyboard navigation for OTP inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Paste
  const handleOtpPaste = (pasted: string) => {
    const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length === 0) return;
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      if (idx < 6) newOtp[idx] = digit;
    });
    setOtp(newOtp);
    const nextIdx = Math.min(digits.length, 5);
    otpInputsRef.current[nextIdx]?.focus();
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await verifyPreAuditOtp(email, code);
      setSuccessMessage("Email verified! Finalizing your results...");
      // Complete flow
      await onVerified(email);
    } catch (err: any) {
      setError(err?.message || "Invalid verification code. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 relative z-10 overflow-hidden">
      <div className="p-6 sm:p-10 lg:p-14">
        {/* Stage Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
            <Mail size={16} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Email &amp; Results Delivery
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight">
          {title}
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* Authenticated Mode: No OTP required */}
        {isAuthenticated && userEmail ? (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Logged-in Account
                  </span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 truncate mt-0.5">
                  {userEmail}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Because you are already logged in, no OTP is needed. We will send your answers and personalized audit summary directly to this email.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all disabled:opacity-50"
              >
                <ChevronLeft size={14} />
                Back to questions
              </button>

              <button
                type="button"
                onClick={handleAuthenticatedSubmit}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Finalizing &amp; Sending...
                  </>
                ) : (
                  <>
                    Send Results &amp; Complete
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated Mode: Requires Email + OTP */
          <div className="space-y-6">
            {step === "input-email" ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="triage-email-input"
                    className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2"
                  >
                    Your Email Address <span className="text-orange-500">*</span>
                  </label>
                  <input
                    id="triage-email-input"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    disabled={isLoading}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="name@company.com"
                    className="w-full rounded-2xl border-2 border-slate-200 px-4 sm:px-5 py-4 text-base sm:text-lg font-semibold text-slate-900 outline-none transition-all focus:border-orange-400 focus:bg-orange-50/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendOtp();
                      }
                    }}
                  />
                  <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-green-500" />
                    We protect your privacy. A 6-digit code will be sent to verify your address before results are sent.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    <ChevronLeft size={14} />
                    Back to questions
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading || !email.trim()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* OTP Verification Step */
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white shrink-0">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Code Sent To
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 truncate block">
                        {email}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("input-email");
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-sm transition-all"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center sm:text-left">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex justify-between sm:justify-start gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={isLoading}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 sm:w-14 h-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border-2 outline-none transition-all ${
                          digit
                            ? "border-orange-500 bg-orange-50/30 text-orange-950"
                            : "border-slate-200 bg-white focus:border-orange-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && !error && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Didn&apos;t receive the code?</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading || cooldown > 0}
                    className="font-bold text-orange-600 hover:text-orange-700 disabled:opacity-50 disabled:hover:text-slate-400 flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("input-email");
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    <ChevronLeft size={14} />
                    Change email
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.join("").length !== 6}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Verifying &amp; Delivering...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Verify &amp; Get My Results
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
