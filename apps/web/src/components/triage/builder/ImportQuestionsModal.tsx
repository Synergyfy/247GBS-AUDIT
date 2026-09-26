"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  FileText,
  ListChecks,
  RefreshCcw,
  Upload,
  XCircle,
} from "lucide-react";
import type { AdminTriageQuestion } from "@/services/triage/types";
import { isChoiceType } from "@/services/triage/types";
import { Modal } from "./modal";
import { Spinner } from "./ui";
import type { DuplicateMode, ParsedImport } from "./import/types";
import { buildImportedQuestions, downloadTemplate, parseImportFile } from "./import/importer";
import { typeLabel } from "./shared";

const TERMINAL_TOKENS = new Set(["end", "submit", "done", "finish", "result"]);

export function ImportQuestionsModal({
  existing,
  onImport,
  onClose,
}: {
  existing: { id: string; text: string }[];
  onImport: (questions: AdminTriageQuestion[]) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"upload" | "parsing" | "preview">("upload");
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>("rename");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const existingIds = useMemo(() => new Set(existing.map((e) => e.id)), [existing]);

  const conflicts = useMemo(() => {
    if (!parsed) return [];
    return parsed.questions
      .filter((q) => q.stableId && existingIds.has(q.stableId))
      .map((q) => ({
        stableId: q.stableId as string,
        existingText: existing.find((e) => e.id === q.stableId)?.text ?? "an existing question",
      }));
  }, [parsed, existingIds, existing]);

  const runParse = useCallback((selected: File | null) => {
    if (!selected) return;
    setParseError(null);
    setFile(selected);
    setStage("parsing");
    parseImportFile(selected)
      .then((result) => {
        setParsed(result);
        setDuplicateMode("rename");
        setStage("preview");
      })
      .catch((err) => {
        setParsed(null);
        setParseError(err instanceof Error ? err.message : "Could not read the file.");
        setStage("upload");
      });
  }, []);

  const backToUpload = useCallback(() => {
    setParsed(null);
    setParseError(null);
    setFile(null);
    setStage("upload");
  }, []);

  const doImport = useCallback(() => {
    if (!parsed || parsed.errors.length > 0) return;
    const result = buildImportedQuestions(parsed, [...existingIds], duplicateMode);
    onImport(result.questions);
    onClose();
  }, [parsed, existingIds, duplicateMode, onImport, onClose]);

  const errorCount = parsed?.errors.length ?? 0;
  const warningCount = parsed?.warnings.length ?? 0;
  const questionCount = parsed?.questions.length ?? 0;
  const cantImport = !parsed || errorCount > 0;

  const destinationHint = (token: string, index: number): { text: string; tone: "slate" | "emerald" | "red" } => {
    const trimmed = token.trim();
    if (!trimmed) {
      const fallback = questionIsLast(index);
      return { text: fallback ? "Ends flow" : "Next question", tone: "emerald" };
    }
    if (TERMINAL_TOKENS.has(trimmed.toLowerCase())) return { text: "Ends flow", tone: "emerald" };
    return { text: trimmed, tone: "slate" };
  };

  const questionIsLast = (index: number) => index === (parsed?.questions.length ?? 1) - 1;

  return (
    <Modal
      open
      onClose={onClose}
      title="Import questions"
      subtitle="Add questions from a CSV, JSON or Excel file to the draft."
      size="xl"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,.xlsx,.xls"
          className="hidden"
          onChange={(event) => {
            runParse(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />

        {stage === "parsing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-500">
            <Spinner label={`Reading ${file?.name ?? "file"}…`} />
          </div>
        )}

        {stage === "upload" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-5 p-4 sm:p-6">
                <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <ListChecks size={15} /> Supported formats
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  CSV, JSON and Excel (<code>.csv</code>, <code>.json</code>, <code>.xlsx</code>). Files up to 5 MB, up
                  to 500 questions.
                </p>
                <ul className="mt-3 space-y-2 text-xs font-medium text-slate-600">
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-slate-300">•</span>
                    <span>
                      <b>Options</b> are extra rows that repeat the same <code>question_id</code> (or question text),
                      one option per row with an optional <code>destination</code>.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-slate-300">•</span>
                    <span>
                      <b>Destination</b> is a question ID from your file, <code>End</code> to finish the flow, or blank
                      for “next question”.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-slate-300">•</span>
                    <span>
                      <b>Question IDs</b> are optional — they are only needed when another question routes to them.
                    </span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadTemplate("csv")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 transition-colors"
                  >
                    <FileSpreadsheet size={13} /> CSV template
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTemplate("json")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300 transition-colors"
                  >
                    <FileJson size={13} /> JSON template
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <div className="text-sm font-bold text-slate-900">Type → question type</div>
                <div className="grid gap-1 text-xs font-medium text-slate-600">
                  <span><b>Multiple choice</b> · <b>Checkboxes</b> · <b>Dropdown</b> · <b>Short answer</b> · <b>Paragraph</b></span>
                  <span className="text-slate-400">Unsupported types are reported and block the import.</span>
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">Required → required?</div>
                <div className="grid gap-1 text-xs font-medium text-slate-600">
                  <span><code>true / yes / 1 / required</code> &nbsp;·&nbsp; <code>false / no / 0 / optional</code></span>
                  <span className="text-slate-400">Blank defaults to required.</span>
                </div>
              </div>
            </div>

            {parseError && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                <div className="text-xs font-semibold text-red-700">
                  <p className="font-bold">Could not read {file?.name ?? "the file"}</p>
                  <p className="mt-1">{parseError}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                runParse(event.dataTransfer.files?.[0] ?? null);
              }}
              className={`flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-4 py-8 transition-colors sm:px-6 sm:py-12 ${
                dragOver
                  ? "border-orange-400 bg-orange-50/50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <span className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                <Upload size={20} />
              </span>
              <span className="text-center text-sm font-bold text-slate-900">Drop a file here, or browse</span>
              <span className="text-center text-xs font-medium text-slate-400">CSV, JSON or Excel</span>
            </button>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {stage === "preview" && parsed && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                  {parsed.source === "csv" ? <FileText size={16} /> : parsed.source === "json" ? <FileJson size={16} /> : <FileSpreadsheet size={16} />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{file?.name}</p>
                  <p className="text-xs font-medium text-slate-400">
                    {questionCount} question{questionCount === 1 ? "" : "s"} · import adds to the draft, nothing is
                    overwritten
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={backToUpload}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <RefreshCcw size={13} /> Choose a different file
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-4 pt-4 sm:px-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={13} /> {questionCount} ready
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  warningCount > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                <AlertTriangle size={13} /> {warningCount} warning{warningCount === 1 ? "" : "s"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  errorCount > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                }`}
              >
                <XCircle size={13} /> {errorCount} error{errorCount === 1 ? "" : "s"}
              </span>
            </div>

            {errorCount > 0 && (
              <div className="mx-4 mt-3 sm:mx-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-bold text-red-700">
                  Fix these issues in the file and re-import — questions with errors cannot be added.
                </p>
                <ul className="mt-2 max-h-40 list-none space-y-1.5 overflow-y-auto pr-2 text-xs font-medium text-red-600">
                  {parsed.errors.map((issue, index) => (
                    <li key={`e-${index}`} className="flex gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {conflicts.length > 0 && (
              <div className="mx-4 mt-3 sm:mx-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-800">
                  {conflicts.length} question{conflicts.length === 1 ? "" : "s"} use{conflicts.length === 1 ? "s" : ""} an ID
                  that already exists in the builder:
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {conflicts.map((conflict) => (
                    <li key={conflict.stableId} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm">
                      <code>{conflict.stableId}</code>
                      <span className="text-slate-300">·</span>
                      <span className="max-w-40 truncate text-slate-400">{conflict.existingText}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-col gap-2 text-xs font-semibold text-slate-700">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="duplicates"
                      checked={duplicateMode === "rename"}
                      onChange={() => setDuplicateMode("rename")}
                      className="accent-orange-500"
                    />
                    Import them as new questions (recommended — nothing existing changes)
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="duplicates"
                      checked={duplicateMode === "skip"}
                      onChange={() => setDuplicateMode("skip")}
                      className="accent-orange-500"
                    />
                    Skip duplicates — import only the question IDs that do not exist yet
                  </label>
                </div>
              </div>
            )}

            {warningCount > 0 && (
              <div className="mx-4 mt-3 sm:mx-6 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                <p className="text-xs font-bold text-amber-800">
                  {warningCount} warning{warningCount === 1 ? "" : "s"}
                </p>
                <ul className="mt-2 max-h-32 list-none space-y-1 overflow-y-auto pr-2 text-[11px] font-medium text-amber-700">
                  {parsed.warnings.map((issue, index) => (
                    <li key={`w-${index}`} className="flex gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="px-4 py-4 sm:px-6">
              <div className="space-y-2">
                {parsed.questions.map((question, index) => {
                  const hasChoice = isChoiceType(question.type);
                  return (
                    <div
                      key={`${question.rowNumber}-${index}`}
                      className="rounded-2xl border border-slate-100 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-bold text-slate-900">
                          {question.text.trim() || <span className="italic text-slate-400">Untitled question</span>}
                        </span>
                        {question.stableId && (
                          <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                            {question.stableId}
                          </code>
                        )}
                        {question.invalidType ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            <XCircle size={10} /> Unsupported: {question.invalidType}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {typeLabel(question.type)}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            question.required ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {question.required ? "Required" : "Optional"}
                        </span>
                      </div>

                      {hasChoice ? (
                        <ul className="mt-3 space-y-1 border-t border-slate-50 pt-2">
                          {question.options.map((option, optionIndex) => {
                            const hint = destinationHint(option.destination, index);
                            return (
                              <li key={optionIndex} className="flex items-center justify-between gap-3 text-xs">
                                <span className="min-w-0 truncate font-medium text-slate-700">
                                  {option.text.trim() || <span className="italic text-slate-400">Option without text</span>}
                                </span>
                                <span className="flex shrink-0 items-center gap-1 font-bold text-slate-400">
                                  <ArrowRight size={11} />
                                  <span className={hint.tone === "emerald" ? "text-emerald-600" : hint.tone === "red" ? "text-red-500" : ""}>
                                    {hint.text}
                                  </span>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-50 pt-2 text-xs">
                          <span className="font-medium text-slate-500">Free-text answer</span>
                          <span className="flex shrink-0 items-center gap-1 font-bold text-slate-400">
                            <ArrowRight size={11} />
                            <span className="text-emerald-600">{destinationHint(question.defaultDestination, index).text}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-[11px] font-medium text-slate-400">
                {duplicateMode === "skip" ? `Skip duplicates — ${Math.max(0, questionCount - conflicts.length)} question(s) will import.` : ""}{" "}
                Click <b>Import questions</b> to add them to the draft, then <b>Save</b> to persist.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0 sm:items-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={cantImport}
                  onClick={doImport}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <Upload size={15} /> Import questions
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

      </div>
    </Modal>
  );
}