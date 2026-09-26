"use client";

import type { TriageForm, TriageFormSettings } from "@/services/triage/types";
import { SETTINGS_GROUPS } from "./shared";
import { useSyncedString } from "./useSyncedState";
import { FieldLabel, TextArea, TextInput, Toggle } from "./ui";

export function SettingsTab({
  form,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateSettings,
  busy,
}: {
  form: TriageForm;
  onUpdateTitle: (title: string) => void;
  onUpdateDescription: (description: string | null) => void;
  onUpdateSettings: (patch: Partial<TriageFormSettings>) => void;
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