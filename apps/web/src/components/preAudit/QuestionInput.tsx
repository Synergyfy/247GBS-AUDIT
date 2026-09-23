import React, { useId } from "react";
import { Check, FileText, Star, Type, X } from "lucide-react";
import type { TriagePublicQuestion } from "@/services/triage/types";

export type QuestionInputValue = unknown;

interface QuestionInputProps {
  question: TriagePublicQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string | null;
}

function selectedIds(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string" && value) return [value];
  return [];
}

/**
 * Single dynamic renderer for every question type. Pages never special-case a
 * type: they delegate to this component (pre-audit flow, logged-in triage,
 * admin preview).
 */
export function QuestionInput({ question, value, onChange, disabled = false, error = null }: QuestionInputProps) {
  const id = useId();
  const cfg = question.config ?? {};
  const selected = selectedIds(value);

  const setSingle = (optionId: string, chosen: boolean) => {
    if (!chosen) {
      onChange(null);
      return;
    }
    onChange(optionId);
  };

  const toggleMulti = (optionId: string) => {
    const next = selected.includes(optionId)
      ? selected.filter((s) => s !== optionId)
      : [...selected, optionId];
    onChange(next);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border-2 ${
    error ? "border-red-300 bg-red-50/40" : "border-slate-200 focus-within:border-orange-300"
  } bg-white text-slate-900 text-base outline-none transition-colors placeholder:text-slate-400 disabled:opacity-60`;

  switch (question.type) {
    case "single_choice":
    case "yes_no":
      return (
        <ChoiceOptions
          question={question}
          selected={selected}
          multi={false}
          disabled={disabled}
          onSelect={setSingle}
        />
      );

    case "multiple_choice":
    case "checkbox":
      return (
        <ChoiceOptions
          question={question}
          selected={selected}
          multi
          disabled={disabled}
          onSelect={toggleMulti}
        />
      );

    case "dropdown":
      return (
        <div>
          <select
            id={id}
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            disabled={disabled}
            onChange={(e) => setSingle(e.target.value, e.target.value !== "")}
            aria-invalid={Boolean(error)}
          >
            <option value="">Choose an option…</option>
            {question.answers.map((option) => (
              <option key={option.id} value={option.id}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      );

    case "short_text":
      return (
        <input
          id={id}
          type="text"
          className={inputClass}
          placeholder={cfg.placeholder ?? "Type your answer"}
          maxLength={cfg.maxLength ?? 500}
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "long_text":
      return (
        <textarea
          id={id}
          className={`${inputClass} min-h-[120px] resize-y`}
          placeholder={cfg.placeholder ?? "Type your answer"}
          maxLength={cfg.maxLength ?? 5000}
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <input
          id={id}
          type="number"
          className={inputClass}
          placeholder={cfg.placeholder ?? "0"}
          min={cfg.min}
          max={cfg.max}
          step={cfg.step ?? 1}
          value={typeof value === "string" ? value : value === null ? "" : String(value ?? "")}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "date":
      return (
        <input
          id={id}
          type="date"
          className={inputClass}
          min={cfg.minDate}
          max={cfg.maxDate}
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "time":
      return (
        <input
          id={id}
          type="time"
          className={inputClass}
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "rating": {
      const ratingMax = cfg.max ?? 5;
      const current = typeof value === "number" ? value : Number(value) || 0;
      return (
        <div className="flex flex-wrap gap-2 sm:gap-3" role="radiogroup" aria-label={question.text}>
          {Array.from({ length: ratingMax }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              disabled={disabled}
              aria-pressed={current === n}
              onClick={() => onChange(n)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center text-xl transition-all disabled:opacity-60 ${
                current === n
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200"
                  : "bg-white border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {cfg.placeholder === "stars" ? <Star size={22} fill={current >= n ? "currentColor" : "none"} /> : n}
            </button>
          ))}
        </div>
      );
    }

    case "linear_scale": {
      const scaleMin = cfg.min ?? 1;
      const scaleMax = cfg.max ?? 10;
      const current = typeof value === "number" ? value : Number(value) || 0;
      return (
        <div>
          <div className="flex items-end gap-1 sm:gap-2 flex-wrap" role="radiogroup" aria-label={question.text}>
            {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i).map((n) => (
              <button
                key={n}
                type="button"
                disabled={disabled}
                aria-pressed={current === n}
                onClick={() => onChange(n)}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-60 ${
                  current === n
                    ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200"
                    : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2 gap-4">
            <span>{cfg.minLabel ?? String(scaleMin)}</span>
            <span>{cfg.maxLabel ?? String(scaleMax)}</span>
          </div>
        </div>
      );
    }

    case "file":
      return (
        <FilePicker
          value={value}
          disabled={disabled}
          multiple={cfg.multipleFiles === true}
          maxSizeMb={cfg.maxFileSizeMb ?? 10}
          allowedTypes={cfg.allowedTypes ?? []}
          onChange={onChange}
        />
      );

    default:
      return (
        <input
          id={id}
          type="text"
          className={inputClass}
          placeholder="Type your answer"
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

interface ChoiceOptionsProps {
  question: TriagePublicQuestion;
  selected: string[];
  multi: boolean;
  disabled: boolean;
  onSelect: (optionId: string, chosen: boolean) => void;
}

function ChoiceOptions({ question, selected, multi, disabled, onSelect }: ChoiceOptionsProps) {
  if (question.answers.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-500 font-medium">
          {multi ? "No options available yet." : "No answer options are available for this question yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4" role="group" aria-label={multi ? "Select all that apply" : "Choose an answer"}>
      {question.answers.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onSelect(option.id, !isSelected)}
            className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left disabled:opacity-60 ${
              isSelected
                ? "bg-orange-50 border-orange-400 shadow-lg shadow-orange-100"
                : "bg-white border-slate-100 hover:border-orange-300 hover:shadow-lg hover:shadow-slate-200/50"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isSelected ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400"
              }`}
            >
              {multi ? <Check size={18} /> : <Type size={18} />}
            </div>
            <div className={isSelected ? "font-bold text-orange-700" : "font-bold text-slate-900"}>
              {option.text}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface FilePickerProps {
  value: unknown;
  disabled: boolean;
  multiple: boolean;
  maxSizeMb: number;
  allowedTypes: string[];
  onChange: (value: unknown) => void;
}

interface FileMeta {
  name: string;
  size: number;
  mimeType: string;
}

function toMeta(file: File): FileMeta {
  return { name: file.name, size: file.size, mimeType: file.type };
}

function FilePicker({ value, disabled, multiple, maxSizeMb, allowedTypes, onChange }: FilePickerProps) {
  const items: FileMeta[] = Array.isArray(value)
    ? (value as FileMeta[])
    : value && typeof value === "object"
      ? [value as FileMeta]
      : [];

  const removeAt = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(multiple ? next : null);
  };

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const picked = Array.from(list).map(toMeta);
    const next = multiple ? [...items, ...picked] : picked.slice(0, 1);
    onChange(multiple ? next : next[0] ?? null);
  };

  return (
    <div className="space-y-3">
      <label
        className="flex flex-col sm:flex-row items-center gap-3 justify-center px-6 py-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 cursor-pointer hover:border-orange-300 hover:bg-orange-50/40 transition-all text-center"
      >
        <FileText size={28} className="text-slate-400" />
        <div>
          <p className="text-sm font-bold text-slate-700">
            {multiple ? "Choose files to attach" : "Choose a file to attach"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {allowedTypes.length > 0 ? `${allowedTypes.join(", ")}` : "Any file type"}
            {" · "}up to {maxSizeMb}MB
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          disabled={disabled}
          multiple={multiple}
          accept={allowedTypes.join(",") || undefined}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200"
            >
              <FileText size={16} className="text-orange-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-500">{(item.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label={`Remove ${item.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}