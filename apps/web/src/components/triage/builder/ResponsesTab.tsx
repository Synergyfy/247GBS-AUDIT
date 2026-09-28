"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Inbox, Mail, X } from "lucide-react";
import { responsesApi } from "@/services/triage/hooks";
import type {
  TriageResponseDetail,
  TriageResponsesOverview,
  TriageResponseSummary,
} from "@/services/triage/types";
import { DESTINATION_LABELS } from "@/services/triage/types";
import { destLabel } from "./shared";
import { EmptyState, Spinner } from "./ui";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? "border-orange-200 bg-orange-50" : "border-slate-100 bg-white"
      }`}
    >
      <div className={`text-2xl font-bold ${accent ? "text-orange-600" : "text-slate-900"}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </div>
    </div>
  );
}

function Breakdown({
  data,
  labels,
}: {
  data: Record<string, number>;
  labels: Record<string, string> | null;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400 font-medium">No data yet.</p>;
  }
  const max = Math.max(...entries.map(([, count]) => count), 1);
  return (
    <div className="space-y-2">
      {entries.map(([key, count]) => {
        const label = labels?.[key] ?? key.replace(/_/g, " ");
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
              <span className="capitalize">{label}</span>
              <span>{count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function ResponseDetailView({
  detail,
  onClose,
}: {
  detail: TriageResponseDetail;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 p-2 sm:p-6">
      <div className="h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl custom-scrollbar">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Response detail</h3>
            <p className="text-xs text-slate-400 font-medium">{formatDate(detail.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close response detail"
            className="rounded-lg p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email</div>
              <div className="text-sm font-bold text-slate-800">
                {detail.email ?? "Not collected"}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Recommended next step
              </div>
              <div className="text-sm font-bold text-orange-600">
                {detail.destinationType
                  ? destLabel(detail.destinationType)
                  : detail.recommendedAuditType
                    ? destLabel(detail.recommendedAuditType)
                    : "None"}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              Steps taken ({detail.steps.length})
            </h4>
            <ol className="space-y-3">
              {detail.steps.map((step, index) => (
                <li
                  key={`${step.questionId}-${index}`}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">{step.questionText}</p>
                      <p className="mt-1 text-sm font-semibold text-orange-600">
                        {step.answerTexts.length > 0
                          ? step.answerTexts.join(", ")
                          : step.value !== null && step.value !== undefined
                            ? String(step.value)
                            : "—"}
                      </p>
                      {(step.destinationType || step.auditType) && (
                        <p className="mt-1.5 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                          → {destLabel(step.destinationType ?? step.auditType)}
                          {step.destinationTarget ? ` · ${step.destinationTarget}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {detail.consentGrantedAt && (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">
              <Mail size={14} className="text-slate-400" />
              Consent recorded · consent version {detail.consentVersion} ·{" "}
              {formatDate(detail.consentGrantedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResponsesTab() {
  const [overview, setOverview] = useState<TriageResponsesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TriageResponseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchList = useCallback(async () => responsesApi.list(), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await fetchList());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load responses.");
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  useEffect(() => {
    fetchList()
      .then((data) => {
        setOverview(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load responses.");
      })
      .finally(() => setLoading(false));
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchList, load]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    responsesApi
      .get(selectedId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (loading) return <Spinner label="Loading responses…" />;

  if (error) {
    return (
      <EmptyState
        title="Couldn't load responses"
        description={error}
        action={
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
          >
            Try again
          </button>
        }
      />
    );
  }

  if (!overview) return null;

  if (overview.total === 0) {
    return (
      <EmptyState
        title="No responses yet"
        description="Submissions from the public form appear here, with the questions answered and the routing that concluded for each one."
        action={
          <span className="inline-flex items-center gap-2 text-sm text-slate-400 font-semibold">
            <Inbox size={16} /> Publish and share your form to start collecting
          </span>
        }
      />
    );
  }

  return (
    <div>
      {detail && <ResponseDetailView detail={detail} onClose={() => setDetail(null)} />}

      {(detailLoading || (selectedId !== null && detail?.id !== selectedId)) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/20">
          <Spinner label="Loading response…" />
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total responses" value={overview.total} accent />
          <StatCard label="With email" value={overview.withEmail} />
          <StatCard label="Submitted today" value={overview.submittedToday} />
          <StatCard label="Unique emails" value={overview.uniqueEmails} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              By destination
            </h3>
            <Breakdown data={overview.byDestination} labels={{ ...DESTINATION_LABELS, NONE: "No destination" }} />
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              By audit type
            </h3>
            <Breakdown data={overview.byAuditType} labels={null} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
            Recent responses
          </h3>
          <p className="mb-4 text-xs text-slate-400 font-medium">
            Click a response to see the full journey.
          </p>
          <div className="divide-y divide-slate-50">
            {overview.recent.map((response: TriageResponseSummary) => (
              <button
                key={response.id}
                type="button"
                onClick={() => {
                  setSelectedId(response.id);
                  setDetail(null);
                }}
                className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-slate-50 rounded-xl px-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-900">
                    {response.email ?? "Anonymous response"}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {formatDate(response.completedAt ?? response.createdAt)}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-orange-600">
                    {destLabel(response.destinationType)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    {response.answeredCount} steps
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {overview.recent.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <AlertCircle size={14} /> No individual responses yet.
          </p>
        )}
      </div>
    </div>
  );
}