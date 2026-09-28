import type { AdminTriageQuestion } from "@/services/triage/types";

export interface ScenarioTraceStep {
  questionId: string;
  questionText: string;
  optionTexts: string[];
  destinationType: string | null;
  destinationTarget: string | null;
  auditType: string | null;
  nextQuestionId: string | null;
  terminal: boolean;
}

export interface ScenarioRunResult {
  ok: boolean;
  title: string;
  issue?: string;
  steps: ScenarioTraceStep[];
  finalized: number;
}

export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  /** Keywords used to pick the "favourable" option for this scenario. */
  keywords: string[];
  /** When true and keywords match nothing, leave the fork unanswered. */
  requiresMatch: boolean;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "funding",
    label: "Funding scenario",
    description: "A business that is ready and complete: follows funding / ready branches.",
    keywords: ["ready", "funding", "complete"],
    requiresMatch: false,
  },
  {
    id: "excess-stock",
    label: "Excess stock scenario",
    description: "A business with excess stock / unsold inventory.",
    keywords: ["stock", "excess", "inventory"],
    requiresMatch: false,
  },
  {
    id: "spare-capacity",
    label: "Spare capacity scenario",
    description: "A business with spare capacity to take on more work.",
    keywords: ["capacity", "spare"],
    requiresMatch: false,
  },
  {
    id: "multiple-needs",
    label: "Multiple needs scenario",
    description: "A business with several challenges at once (multi-answer branches).",
    keywords: ["multiple", "several", "all", "both"],
    requiresMatch: false,
  },
  {
    id: "new-business",
    label: "New business scenario",
    description: "A newly started business exploring its options.",
    keywords: ["new", "start", "beginning", "starting"],
    requiresMatch: false,
  },
  {
    id: "not-ready",
    label: "Not-ready scenario",
    description: "A business that is not ready for a full audit yet.",
    keywords: ["not ready", "not yet", "still", "ongoing"],
    requiresMatch: false,
  },
];

function matches(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function byId(questions: AdminTriageQuestion[], id: string | null): AdminTriageQuestion | null {
  return questions.find((q) => q.id === id) ?? null;
}

/**
 * Simulates a respondent walking the active flow, choosing option text that
 * matches the preset keywords (falling back to the first option). Continues
 * until a terminal destination or a blocker (no route) is reached.
 */
export function runScenario(
  questions: AdminTriageQuestion[],
  preset: ScenarioPreset
): ScenarioRunResult {
  const active = questions
    .filter((q) => q.isActive)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt.localeCompare(b.createdAt));

  const start = active[0] ?? null;
  if (!start) {
    return { ok: false, title: preset.label, issue: "No active questions configured.", steps: [], finalized: 0 };
  }

  const steps: ScenarioTraceStep[] = [];
  const visitedIds = new Set<string>();
  let current = start;

  for (let depth = 0; depth < 60; depth += 1) {
    const options = current.answers
      .filter((a) => a.isActive)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const chosen = options.find((o) => matches(o.text, preset.keywords)) ?? null;
    if (preset.requiresMatch && !chosen) break;

    if (options.length === 0) {
      const terminal = Boolean(
        current.defaultNextQuestionId ||
          current.defaultAuditType ||
          current.defaultDestinationType
      );
      steps.push({
        questionId: current.id,
        questionText: current.text,
        optionTexts: [],
        nextQuestionId: current.defaultNextQuestionId,
        destinationType: current.defaultDestinationType ?? (current.defaultAuditType ? null : null),
        destinationTarget: current.defaultDestinationTarget,
        auditType: current.defaultAuditType,
        terminal,
      });
      if (!terminal || visitedIds.has(current.id)) break;
      if (!current.defaultNextQuestionId) break;
      const next = byId(questions, current.defaultNextQuestionId);
      if (!next || visitedIds.has(next.id)) break;
      visitedIds.add(current.id);
      current = next;
      continue;
    }

    const selectedIds = new Set<string>(
      chosen ? [chosen.id] : [options[0].id]
    );
    const selected = options.filter(
      (o) => selectedIds.has(o.id) || (preset.id === "multiple-needs" && o.nextQuestionId !== null)
    );

    let nextQuestionId: string | null = null;
    let destinationType: string | null = null;
    let destinationTarget: string | null = null;
    let auditType: string | null = null;
    let terminal = false;

    for (const option of selected) {
      if (option.nextQuestionId && !nextQuestionId) nextQuestionId = option.nextQuestionId;
      if (option.destinationType && !destinationType) {
        destinationType = option.destinationType;
        destinationTarget = option.destinationTarget;
        terminal = true;
      }
      if (option.auditType && !auditType) {
        auditType = option.auditType;
        terminal = true;
      }
    }

    steps.push({
      questionId: current.id,
      questionText: current.text,
      optionTexts: selected.map((o) => o.text),
      nextQuestionId,
      destinationType,
      destinationTarget,
      auditType,
      terminal,
    });

    if (terminal || !nextQuestionId) break;
    if (visitedIds.has(current.id) || visitedIds.has(nextQuestionId)) break;
    visitedIds.add(current.id);

    const next = byId(questions, nextQuestionId);
    if (!next) break;
    current = next;
  }

  const finalized = steps.filter(
    (s) => s.destinationType || s.auditType
  ).length;
  const ok = steps.length > 0 && steps.some((s) => s.terminal || s.destinationType || s.auditType);

  return { ok, title: preset.label, steps, finalized };
}

export const FINAL_DESTINATION_LABELS: Record<string, string> = {
  SHORT_FORM: "Short Audit",
  LONG_FORM: "Long Audit",
  SECTOR: "Sector Audit",
  SUPPORT: "Support",
  FUND_OR_DONATE: "Fund / Donate",
  MCOM: "MCOM Service",
  HUMAN_REVIEW: "Human review",
  NO_ACTION: "No action",
  CUSTOM: "Custom destination",
};