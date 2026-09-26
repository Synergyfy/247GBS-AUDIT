import type { ImportSource, RawRow } from "./types";

export const MAX_IMPORT_SIZE_MB = 5;

export const SUPPORTED_EXTENSIONS = [".csv", ".json", ".xlsx", ".xls"] as const;

export function extensionOf(fileName: string): ImportSource | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "xlsx";
  return null;
}

/** Column aliases matched case-insensitively after stripping non-alphanumerics. */
const COL_ALIASES: Record<Exclude<keyof RawRow, "rowNumber" | "malformed">, string[]> = {
  questionId: ["questionid", "id", "qid", "questionidquestionids"],
  question: ["question", "text", "questiontext", "label"],
  type: ["type", "questiontype", "answerstype"],
  required: ["required", "optional", "isrequired"],
  option: ["option", "optiontext", "answer", "answertext", "choices", "options"],
  destination: ["destination", "next", "nextquestion", "nextquestionid", "nextquestiontext", "routeto"],
};

export interface RowEntry {
  cells: string[];
  line: number;
}

/** Minimal RFC-4180-ish CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): RowEntry[] {
  const entries: RowEntry[] = [];
  let cells: string[] = [];
  let field = "";
  let inQuotes = false;
  let line = 1;

  const pushCell = () => {
    cells.push(field);
    field = "";
  };
  const pushRow = () => {
    pushCell();
    entries.push({ cells, line });
    cells = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else if (c === "\n") {
        field += c;
        line += 1;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      pushCell();
    } else if (c === "\n") {
      pushRow();
      line += 1;
    } else if (c === "\r") {
      /* skip CR (handled by the following LF) */
    } else {
      field += c;
    }
  }
  if (inQuotes) throw new Error("Unclosed quoted field — check for a missing closing quote in the CSV.");
  if (field.length > 0 || cells.length > 0) pushRow();
  return entries;
}

const KEY_OF = (cell: string): string => cell.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Map header cells to known column indexes; throws when the question column is absent. */
function columnMap(headerCells: string[]): Record<keyof Omit<RawRow, "rowNumber" | "malformed">, number> {
  const map = { questionId: -1, question: -1, type: -1, required: -1, option: -1, destination: -1 };
  headerCells.forEach((cell, index) => {
    const key = KEY_OF(cell);
    for (const col of Object.keys(COL_ALIASES) as (keyof typeof COL_ALIASES)[]) {
      if (map[col] === -1 && COL_ALIASES[col].includes(key)) map[col] = index;
    }
  });
  if (map.question === -1) {
    const found = headerCells.map((c) => `"${c}"`).join(", ") || "none";
    throw new Error(`Missing required "question" column (found: ${found}).`);
  }
  return map as Record<keyof Omit<RawRow, "rowNumber" | "malformed">, number>;
}

function rowFromIndexes(cells: string[], map: Record<keyof Omit<RawRow, "rowNumber" | "malformed">, number>, line: number): RawRow {
  const cell = (key: keyof Omit<RawRow, "rowNumber" | "malformed">) => {
    const index = map[key];
    if (index < 0) return "";
    const value = cells[index];
    return typeof value === "string" ? value.trim() : String(value ?? "").trim();
  };
  return {
    questionId: cell("questionId"),
    question: cell("question"),
    type: cell("type"),
    required: cell("required"),
    option: cell("option"),
    destination: cell("destination"),
    rowNumber: line,
  };
}

export function rowsFromCsvText(text: string): { records: RawRow[]; ignoredRows: number } {
  const entries = parseCsv(text);
  if (entries.length === 0) throw new Error("The CSV file is empty.");

  const headerIndex = entries.findIndex((entry) => entry.cells.some((c) => c.trim() !== ""));
  if (headerIndex === -1) throw new Error("The CSV file is empty.");

  const map = columnMap(entries[headerIndex].cells);
  const records: RawRow[] = [];
  let ignoredRows = headerIndex;

  for (const entry of entries.slice(headerIndex + 1)) {
    if (entry.cells.every((c) => c.trim() === "")) {
      ignoredRows += 1;
      continue;
    }
    records.push(rowFromIndexes(entry.cells, map, entry.line));
  }
  return { records, ignoredRows };
}

