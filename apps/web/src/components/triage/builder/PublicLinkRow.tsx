"use client";

import { useState, useSyncExternalStore } from "react";
import { Clipboard, ClipboardCheck, ExternalLink, Link2 } from "lucide-react";
import type { TriageFormStatus } from "@/services/triage/types";

// The origin is only knowable in the browser. useSyncExternalStore lets us read
// it without setState-in-an-effect, and gives us "" during server rendering.
const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

/**
 * Always-available access to the published form's public link.
 *
 * The slug is only minted on the first publish (see triage-form.service.ts), so
 * until then there is genuinely no link to show. Unpublishing keeps the slug for
 * a future re-publish, so a retained slug is not proof the link currently
 * resolves. `onCopy` receives the path and is responsible for prefixing the
 * origin + surfacing confirmation.
 */
export function PublicLinkRow({
  slug,
  status,
  onCopy,
}: {
  slug: string | null;
  status: TriageFormStatus;
  onCopy: (path: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);

  if (!slug) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Link2 size={16} className="text-slate-400" /> Public link
        </h3>
        <p className="text-xs font-medium text-slate-400">
          Publish the form to generate its shareable link. It will appear here.
        </p>
      </div>
    );
  }

  const path = `/audit/triage/${slug}`;

  const copy = () => {
    onCopy(path);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-900">
        <Link2 size={16} className="text-orange-500" /> Public link
      </h3>
      <p className="mb-4 text-xs font-medium text-slate-400">
        {status === "published"
          ? "Share this with anyone who should answer the triage. No sign-in required."
          : "This form is currently unpublished, so the link will not resolve for respondents."}
      </p>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
        <button
          type="button"
          onClick={copy}
          title="Copy public link"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-black"
        >
          {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
          {copied ? "Copied!" : "Copy public link"}
        </button>
        <code className="min-w-0 flex-1 truncate text-xs font-mono text-slate-500">
          {origin}
          {path}
        </code>
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-orange-300 hover:text-orange-600"
        >
          <ExternalLink size={13} /> Open
        </a>
      </div>
    </div>
  );
}
