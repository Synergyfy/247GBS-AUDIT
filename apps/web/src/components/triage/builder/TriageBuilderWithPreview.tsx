"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, Eye, X } from "lucide-react";
import { TriageBuilder } from "./TriageBuilder";
import { PhoneSimulator } from "./PhoneSimulator";
import type { AdminTriageQuestion, TriageForm } from "@/services/triage/types";

interface TriageBuilderWithPreviewProps {
  formId: string;
  initialTab?: "questions" | "responses" | "settings";
  onBack: () => void;
}

export function TriageBuilderWithPreview({
  formId,
  initialTab,
  onBack,
}: TriageBuilderWithPreviewProps) {
  const [liveDraft, setLiveDraft] = useState<AdminTriageQuestion[]>([]);
  const [liveForm, setLiveForm] = useState<TriageForm | null>(null);
  const [focusedQId, setFocusedQId] = useState<string | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const handleDraftChange = useCallback((draft: AdminTriageQuestion[]) => {
    setLiveDraft(draft);
  }, []);
  const handleFormChange = useCallback((form: TriageForm | null) => {
    setLiveForm(form);
  }, []);
  const handleFocusedChange = useCallback((id: string | null) => {
    setFocusedQId(id);
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full gap-6">
      {/* Left: builder */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={14} /> Back to All Flows
        </button>
        <TriageBuilder
          initialFormId={formId}
          initialTab={initialTab}
          onDraftChange={handleDraftChange}
          onFormChange={handleFormChange}
          onFocusedQuestionChange={handleFocusedChange}
        />
      </div>

      {/* Right: phone simulator (desktop) */}
      <div className="hidden h-full min-h-0 w-[320px] shrink-0 flex-col items-center pt-1 lg:flex">
        <div className="h-full w-full min-h-0 overflow-y-auto overscroll-contain pr-1">
          <PhoneSimulator form={liveForm} questions={liveDraft} focusedQuestionId={focusedQId} />
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setMobilePreviewOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-2xl transition-transform hover:scale-105 lg:hidden"
      >
        <Eye size={16} /> Preview
      </button>

      {/* Mobile modal */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobilePreviewOpen(false)}
          />
          <div className="relative z-10 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="absolute -top-1 right-1 z-10 rounded-full bg-slate-900 p-2 text-white shadow-xl"
            >
              <X size={16} />
            </button>
            <PhoneSimulator form={liveForm} questions={liveDraft} focusedQuestionId={focusedQId} />
          </div>
        </div>
      )}
    </div>
  );
}
