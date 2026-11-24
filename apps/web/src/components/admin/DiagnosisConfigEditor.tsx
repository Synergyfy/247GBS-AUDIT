"use client";

import React, { useMemo, useState } from "react";
import { Plus, Trash2, Wand2, Sparkles, GitBranch } from "lucide-react";
import {
  EMPTY_DIAGNOSIS_CONFIG,
  newCategory,
  newRule,
  type DiagnosisCategoryConfig,
  type DiagnosisCondition,
  type DiagnosisConfig,
  type DiagnosisOperator,
  type McomService,
  type RecommendationRule,
} from "@/services/diagnosis/types";
import { fetchDefaultDiagnosisConfig } from "@/services/diagnosis/api";

interface QuestionOption {
  id: string;
  text: string;
  category?: string | null;
}

interface DiagnosisConfigEditorProps {
  value?: DiagnosisConfig | null;
  onChange: (next: DiagnosisConfig) => void;
  questions: QuestionOption[];
  services: McomService[];
  disabled?: boolean;
}

const OPERATORS: { value: DiagnosisOperator; label: string }[] = [
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "eq", label: "=" },
  { value: "neq", label: "≠" },
  { value: "includes", label: "includes" },
  { value: "not_includes", label: "does not include" },
];

const PRIORITIES = ["high", "medium", "low"] as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </span>
  );
}

