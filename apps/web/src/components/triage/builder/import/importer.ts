import type {
  AdminTriageAnswer,
  AdminTriageQuestion,
  QuestionType,
  TriageDestinationType,
} from "@/services/triage/types";
import { isChoiceType } from "@/services/triage/types";
import { typeLabel } from "../shared";
import { tempId } from "../persist";
import { MAX_IMPORT_SIZE_MB, extensionOf, parseJsonRecords, rowsFromCsvText, rowsFromXlsx } from "./parsers";
import type {
  BuildImportResult,
  DuplicateMode,
  ImportIssue,
  ImportSource,
  ParsedImport,
  PendingQuestion,
  RawRow,
} from "./types";

const MAX_IMPORT_QUESTIONS = 500;

const INPUT_TYPES: ReadonlySet<QuestionType> = new Set<QuestionType>(["short_text", "long_text", "number", "date", "time", "file", "rating", "linear_scale"]);

const TERMINAL_TOKENS = new Set(["end", "submit", "done", "finish", "result"]);

/** Friendly type names accepted in the file → builder question types. */
const TYPE_ALIASES: Record<string, QuestionType> = {
  multiplechoice: "single_choice",
  singlechoice: "single_choice",
  single_choice: "single_choice",
  choice: "single_choice",
  checkboxes: "multiple_choice",
  checkbox: "multiple_choice",
  multiple_choice: "multiple_choice",
  dropdown: "dropdown",
  shortanswer: "short_text",
  shorttext: "short_text",
  short_text: "short_text",
  paragraph: "long_text",
  longtext: "long_text",
  long_text: "long_text",
};

const TRUTHY = new Set(["true", "t", "yes", "y", "1", "required", "mandatory"]);
const FALSY = new Set(["false", "f", "no", "n", "0", "optional", "notrequired", "notrequiredrequired", "not"]);

function parseType(raw: string): { type?: QuestionType } {
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  return TYPE_ALIASES[key] ? { type: TYPE_ALIASES[key] } : {};
}

function parseRequired(raw: string): { value: boolean; raw?: string } {
  const t = raw.trim().toLowerCase();
  if (TRUTHY.has(t)) return { value: true };
  if (FALSY.has(t)) return { value: false };
  return { value: true, raw };
}

const rowLabel = (question: PendingQuestion): string =>
  question.stableId ? `Question "${question.text}"` : question.text ? `Question "${question.text}"` : `Row ${question.rowNumber}`;

function isContinuationRow(row: RawRow, current: PendingQuestion | null): boolean {
  if (!current) return false;
  const question = row.question.trim();
  const id = row.questionId.trim();
  if (id) return current.stableId === id;
  // A repeated question text on a row that is followed by an option = same question.
  if (question && current.stableId === null && current.text === question && current.options.length > 0) return true;
  // Option-only row after either of the above.
  return question === "" && row.option.trim() !== "";
}

/**
 * Group raw rows into questions. Option rows that repeat `question_id` (or the
 * question text) are merged into the previous question; a typed question starts
 * a new group. Rows whose only field is an option are treated as continuations.
 */
