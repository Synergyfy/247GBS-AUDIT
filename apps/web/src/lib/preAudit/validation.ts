import type { TriagePublicQuestion } from "@/services/triage/types";
import { isChoiceType } from "@/services/triage/types";

export type EmailValidation =
  | { ok: true; value: string }
  | { ok: false; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(raw: string): EmailValidation {
  const value = raw.trim();

  if (!value) {
    return {
      ok: false,
      message: "Please enter your email address so we can send you your results.",
    };
  }

  if (value.length > 254) {
    return {
      ok: false,
      message: "That email address is too long. Please check it and try again.",
    };
  }

  if (!EMAIL_PATTERN.test(value)) {
    return {
      ok: false,
      message: "That doesn't look like a valid email address. Please check it — for example name@company.com",
    };
  }

  return { ok: true, value };
}

export type AnswerValidation = { ok: true } | { ok: false; message: string };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

function isEmpty(value: unknown, question: TriagePublicQuestion): boolean {
  if (isChoiceType(question.type)) {
    const ids = Array.isArray(value) ? (value as unknown[]) : value ? [value] : [];
    return ids.length === 0;
  }
  return value === undefined || value === null || value === "";
}

/**
 * Client-side mirror of the server-side answer validation. The server remains
 * authoritative for actual submissions; this just improves inline UX.
 */
export function validateAnswer(
  question: TriagePublicQuestion,
  value: unknown
): AnswerValidation {
  if (isEmpty(value, question)) {
    if (!question.required) {
      return { ok: true };
    }
    return { ok: false, message: "This question is required." };
  }

  const cfg = question.config ?? {};

  switch (question.type) {
    case "short_text":
    case "long_text": {
      const text = String(value).trim();
      const max = cfg.maxLength ?? (question.type === "short_text" ? 500 : 5000);
      if (text.length > max) {
        return { ok: false, message: `Please keep this under ${max} characters.` };
      }
      return { ok: true };
    }
    case "number": {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        return { ok: false, message: "Please enter a valid number." };
      }
      if (cfg.min !== undefined && number < cfg.min) {
        return { ok: false, message: `Please enter at least ${cfg.min}.` };
      }
      if (cfg.max !== undefined && number > cfg.max) {
        return { ok: false, message: `Please enter at most ${cfg.max}.` };
      }
      return { ok: true };
    }
    case "date": {
      const date = String(value);
      if (!DATE_PATTERN.test(date)) {
        return { ok: false, message: "Please enter a valid date." };
      }
      if (cfg.minDate && date < cfg.minDate) {
        return { ok: false, message: `Please pick a date on or after ${cfg.minDate}.` };
      }
      if (cfg.maxDate && date > cfg.maxDate) {
        return { ok: false, message: `Please pick a date on or before ${cfg.maxDate}.` };
      }
      return { ok: true };
    }
    case "time": {
      if (!TIME_PATTERN.test(String(value))) {
        return { ok: false, message: "Please enter a valid time (HH:MM)." };
      }
      return { ok: true };
    }
    case "rating":
    case "linear_scale": {
      const min = cfg.min ?? 1;
      const max = cfg.max ?? (question.type === "rating" ? 5 : 10);
      const number = Number(value);
      if (!Number.isInteger(number) || number < min || number > max) {
        return { ok: false, message: `Please choose a value between ${min} and ${max}.` };
      }
      return { ok: true };
    }
    case "file": {
      const items = Array.isArray(value) ? value : [value];
      const maxMb = cfg.maxFileSizeMb ?? 10;
      const allowed = cfg.allowedTypes ?? [];
      for (const item of items) {
        const meta = item as { name?: string; size?: number; mimeType?: string } | null;
        if (!meta || typeof meta.size !== "number" || meta.size <= 0) {
          return { ok: false, message: "Please choose a file to attach." };
        }
        if (meta.size > maxMb * 1024 * 1024) {
          return { ok: false, message: `Files must be at most ${maxMb}MB.` };
        }
        if (allowed.length > 0 && meta.mimeType && !allowed.includes(meta.mimeType)) {
          return { ok: false, message: `Only ${allowed.join(", ")} files are accepted.` };
        }
      }
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}