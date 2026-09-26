import React from "react";
import { motion } from "framer-motion";

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(checked ? false : true)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:opacity-50 ${
        checked ? "bg-orange-500" : "bg-slate-300"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 min-w-0">
      <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
        {children}
      </span>
      {hint && <span className="block text-[11px] text-slate-400 leading-snug mt-0.5">{hint}</span>}
    </div>
  );
}

const INPUT_CLASSES =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-orange-400 disabled:opacity-50";

export function TextInput({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  spellCheck,
  inputMode,
}: {
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  spellCheck?: boolean;
  inputMode?: "decimal" | "text";
}) {
  return (
    <input
      type="text"
      value={value}
      inputMode={inputMode}
      spellCheck={spellCheck}
      disabled={disabled}
      placeholder={placeholder}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onBlur={onBlur}
      className={INPUT_CLASSES}
    />
  );
}

export function TextArea({
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 2,
  disabled,
}: {
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      disabled={disabled}
      placeholder={placeholder}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onBlur={onBlur}
      className={`${INPUT_CLASSES} resize-y leading-relaxed`}
    />
  );
}

export function SelectField<T extends string | number>({
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: {
  value: T | "";
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <select
      value={value === "" ? "" : String(value)}
      disabled={disabled}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return;
        const match = options.find((o) => String(o.value) === raw);
        if (match) onChange(match.value);
      }}
      className={`${INPUT_CLASSES} cursor-pointer appearance-none`}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Chip({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
        active
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500"
        aria-label={label ?? "Loading"}
      />
      <span className="text-sm font-semibold">{label ?? "Loading…"}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
      <h3 className="text-base font-bold text-slate-700">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}