export function groupRecords(records: RawRow[], source: ImportSource): {
  questions: PendingQuestion[];
  warnings: ImportIssue[];
  emptyRows: number;
} {
  const questions: PendingQuestion[] = [];
  const warnings: ImportIssue[] = [];
  let emptyRows = 0;
  let current: PendingQuestion | null = null;

  for (const row of records) {
    if (row.malformed) {
      warnings.push({
        kind: "warning",
        message: `Row ${row.rowNumber} is not a valid question object and was ignored.`,
        source,
        row: row.rowNumber,
      });
      continue;
    }

    const allBlank =
      !row.questionId.trim() && !row.question.trim() && !row.type.trim() && !row.required.trim() && !row.option.trim() && !row.destination.trim();
    if (allBlank) {
      emptyRows += 1;
      continue;
    }

    const previous = current;
    if (previous && isContinuationRow(row, previous)) {
      if (row.type.trim() !== "") {
        const parsed = parseType(row.type.trim());
        if (!parsed.type || parsed.type !== previous.type) {
          warnings.push({
            kind: "warning",
            message: `Row ${row.rowNumber}: type "${row.type.trim()}" was ignored — the question was already created as ${typeLabel(previous.type)}.`,
            source,
            row: row.rowNumber,
          });
        }
      }
      if (row.required.trim() !== "") {
        const parsed = parseRequired(row.required.trim());
        if (parsed.raw) {
          warnings.push({
            kind: "warning",
            message: `Row ${row.rowNumber}: "${row.required.trim()}" is not a valid required value — defaulted to required.`,
            source,
            row: row.rowNumber,
          });
        }
        previous.required = parsed.value;
      }
      if (row.option.trim() !== "") {
        if (INPUT_TYPES.has(previous.type)) {
          warnings.push({
            kind: "warning",
            message: `Row ${row.rowNumber}: answer options are ignored for ${typeLabel(previous.type)} questions.`,
            source,
            row: row.rowNumber,
          });
        } else {
          previous.options.push({ text: row.option.trim(), destination: row.destination.trim() });
          if (row.question.trim() !== "" && previous.stableId === null) previous.text = row.question.trim();
        }
      }
      continue;
    }

    // --- New question -------------------------------------------------------
    const parsedType = parseType(row.type.trim());
    const parsedRequired = parseRequired(row.required.trim());
    const question: PendingQuestion = {
      stableId: row.questionId.trim() || null,
      text: row.question.trim(),
      type: parsedType.type ?? "single_choice",
      invalidType: parsedType.type === undefined && row.type.trim() !== "" ? row.type.trim() : undefined,
      required: parsedRequired.value,
      options: [],
      defaultDestination: row.destination.trim(),
      rowNumber: row.rowNumber,
      warnings: [],
    };

    if (parsedRequired.raw) {
      warnings.push({
        kind: "warning",
        message: `Row ${row.rowNumber}: "${row.required.trim()}" is not a valid required value — defaulted to required.`,
        source,
        row: row.rowNumber,
      });
    }
    if (row.type.trim() === "") {
      warnings.push({
        kind: "warning",
        message: `Row ${row.rowNumber}: no question type — defaulted to Multiple choice.`,
        source,
        row: row.rowNumber,
      });
    }

    if (row.option.trim() !== "") {
      if (INPUT_TYPES.has(question.type)) {
        warnings.push({
          kind: "warning",
          message: `Row ${row.rowNumber}: answer options are ignored for ${typeLabel(question.type)} questions.`,
          source,
          row: row.rowNumber,
        });
      } else {
        question.options.push({ text: row.option.trim(), destination: row.destination.trim() });
      }
    } else if (INPUT_TYPES.has(question.type)) {
      question.defaultDestination = row.destination.trim();
    } else if (!row.question.trim() && row.destination.trim()) {
      question.options.push({ text: "", destination: row.destination.trim() });
    }

    questions.push(question);
    current = question;
  }

  return { questions, warnings, emptyRows };
}

function validateQuestions(questions: PendingQuestion[], source: ImportSource): {
  errors: ImportIssue[];
  warnings: ImportIssue[];
} {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const byId = new Map<string, PendingQuestion>();

  for (const q of questions) {
    if (!q.text.trim()) {
      errors.push({
        kind: "error",
        message: `Missing question text at row ${q.rowNumber}.`,
        source,
        row: q.rowNumber,
      });
    }
    if (q.invalidType) {
      errors.push({
        kind: "error",
        message: `Row ${q.rowNumber}: unsupported question type "${q.invalidType}". Supported types: Multiple choice, Checkboxes, Dropdown, Short answer, Paragraph.`,
        source,
        row: q.rowNumber,
      });
    } else if (isChoiceType(q.type) && q.options.length === 0) {
      errors.push({
        kind: "error",
        message: `"${q.text.trim()}" (row ${q.rowNumber}) has no answer options — choice questions need at least one option.`,
        source,
        row: q.rowNumber,
      });
    }
    if (q.stableId) {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(q.stableId)) {
        errors.push({
          kind: "error",
          message: `Invalid question ID "${q.stableId}" (row ${q.rowNumber}) — use letters, numbers, "_" and "-" only.`,
          source,
          row: q.rowNumber,
        });
      } else if (byId.has(q.stableId)) {
        errors.push({
          kind: "error",
          message: `Duplicate question ID "${q.stableId}" (rows ${byId.get(q.stableId)?.rowNumber} and ${q.rowNumber}). Give each question a unique ID.`,
          source,
          row: q.rowNumber,
        });
      } else {
        byId.set(q.stableId, q);
      }
    }
  }

  // Validate destinations once all stable IDs are known.
  for (const q of questions) {
    const optionRefs = q.options.map((option, index) => ({
      token: option.destination.trim(),
      label: option.text.trim(),
      position: index + 1,
    }));
    const typedRef =
      INPUT_TYPES.has(q.type) && q.defaultDestination.trim() ? [{ token: q.defaultDestination.trim(), label: "", position: 1 }] : [];

    for (const ref of [...optionRefs, ...typedRef]) {
      if (!ref.token || TERMINAL_TOKENS.has(ref.token.toLowerCase())) continue;
      if (!byId.has(ref.token)) {
        const where = rowLabel(q).toLowerCase();

        errors.push({
          kind: "error",
          message: `Destination "${ref.token}" (${where}) does not exist in the file. Use a question ID from the file, or "End" to finish the flow, or leave it blank for the next question.`,
          source,
          row: q.rowNumber,
        });
      } else if (q.stableId === ref.token) {
        warnings.push({
          kind: "warning",
          message: `${rowLabel(q)}: ${ref.label ? `option "${ref.label}"` : "it"} routes back to its own question — check for a loop.`,
          source,
          row: q.rowNumber,
        });
      }
    }

    const unnamed = q.options.filter((o) => o.destination.trim() === "").length;
    if (unnamed > 0) {
      warnings.push({
        kind: "warning",
        message: `${rowLabel(q)} has ${unnamed} option${unnamed === 1 ? "" : "s"} without a destination — ${unnamed === q.options.length && q.options.length > 0 ? "all options" : "they"} will route to the next question (or end the flow for the last question).`,
        source,
        row: q.rowNumber,
      });
    }

    for (const warning of q.warnings) {
      warnings.push({ kind: "warning", message: warning, source, row: q.rowNumber });
    }
  }

  return { errors, warnings };
}

