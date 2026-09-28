"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { QuestionEngine } from "@/components/preAudit/QuestionEngine";
import { useAdminTriageQuestions, formApi } from "@/services/triage/hooks";
import { hydrateCache, resetCache } from "@/services/preAudit/data";
import { clearProgress } from "@/lib/preAudit/storage";
import type { TriageForm, TriagePublicQuestion } from "@/services/triage/types";

/**
 * Full-page preview of the saved triage, rendered exactly as a visitor would
 * experience it (reusing the public QuestionEngine). Read-only — no builder
 * controls are rendered. The engine's question cache is hydrated from the
 * admin API so the flow works even while the form is unpublished.
 */
export default function TriagePreviewPage() {
  const { data, loading, error, refresh } = useAdminTriageQuestions();
  const [form, setForm] = useState<TriageForm | null>(null);

  useEffect(() => {
    formApi
      .getForm()
      .then(setForm)
      .catch(() => setForm(null));
  }, []);

  // Prepare the resolved question set before the engine's own effects run so
  // the full flow works without depending on the published form endpoint.
  const prepared = useMemo(() => {
    if (!data) return false;
    resetCache();
    clearProgress();
    hydrateCache(data as unknown as TriagePublicQuestion[]);
    return true;
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-400">
        <Loader2 size={22} className="animate-spin" aria-label="Loading" />
        <span className="text-sm font-semibold">Loading preview…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="text-sm font-bold text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-black transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!prepared) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-400">
        <Loader2 size={22} className="animate-spin" aria-label="Preparing" />
        <span className="text-sm font-semibold">Preparing preview…</span>
      </div>
    );
  }

  const ordered = [...data].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt.localeCompare(b.createdAt)
  );
  const start = ordered.find((q) => q.isActive) ?? ordered[0] ?? null;

  return (
    <QuestionEngine
      title={form?.title ?? "Business Triage"}
      settings={form?.settings}
      startOverride={start as TriagePublicQuestion | null}
      exitHref="/admin/triage"
    />
  );
}