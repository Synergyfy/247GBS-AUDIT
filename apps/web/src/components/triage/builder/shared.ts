import { AUDIT_STRATEGIES } from "@/types/audit";
import {
  DESTINATION_LABELS,
  type BuilderDestinationKind,
  type QuestionType,
  type TriageAuditType,
  type TriageDestinationType,
} from "@/services/triage/types";

/** Legacy audit options used by the two-legacy-kind "next | audit | none" UI. */
export const AUDIT_OPTIONS: { value: string; label: string }[] = Object.keys(AUDIT_STRATEGIES).map(
  (value) => ({
    value,
    label: value === "SHORT_FORM" ? "Short Audit" : "Large Audit",
  })
);

export const auditLabel = (value: string | null): string =>
  value === "SHORT_FORM" ? "Short Audit" : value === "LONG_FORM" ? "Large Audit" : value ?? "—";

export const destLabel = (value: string | null): string =>
  value && value in DESTINATION_LABELS
    ? DESTINATION_LABELS[value as TriageDestinationType]
    : value ?? "—";

export const DESTINATION_OPTIONS: { value: string; label: string }[] = (
  Object.keys(DESTINATION_LABELS) as TriageDestinationType[]
).map((value) => ({ value, label: DESTINATION_LABELS[value] }));

/** Destination "kind" selected in the forms: next, legacy audit, or a destination type. */
export type DestKind = BuilderDestinationKind | TriageDestinationType;

/** Destination kinds that accept an optional target payload. */
export const DEST_TARGET_KINDS: ReadonlySet<TriageDestinationType> = new Set<TriageDestinationType>([
  "SECTOR",
  "MCOM",
  "CUSTOM",
]);

export interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  description: string;
}

/**
 * Question types exposed in the builder dropdown. Sourced from the backend's
 * `question-types.ts` — only types the API can answer are listed here.
 * (Currency / Percentage / Ranking are intentionally absent until the backend
 * supports their validation, storage and rendering.)
 */
export const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
  { value: "single_choice", label: "Multiple choice", description: "Pick one option" },
  { value: "multiple_choice", label: "Checkboxes / Multiple answers", description: "Pick several options" },
  { value: "dropdown", label: "Dropdown", description: "Pick one from a list" },
  { value: "yes_no", label: "Yes / No", description: "Two auto-created options" },
  { value: "short_text", label: "Short answer", description: "One line of text" },
  { value: "long_text", label: "Paragraph", description: "Longer text" },
  { value: "number", label: "Number", description: "Numeric answer" },
  { value: "date", label: "Date", description: "Calendar date picker" },
  { value: "time", label: "Time", description: "Time picker" },
  { value: "file", label: "File", description: "Attach a file (metadata)" },
  { value: "rating", label: "Rating", description: "Stars-style rating (1–N)" },
  { value: "linear_scale", label: "Linear scale", description: "Scale with labels" },
];

const TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short answer",
  long_text: "Paragraph",
  single_choice: "Multiple choice",
  multiple_choice: "Checkboxes / Multiple answers",
  checkbox: "Checkboxes / Multiple answers",
  dropdown: "Dropdown",
  number: "Number",
  date: "Date",
  time: "Time",
  yes_no: "Yes / No",
  file: "File",
  rating: "Rating",
  linear_scale: "Linear scale",
};

export const typeLabel = (value: QuestionType | null): string =>
  value ? TYPE_LABELS[value] ?? "Question" : "Question";

/** Settings copy used by the Settings tab (grouped per the PRD). */
export const SETTINGS_GROUPS: {
  group: string;
  description: string;
  items: { key: keyof import("@/services/triage/types").TriageFormSettings; label: string; hint: string }[];
}[] = [
  {
    group: "Response",
    description: "How respondents submit and what happens to their answers.",
    items: [
      {
        key: "acceptResponses",
        label: "Accept responses",
        hint: "When off, the public form shows a “not accepting responses” message.",
      },
      {
        key: "collectEmail",
        label: "Collect email",
        hint: "Ask for an email address so results can be linked to the respondent.",
      },
      {
        key: "requireEmail",
        label: "Require email",
        hint: "Force a valid email before the form can be submitted.",
      },
      {
        key: "allowEditing",
        label: "Allow editing answers",
        hint: "Let respondents change answers from the review screen before submitting.",
      },
      {
        key: "showConfirmation",
        label: "Show confirmation screen",
        hint: "Show the recommended next step after submitting.",
      },
    ],
  },
  {
    group: "Presentation",
    description: "What the public form looks like while it is being completed.",
    items: [
      {
        key: "showProgressBar",
        label: "Show progress bar",
        hint: "Display the answered-count progress alongside the questions.",
      },
      {
        key: "confirmationMessage",
        label: "Confirmation message",
        hint: "Optional note shown on the confirmation screen after submitting.",
      },
    ],
  },
];

export type { TriageDestinationType, TriageAuditType };