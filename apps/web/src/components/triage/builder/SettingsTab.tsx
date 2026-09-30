"use client";

import type { TriageForm, TriageFormSettings } from "@/services/triage/types";
import { Star, CheckCircle2 } from "lucide-react";
import { PublicLinkRow } from "./PublicLinkRow";
import { SETTINGS_GROUPS } from "./shared";
import { useSyncedString } from "./useSyncedState";
import { FieldLabel, TextArea, TextInput, Toggle } from "./ui";

export function SettingsTab({
  form,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateSettings,
  onCopy,
  onSetDefault,
  busy,
}: {
  form: TriageForm;
  onUpdateTitle: (title: string) => void;
  onUpdateDescription: (description: string | null) => void;
  onUpdateSettings: (patch: Partial<TriageFormSettings>) => void;
  onCopy: (path: string) => void;
  onSetDefault?: () => void;
  busy: boolean;
}) {
  const [titleDraft, setTitleDraft] = useSyncedString(form.title);
  const [descDraft, setDescDraft] = useSyncedString(form.description ?? "");
  const [messageDraft, setMessageDraft] = useSyncedString(form.settings.confirmationMessage ?? "");

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== form.title) onUpdateTitle(trimmed);
    else if (!trimmed) setTitleDraft(form.title);
  };

  const commitDescription = () => {
    const trimmed = descDraft.trim();
    if (trimmed !== (form.description ?? "")) onUpdateDescription(trimmed || null);
  };

  const commitMessage = () => {
    if (messageDraft !== (form.settings.confirmationMessage ?? "")) {
      onUpdateSettings({ confirmationMessage: messageDraft });
    }
  };

  return (
    <div className="space-y-6">
      <PublicLinkRow
        slug={form.slug ?? null}
        status={form.status}
        onCopy={onCopy}
      />

      {/* System Default Status Card */}
      <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 via-orange-50/30 to-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500 text-white shrink-0 shadow-2xs">
              <Star size={16} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Default Pre-Audit Flow</h3>
                {form.isDefault ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    <Star size={10} className="fill-amber-600 text-amber-600" /> Active System Default
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Secondary Flow
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 font-medium max-w-xl">
                Only one pre-audit triage can be the system default. The default triage flow is loaded automatically when public visitors enter without a specific flow ID.
              </p>
            </div>
          </div>

          <div>
            {form.isDefault ? (
              <div className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-amber-800 border border-amber-200 shadow-2xs">
                <CheckCircle2 size={15} className="text-amber-600" />
                Current Default
              </div>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={onSetDefault}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                <Star size={14} />
                Set as System Default
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
        <h3 className="mb-1 text-sm font-bold text-slate-900">Form details</h3>
        <p className="mb-5 text-xs text-slate-400 font-medium">
          Shown to visitors on the public form.
        </p>
        <div className="space-y-4">
          <div>
            <FieldLabel>Title</FieldLabel>
            <TextInput value={titleDraft} onChange={setTitleDraft} onBlur={commitTitle} disabled={busy} />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <TextArea
              value={descDraft}
              rows={3}
              placeholder="What will this business triage help with?"
              onChange={setDescDraft}
              onBlur={commitDescription}
              disabled={busy}
            />
          </div>
        </div>
      </div>

      {SETTINGS_GROUPS.map((group) => (
        <div key={group.group} className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900">{group.group}</h3>
          <p className="mb-5 text-xs text-slate-400 font-medium">{group.description}</p>
          <div className="space-y-5">
            {group.items.map((item) => {
              if (item.key === "confirmationMessage") {
                return (
                  <div key={item.key}>
                    <FieldLabel hint={item.hint}>{item.label}</FieldLabel>
                    <TextArea
                      value={messageDraft}
                      rows={2}
                      placeholder="Optional thank-you note shown after submitting…"
                      onChange={setMessageDraft}
                      onBlur={commitMessage}
                      disabled={busy}
                    />
                  </div>
                );
              }
              const value = form.settings[item.key] as boolean;
              return (
                <div key={item.key} className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800">{item.label}</div>
                    <div className="mt-0.5 text-xs text-slate-400 leading-relaxed">{item.hint}</div>
                  </div>
                  <Toggle
                    checked={value}
                    disabled={busy}
                    label={item.label}
                    onChange={(next) => onUpdateSettings({ [item.key]: next } as Partial<TriageFormSettings>)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}