export function DiagnosisConfigEditor({
  value,
  onChange,
  questions,
  services,
  disabled,
}: DiagnosisConfigEditorProps) {
  const config = value ?? EMPTY_DIAGNOSIS_CONFIG;
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const categoryKeys = useMemo(
    () => config.categories.map((c) => c.key).filter(Boolean),
    [config.categories]
  );

  const patch = (next: Partial<DiagnosisConfig>) => {
    onChange({ ...config, ...next });
  };

  const patchCategory = (index: number, next: Partial<DiagnosisCategoryConfig>) => {
    const categories = config.categories.map((c, i) => (i === index ? { ...c, ...next } : c));
    patch({ categories });
  };

  const patchRule = (index: number, next: Partial<RecommendationRule>) => {
    const rules = config.rules.map((r, i) => (i === index ? { ...r, ...next } : r));
    patch({ rules });
  };

  const patchCondition = (
    ruleIndex: number,
    conditionIndex: number,
    next: Partial<DiagnosisCondition>
  ) => {
    const rule = config.rules[ruleIndex];
    if (!rule) return;
    const conditions = rule.conditions.map((c, i) =>
      i === conditionIndex ? { ...c, ...next } : c
    );
    patchRule(ruleIndex, { conditions });
  };

  const loadDefaults = async () => {
    setLoadingDefaults(true);
    try {
      const defaults = await fetchDefaultDiagnosisConfig();
      onChange(defaults);
    } finally {
      setLoadingDefaults(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-orange-200/70 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500 text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Diagnosis &amp; Recommendation Engine</h3>
            <p className="mt-0.5 max-w-xl text-xs font-medium text-slate-500">
              Score the answers by category, then turn the result into recommendations mapped to
              MCOM capabilities. This configuration is stored on the form and evaluated
              server-side after submission.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || loadingDefaults}
            onClick={() => void loadDefaults()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50 disabled:opacity-50"
          >
            <Wand2 size={13} />
            {loadingDefaults ? "Loading…" : "Load default model"}
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={config.enabled !== false}
              disabled={disabled}
              onChange={(e) => patch({ enabled: e.target.checked })}
              className="h-3.5 w-3.5 accent-orange-500"
            />
            Enabled
          </label>
        </div>
      </div>

      {/* Categories */}
      <section className="rounded-3xl border border-slate-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Scored categories</h4>
            <p className="text-xs font-medium text-slate-400">
              Group questions into the areas you want scored. Match by the question&apos;s category
              value or by keywords in the question text.
            </p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => patch({ categories: [...config.categories, newCategory(config.categories.length)] })}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
          >
            <Plus size={13} /> Add category
          </button>
        </div>

        {config.categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs font-medium text-slate-400">
            No categories yet. Add one, or load the default model.
          </p>
        ) : (
          <div className="space-y-3">
            {config.categories.map((category, index) => (
              <div
                key={`${category.key}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3"
              >
                <div className="grid gap-2 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <FieldLabel>Key</FieldLabel>
                    <input
                      value={category.key}
                      disabled={disabled}
                      onChange={(e) => patchCategory(index, { key: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                      placeholder="operations"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <FieldLabel>Label</FieldLabel>
                    <input
                      value={category.label}
                      disabled={disabled}
                      onChange={(e) => patchCategory(index, { label: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500"
                      placeholder="Operations & Capacity"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Weight</FieldLabel>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={category.weight ?? 1}
                      disabled={disabled}
                      onChange={(e) =>
                        patchCategory(index, { weight: Number(e.target.value) || 1 })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-end justify-end">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        patch({ categories: config.categories.filter((_, i) => i !== index) })
                      }
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                  <div className="sm:col-span-6">
                    <FieldLabel>Question categories (comma separated)</FieldLabel>
                    <input
                      value={(category.questionCategories ?? []).join(", ")}
                      disabled={disabled}
                      onChange={(e) =>
                        patchCategory(index, {
                          questionCategories: e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-orange-500"
                      placeholder="Operations, Spare Capacity"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <FieldLabel>Text keywords (comma separated)</FieldLabel>
                    <input
                      value={(category.keywords ?? []).join(", ")}
                      disabled={disabled}
                      onChange={(e) =>
                        patchCategory(index, {
                          keywords: e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-orange-500"
                      placeholder="capacity, idle, staff"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Thresholds */}
      <section className="rounded-3xl border border-slate-100 bg-white p-5">
        <h4 className="text-sm font-bold text-slate-900">Score thresholds</h4>
        <p className="mb-3 text-xs font-medium text-slate-400">
          Used to turn a 0–100 category score into a rating.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["excellent", "Excellent ≥"],
              ["good", "Good ≥"],
              ["average", "Average ≥"],
              ["poor", "Poor ≥"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <input
                type="number"
                min={0}
                max={100}
                value={config.thresholds?.[key] ?? 0}
                disabled={disabled}
                onChange={(e) =>
                  patch({
                    thresholds: {
                      ...(config.thresholds ?? { excellent: 80, good: 60, average: 40, poor: 20 }),
                      [key]: Number(e.target.value) || 0,
                    },
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Rules */}
      <section className="rounded-3xl border border-slate-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Recommendation rules</h4>
            <p className="text-xs font-medium text-slate-400">
              When the conditions match, the recommendation is produced and mapped to the selected
              MCOM capabilities.
            </p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => patch({ rules: [...config.rules, newRule(config.rules.length)] })}
            className="inline-flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Plus size={13} /> Add rule
          </button>
        </div>

        {config.rules.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs font-medium text-slate-400">
            No rules yet. Add one, or load the default model.
          </p>
        ) : (
          <div className="space-y-4">
            {config.rules.map((rule, rIndex) => (
              <div key={rule.id || rIndex} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <GitBranch size={14} className="text-orange-500" />
                    Rule {rIndex + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <input
                        type="checkbox"
                        checked={rule.isActive !== false}
                        disabled={disabled}
                        onChange={(e) => patchRule(rIndex, { isActive: e.target.checked })}
                        className="h-3.5 w-3.5 accent-orange-500"
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => patch({ rules: config.rules.filter((_, i) => i !== rIndex) })}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-12">
                  <div className="sm:col-span-8">
                    <FieldLabel>Title / business issue</FieldLabel>
                    <input
                      value={rule.title}
                      disabled={disabled}
                      onChange={(e) => patchRule(rIndex, { title: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                      placeholder="Unlock underused capacity"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Priority</FieldLabel>
                    <select
                      value={rule.priority}
                      disabled={disabled}
                      onChange={(e) =>
                        patchRule(rIndex, { priority: e.target.value as RecommendationRule["priority"] })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Match</FieldLabel>
                    <select
                      value={rule.match ?? "all"}
                      disabled={disabled}
                      onChange={(e) => patchRule(rIndex, { match: e.target.value as "all" | "any" })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                    >
                      <option value="all">All</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                  <div className="sm:col-span-6">
                    <FieldLabel>Why it matters</FieldLabel>
                    <textarea
                      value={rule.summary}
                      disabled={disabled}
                      rows={2}
                      onChange={(e) => patchRule(rIndex, { summary: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-orange-500"
                      placeholder="Explain what the diagnosis indicates."
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <FieldLabel>What should happen next</FieldLabel>
                    <textarea
                      value={rule.action}
                      disabled={disabled}
                      rows={2}
                      onChange={(e) => patchRule(rIndex, { action: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-orange-500"
                      placeholder="The recommended action and service."
                    />
                  </div>
                </div>

                {/* Conditions */}
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Conditions
                    </span>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        patchRule(rIndex, {
                          conditions: [
                            ...rule.conditions,
                            { source: "category", key: categoryKeys[0] ?? "", operator: "lt", value: 50 },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700"
                    >
                      <Plus size={12} /> Add condition
                    </button>
                  </div>
                  <div className="space-y-2">
                    {rule.conditions.map((condition, cIndex) => (
                      <div key={cIndex} className="flex flex-wrap items-center gap-1.5">
                        <select
                          value={condition.source}
                          disabled={disabled}
                          onChange={(e) =>
                            patchCondition(rIndex, cIndex, {
                              source: e.target.value as DiagnosisCondition["source"],
                              key: e.target.value === "answer" ? questions[0]?.id ?? "" : categoryKeys[0] ?? "",
                            })
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
                        >
                          <option value="category">Category score</option>
                          <option value="answer">Answer</option>
                        </select>

                        <select
                          value={condition.key}
                          disabled={disabled}
                          onChange={(e) => patchCondition(rIndex, cIndex, { key: e.target.value })}
                          className="min-w-[140px] flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none"
                        >
                          <option value="">Select…</option>
                          {(condition.source === "answer"
                            ? questions.map((q) => ({ value: q.id, label: q.text || q.id }))
                            : categoryKeys.map((key) => ({ value: key, label: key }))
                          ).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={condition.operator}
                          disabled={disabled}
                          onChange={(e) =>
                            patchCondition(rIndex, cIndex, {
                              operator: e.target.value as DiagnosisOperator,
                            })
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
                        >
                          {OPERATORS.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        <input
                          value={String(condition.value ?? "")}
                          disabled={disabled}
                          onChange={(e) =>
                            patchCondition(rIndex, cIndex, { value: e.target.value })
                          }
                          className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none"
                          placeholder="value"
                        />

                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            patchRule(rIndex, {
                              conditions: rule.conditions.filter((_, i) => i !== cIndex),
                            })
                          }
                          className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MCOM services */}
                <div className="mt-3">
                  <FieldLabel>Map to MCOM capabilities</FieldLabel>
                  {services.length === 0 ? (
                    <p className="text-[11px] font-medium text-slate-400">
                      No services available.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {services.map((service) => {
                        const selected = rule.serviceIds.includes(service.id);
                        return (
                          <button
                            key={service.id}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              patchRule(rIndex, {
                                serviceIds: selected
                                  ? rule.serviceIds.filter((id) => id !== service.id)
                                  : [...rule.serviceIds, service.id],
                              })
                            }
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                              selected
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"
                            }`}
                            title={service.description}
                          >
                            {service.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
