import type { AdminTriageQuestion, QuestionType } from "@/services/triage/types";

export type ImportSource = "csv" | "json" | "xlsx";

/**
 * A single row as read from the file (CSV row, XLSX row or a JSON entry
 * flattened into its option rows). `rowNumber` is the 1-based row within the
 * sheet for error attribution.
 */
export interface RawRow {
  questionId: string;
  question: string;
  type: string;
  required: string;
  option: string;
  destination: string;
  rowNumber: number;
  /** Set when a JSON entry could not be read (e.g. not an object). */
  malformed?: boolean;
}

export interface ImportOption {
  text: string;
  destination: string;
}

/** A question grouped from the raw rows, before final ID mapping to the draft. */
export interface PendingQuestion {
  stableId: string | null;
  text: string;
  /** Normalised type; a placeholder is used when the file listed an unsupported type. */
  type: QuestionType;
  /** The raw unsupported type string — present only when the question must be rejected. */
  invalidType?: string;
  required: boolean;
  options: ImportOption[];
  /** Question-level destination used by typed (free-text) questions. */
  defaultDestination: string;
  rowNumber: number;
  warnings: string[];
}

export interface ImportIssue {
  kind: "error" | "warning";
  message: string;
  source: ImportSource;
  /** 1-based row within the file that caused the issue, when applicable. */
  row?: number;
}

export interface ParsedImport {
  source: ImportSource;
  questions: PendingQuestion[];
  errors: ImportIssue[];
  warnings: ImportIssue[];
  /** Blank rows that were ignored while reading the file. */
  emptyRows: number;
}

export type DuplicateMode = "skip" | "rename";

export interface ImportConflict {
  stableId: string;
  existingText: string;
}

export interface BuildImportResult {
  questions: AdminTriageQuestion[];
  skipped: string[];
  warnings: ImportIssue[];
}