/** Flatten a JSON source into surface rows grouped by question/options. */
export function parseJsonRecords(text: string): RawRow[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Could not parse the JSON file: ${err instanceof Error ? err.message : "invalid syntax"}`);
  }

  const items = Array.isArray(data)
    ? data
    : data && typeof data === "object" && !Array.isArray(data) && Array.isArray((data as { questions?: unknown[] }).questions)
      ? (data as { questions: unknown[] }).questions
      : null;
  if (!items) throw new Error('JSON must be a questions array or an object with a "questions" array.');
  if (items.length === 0) throw new Error("The JSON file contains no questions.");

  const firstVal = (source: Record<string, unknown>, ...keys: string[]): unknown => {
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }
    return undefined;
  };

  const rows: RawRow[] = [];
  items.forEach((item, index) => {
    const rowNumber = index + 2;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      rows.push({ questionId: "", question: "", type: "", required: "", option: "", destination: "", rowNumber, malformed: true });
      return;
    }
    const obj = item as Record<string, unknown>;
    const text = (value: unknown): string => (value === undefined || value === null ? "" : String(value).trim());

    const questionId = text(firstVal(obj, "question_id", "id", "qid"));
    const question = text(firstVal(obj, "question", "text", "question_text", "label"));
    const type = text(firstVal(obj, "type", "question_type"));
    const requiredRaw = firstVal(obj, "required", "is_required", "optional");
    const required = requiredRaw === undefined ? "" : text(requiredRaw);
    const questionDestination = text(firstVal(obj, "destination", "next", "route_to", "next_question_id", "next_question_text"));

    const optionsList = Array.isArray(firstVal(obj, "options", "answers", "choices"))
      ? (firstVal(obj, "options", "answers", "choices") as unknown[])
      : [];

    if (optionsList.length === 0) {
      rows.push({
        questionId,
        question,
        type,
        required,
        option: "",
        destination: questionDestination,
        rowNumber,
      });
      return;
    }

    for (const opt of optionsList) {
      let option = "";
      let destination = "";
      if (typeof opt === "string") {
        option = opt.trim();
      } else if (opt && typeof opt === "object" && !Array.isArray(opt)) {
        const o = opt as Record<string, unknown>;
        option = text(firstVal(o, "text", "label", "option", "option_text", "answer"));
        destination = text(firstVal(o, "destination", "next", "route_to", "next_question_id", "next_question_text"));
      } else {
        option = text(opt);
      }
      rows.push({ questionId, question, type, required, option, destination: destination || questionDestination, rowNumber });
    }
  });
  return rows;
}

export async function rowsFromXlsx(buffer: ArrayBuffer): Promise<{ records: RawRow[]; ignoredRows: number }> {
  let readXlsxFile: (input: File | Blob | ArrayBuffer) => Promise<{ data: unknown[][] }[]>;
  try {
    const mod = await import("read-excel-file/browser");
    readXlsxFile = mod.default as unknown as (input: File | Blob | ArrayBuffer) => Promise<{ data: unknown[][] }[]>;
  } catch {
    throw new Error("Excel support is unavailable here — please export the sheet as CSV instead.");
  }

  const sheets = await readXlsxFile(buffer);
  const first = sheets[0];
  if (!first || first.data.length === 0) throw new Error("The Excel file is empty.");

  const rows = first.data;
  const headerIndex = rows.findIndex((row) => (row ?? []).some((cell) => (cell ?? "") !== ""));
  if (headerIndex === -1) throw new Error("The Excel file is empty.");

  const headerCells = (rows[headerIndex] ?? []).map((cell) => String(cell ?? "").trim());
  const map = columnMap(headerCells);
  const records: RawRow[] = [];
  let ignoredRows = headerIndex;

  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const cells = row.map((cell) => String(cell ?? "").trim());
    if (cells.every((c) => c === "")) {
      ignoredRows += 1;
      continue;
    }
    records.push(rowFromIndexes(cells, map, i + 1));
  }
  return { records, ignoredRows };
}