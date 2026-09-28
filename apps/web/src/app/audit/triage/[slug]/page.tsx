"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ClipboardX, Loader2 } from "lucide-react";
import { fetchTriageForm } from "@/services/triage/flow";
import type { PublicTriageForm } from "@/services/triage/types";
import { QuestionEngine } from "@/components/preAudit/QuestionEngine";

type PageState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "closed" }
  | { kind: "ready"; form: PublicTriageForm };

export default function PublishedTriagePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [state, setState] = useState<PageState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchTriageForm(slug)
      .then((form) => {
        if (cancelled) return;
        if (form.settings?.acceptResponses === false) {
          setState({ kind: "closed" });
          return;
        }
        setState({ kind: "ready", form });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          kind: "error",
          message:
            err instanceof Error && err.message
              ? err.message
              : "This page couldn't be loaded. Please try again later.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.kind === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="text-orange-500 animate-spin" aria-label="Loading" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Loading
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed" aria-live="polite">
            Please wait while we prepare your business triage.
          </p>
        </motion.div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4" role="alert">
            This business triage isn&apos;t available
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            {state.message}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (state.kind === "closed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ClipboardX size={32} className="text-slate-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            We&apos;re not accepting responses right now
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            This business triage is temporarily closed. Please check back soon or
            contact our team for support.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <QuestionEngine
      title={state.form.title}
      settings={state.form.settings}
      startOverride={state.form.startQuestion}
      exitHref="/audit/triage"
    />
  );
}