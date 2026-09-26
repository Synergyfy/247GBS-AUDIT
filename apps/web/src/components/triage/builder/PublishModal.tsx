"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import type { TriageForm } from "@/services/triage/types";
import { Modal } from "./modal";
import { PublishPanel, type PublishOutcome } from "./PublishPanel";

export function PublishModal({
  form,
  busy,
  dirty,
  onPublish,
  onUnpublish,
  onCopy,
  onClose,
}: {
  form: TriageForm | null;
  busy: boolean;
  dirty: boolean;
  onPublish: () => Promise<PublishOutcome>;
  onUnpublish: () => Promise<void>;
  onCopy: (url: string) => void;
  onClose: () => void;
}) {
  const [attempted, setAttempted] = useState(false);
  const [outcome, setOutcome] = useState<PublishOutcome | null>(null);
  const [publishing, setPublishing] = useState(false);

  const published = form?.status === "published";
  const issues = attempted && outcome && !outcome.ok ? (outcome.issues ?? []) : [];
  const warnings = attempted && outcome && !outcome.ok ? (outcome.warnings ?? []) : [];
  const success = attempted && outcome?.ok && issues.length === 0;

  const close = () => {
    setAttempted(false);
    setOutcome(null);
    setPublishing(false);
    onClose();
  };

  const doPublish = async () => {
    setPublishing(true);
    try {
      const result = await onPublish();
      setOutcome(result);
      setAttempted(true);
    } finally {
      setPublishing(false);
    }
  };

  const busyNow = busy || publishing;

  return (
    <Modal
      open
      onClose={close}
      title="Publish triage"
      subtitle="Make the current configuration live for visitors."
      size="lg"
    >
      {!attempted ? (
        <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <div className="text-sm">
              <p className="font-bold text-amber-800">
                Publishing will make the current triage configuration live.
              </p>
              <p className="mt-1 font-medium text-amber-700">
                {published
                  ? "The form is already live. Publishing again will replace the live version with the current configuration."
                  : "Once published, visitors will be able to answer the triage using its public link."}
              </p>
            </div>
          </div>

          {dirty && (
            <p className="text-xs font-semibold text-slate-500">
              Your unsaved changes will be saved before publishing.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button
              type="button"
              disabled={busyNow}
              onClick={close}
              className="inline-flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busyNow}
              onClick={() => void doPublish()}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              {busyNow ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {busyNow ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      ) : success ? (
        <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            <div className="text-sm">
              <p className="font-bold text-emerald-700">Your triage is now live</p>
              <p className="mt-0.5 font-medium text-emerald-600">
                Visitors can answer it using the public link below.
              </p>
            </div>
          </div>

          <PublishPanel
            form={form}
            busy={busy}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onCopy={onCopy}
          />

          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-black transition-all"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          {issues.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-red-700">
                <AlertTriangle size={17} /> Fix these before publishing
              </div>
              <ul className="space-y-2">
                {issues.map((issue) => (
                  <li
                    key={issue.message}
                    className="flex items-start gap-2 text-sm font-medium text-red-700"
                  >
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
                <AlertTriangle size={17} /> Worth checking
              </div>
              <ul className="space-y-2">
                {warnings.map((warning) => (
                  <li key={warning.message} className="text-sm font-medium text-amber-700">
                    {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:border-slate-300 transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setAttempted(false);
                setOutcome(null);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all"
            >
              <Send size={15} /> Try again
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}