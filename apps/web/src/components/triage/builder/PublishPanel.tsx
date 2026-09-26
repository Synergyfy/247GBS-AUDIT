"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  ExternalLink,
  Globe,
  Loader2,
  Send,
} from "lucide-react";
import type { TriageForm } from "@/services/triage/types";

export interface PublishOutcome {
  ok: boolean;
  issues?: { message: string }[];
  warnings?: { message: string }[];
  publicUrl?: string | null;
}

export function PublishPanel({
  form,
  busy,
  onPublish,
  onUnpublish,
  onCopy,
}: {
  form: TriageForm | null;
  busy: boolean;
  onPublish: () => Promise<PublishOutcome>;
  onUnpublish: () => Promise<void>;
  onCopy: (url: string) => void;
}) {
  const [outcome, setOutcome] = useState<PublishOutcome | null>(null);
  const [copied, setCopied] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const published = form?.status === "published";
  const publicUrl = form?.slug ? `/audit/triage/${form.slug}` : null;

  const copy = () => {
    if (!publicUrl) return;
    onCopy(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const doPublish = async () => {
    const result = await onPublish();
    setOutcome(result);
  };

  const doUnpublish = async () => {
    setUnpublishing(true);
    try {
      await onUnpublish();
      setOutcome(null);
    } finally {
      setUnpublishing(false);
    }
  };

  const issues = outcome?.issues ?? [];
  const warnings = outcome?.warnings ?? [];

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div
        className={`rounded-3xl border p-6 ${
          published ? "border-emerald-200 bg-emerald-50/60" : "border-slate-100 bg-white"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Globe size={16} className={published ? "text-emerald-600" : "text-slate-400"} />
              {published ? "Published" : "Not published yet"}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {published
                ? "Anyone with the link can answer this business triage."
                : "Validate the flow and publish to get a public link."}
            </p>
          </div>
          <span
            className={`inline-flex h-3 w-3 rounded-full ${
              published ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
        </div>

        {publicUrl && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-slate-100 p-3">
            <button
              type="button"
              onClick={copy}
              title="Copy public link"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors"
            >
              {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
              {copied ? "Copied!" : "Copy public link"}
            </button>
            <code className="min-w-0 flex-1 truncate text-xs font-mono text-slate-500">
              {window.location.origin}
              {publicUrl}
            </code>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-colors"
            >
              <ExternalLink size={13} /> Open
            </a>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {published ? (
            <button
              type="button"
              disabled={busy || unpublishing}
              onClick={() => void doUnpublish()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {unpublishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void doPublish()}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Publish & validate
            </button>
          )}
          <span className="text-[11px] text-slate-400 font-semibold">
            Publishing runs a full flow-health check before going live.
          </span>
        </div>
      </div>

      {/* Validation checklist */}
      {outcome && outcome.ok && issues.length === 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={17} /> Form published
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            The flow is healthy — every branch reaches a destination. Use the link above to share it.
          </p>
        </div>
      )}

      {issues.length > 0 && (
        <div className="rounded-3xl border border-red-200 bg-red-50/60 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-red-700">
            <AlertTriangle size={17} /> Fix these before publishing
          </div>
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li key={issue.message} className="flex items-start gap-2 text-sm text-red-700 font-medium">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
            <AlertTriangle size={17} /> Worth checking
          </div>
          <ul className="space-y-2">
            {warnings.map((warning) => (
              <li key={warning.message} className="text-sm text-amber-700 font-medium">
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}