export function parseImportFile(file: File): Promise<ParsedImport> {
  return (async () => {
    const source = extensionOf(file.name);
    if (!source) {
      throw new Error(`Unsupported file "${file.name}". Use CSV, JSON or Excel (.csv, .json, .xlsx, .xls).`);
    }
    if (file.size > MAX_IMPORT_SIZE_MB * 1024 * 1024) {
      throw new Error(`The file is larger than ${MAX_IMPORT_SIZE_MB} MB.`);
    }

    let records: RawRow[] = [];
    let ignoredRows = 0;
    if (source === "csv") {
      const out = rowsFromCsvText(await file.text());
      records = out.records;
      ignoredRows = out.ignoredRows;
    } else if (source === "json") {
      records = parseJsonRecords(await file.text());
    } else {
      const out = await rowsFromXlsx(await file.arrayBuffer());
      records = out.records;
      ignoredRows = out.ignoredRows;
    }

    if (records.length === 0) throw new Error("No question rows were found in the file.");

    const { questions, warnings: groupWarnings, emptyRows } = groupRecords(records, source);
    if (questions.length === 0) throw new Error("No valid questions were found in the file.");
    if (questions.length > MAX_IMPORT_QUESTIONS) {
      throw new Error(`The file contains ${questions.length} questions — the limit is ${MAX_IMPORT_QUESTIONS}.`);
    }

    const { errors, warnings } = validateQuestions(questions, source);

    const allWarnings = [...groupWarnings, ...warnings];
    const combinedEmpty = emptyRows + ignoredRows;
    if (combinedEmpty > 0) {
      allWarnings.push({
        kind: "warning",
        message: `${combinedEmpty} blank row${combinedEmpty === 1 ? " was" : "s were"} ignored while reading the file.`,
        source,
      });
    }

    return { source, questions, errors, warnings: allWarnings, emptyRows: combinedEmpty };
  })();
}

/**
 * Convert the validated questions into draft questions appended to the builder.
 * Stable IDs are translated to temp draft ids, and blank destinations resolve to
 * the next question (with a terminal HUMAN_REVIEW for the last one).
 */
export function buildImportedQuestions(
  parsed: ParsedImport,
  existingIds: string[],
  duplicateMode: DuplicateMode
): BuildImportResult {
  const existing = new Set(existingIds);
  const include = duplicateMode === "skip" ? parsed.questions.filter((q) => !(q.stableId && existing.has(q.stableId))) : [...parsed.questions];
  const skipped = parsed.questions
    .filter((q) => q.stableId && existing.has(q.stableId))
    .map((q) => q.stableId as string);

  const stableToDraft = new Map<string, string>();
  const created = include.map((q) => {
    const id = tempId("q");
    if (q.stableId) stableToDraft.set(q.stableId, id);
    return { pending: q, id };
  });

  const resolveTo = (token: string, ownerIndex: number): { nextQuestionId: string | null; destinationType: TriageDestinationType | null } => {
    const trimmed = token.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed) {
      const next = created[ownerIndex + 1];
      return next
        ? { nextQuestionId: next.id, destinationType: null }
        : { nextQuestionId: null, destinationType: "HUMAN_REVIEW" as TriageDestinationType };
    }
    if (TERMINAL_TOKENS.has(lower)) {
      return { nextQuestionId: null, destinationType: "HUMAN_REVIEW" as TriageDestinationType };
    }
    const target = stableToDraft.get(trimmed);
    // Referenced question was skipped due to duplicates — route to the review endpoint.
    return target
      ? { nextQuestionId: target, destinationType: null }
      : { nextQuestionId: null, destinationType: "HUMAN_REVIEW" as TriageDestinationType };
  };

  const now = new Date().toISOString();
  const questions: AdminTriageQuestion[] = created.map(({ pending, id }, index) => {
    const answers: AdminTriageAnswer[] = isChoiceType(pending.type)
      ? pending.options.map((option, optionIndex) => {
          const route = resolveTo(option.destination, index);
          return {
            id: tempId("a"),
            questionId: id,
            text: option.text,
            nextQuestionId: route.nextQuestionId,
            auditType: null,
            destinationType: route.destinationType,
            destinationTarget: null,
            internalValue: null,
            tag: null,
            sortOrder: optionIndex + 1,
            isActive: true,
            createdAt: now,
          };
        })
      : [];

    const questionRoute = resolveTo(INPUT_TYPES.has(pending.type) ? pending.defaultDestination : "", index);

    return {
      id,
      text: pending.text,
      type: pending.type,
      description: null,
      hint: null,
      icon: null,
      required: pending.required,
      config: {},
      defaultNextQuestionId: questionRoute.nextQuestionId,
      defaultAuditType: null,
      defaultDestinationType: questionRoute.destinationType,
      defaultDestinationTarget: null,
      order: index + 1,
      isActive: true,
      hasAuditPath: false,
      createdAt: now,
      answers,
    };
  });

  const warnings: ImportIssue[] = [];
  if (skipped.length > 0) {
    warnings.push({
      kind: "warning",
      message: `${skipped.length} question${skipped.length === 1 ? "" : "s"} (${skipped.map((id) => `"${id}"`).join(", ")}) already exist and were ${duplicateMode === "skip" ? "skipped" : "imported as new questions"}.`,
      source: parsed.source,
    });
  }

  return { questions, skipped, warnings };
}

/* ---------------------------------------------------------------------------
 * Downloadable templates
 * ------------------------------------------------------------------------- */

export const CSV_TEMPLATE = [
  "question_id,question,type,required,option,destination",
  "q1,What type of business do you operate?,Multiple choice,true,Retail,q2",
  "q1,,,true,Restaurant,q2",
  "q1,,,true,Service,q3",
  "q2,Which region is your business based in?,Dropdown,true,Sub-Saharan Africa,",
  "q2,,,true,Outside Africa,",
  "q3,How long have you been operating?,Short answer,true,,",
  "q4,Describe your service in detail,Paragraph,false,,",
].join("\n");

export const JSON_TEMPLATE = JSON.stringify(
  [
    {
      id: "q1",
      question: "What type of business do you operate?",
      type: "Multiple choice",
      required: true,
      options: [
        { text: "Retail", destination: "q2" },
        { text: "Restaurant", destination: "q2" },
        { text: "Service", destination: "q3" },
      ],
    },
    {
      id: "q2",
      question: "Which region is your business based in?",
      type: "Dropdown",
      required: true,
      options: [
        { text: "Sub-Saharan Africa", destination: "" },
        { text: "Outside Africa", destination: "" },
      ],
    },
    { id: "q3", question: "How long have you been operating?", type: "Short answer", required: true },
    { id: "q4", question: "Describe your service in detail", type: "Paragraph", required: false },
  ],
  null,
  2
);

export function downloadTemplate(kind: "csv" | "json"): void {
  const { content, type, name } =
    kind === "csv"
      ? { content: CSV_TEMPLATE, type: "text/csv;charset=utf-8", name: "triage-import-template.csv" }
      : { content: JSON_TEMPLATE, type: "application/json;charset=utf-8", name: "triage-import-template.json" };
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}