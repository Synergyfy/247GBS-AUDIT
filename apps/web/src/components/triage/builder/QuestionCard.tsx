"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
import {
  AlignJustify,
  AlignLeft,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  CircleDot,
  Clock,
  Copy,
  Flag,
  Gauge,
  GitBranch,
  GripVertical,
  Hash,
  ListChecks,
  Minus,
  Plus,
  Settings2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  AdminTriageAnswer,
  AdminTriageQuestion,
  QuestionConfig,
  QuestionType,
  TriageAuditType,
  TriageDestinationType,
} from "@/services/triage/types";
import { isChoiceType } from "@/services/triage/types";
import type { AnswerPayload, QuestionPayload } from "@/services/triage/hooks";
import { isFormattedHtml } from "@/lib/richText";
import {
  AUDIT_OPTIONS,
  DEST_TARGET_KINDS,
  DESTINATION_OPTIONS,
  DestKind,
  typeLabel,
} from "./shared";
import {
  GO_TO_NEXT,
  destinationOfEndToken,
  endTokenOf,
  goToValueOf,
  nextLinearId,
  questionStepLabel,
  responseNavigationOn,
  routeStatusOf,
} from "./navigation";
import { useSyncedState, useSyncedString } from "./useSyncedState";
import { FieldLabel, SelectField, TextArea, TextInput, Toggle } from "./ui";
import { editorHtmlOf, QuestionTextEditor } from "./richTextEditor";

interface TypeMenuItem {
  value: QuestionType;
  label: string;
  icon: LucideIcon;
}

interface TypeMenuGroup {
  group: string;
  items: TypeMenuItem[];
}

/** Grouped dropdown menu. Grid types (multiple choice grid / checkbox grid) are
 *  intentionally omitted until the backend supports them. */
const TYPE_MENU_GROUPS: TypeMenuGroup[] = [
  {
    group: "Text",
    items: [
      { value: "short_text", label: "Short answer", icon: AlignLeft },
      { value: "long_text", label: "Paragraph", icon: AlignJustify },
      { value: "number", label: "Number", icon: Hash },
    ],
  },
  {
    group: "Choice",
    items: [
      { value: "single_choice", label: "Multiple choice", icon: CircleDot },
      { value: "multiple_choice", label: "Checkboxes", icon: ListChecks },
      { value: "dropdown", label: "Dropdown", icon: ChevronsUpDown },
      { value: "yes_no", label: "Yes / No", icon: CheckCircle2 },
    ],
  },
  {
    group: "Upload",
    items: [
      { value: "file", label: "File upload", icon: Upload },
      { value: "linear_scale", label: "Linear scale", icon: Gauge },
      { value: "rating", label: "Rating", icon: Star },
    ],
  },
  {
    group: "Date / Time",
    items: [
      { value: "date", label: "Date", icon: Calendar },
      { value: "time", label: "Time", icon: Clock },
    ],
  },
];

const ALL_TYPE_ITEMS: TypeMenuItem[] = TYPE_MENU_GROUPS.flatMap((group) => group.items);

export interface QuestionCardHandlers {
  update: (qid: string, patch: Partial<QuestionPayload>) => void;
  setType: (qid: string, type: QuestionType) => void;
  setNavigation: (qid: string, enabled: boolean) => void;
  addAnswer: (qid: string) => void;
  updateAnswer: (qid: string, aid: string, patch: Partial<AnswerPayload>) => void;
  deleteAnswer: (qid: string, aid: string) => void;
  moveAnswer: (qid: string, aid: string, dir: -1 | 1) => void;
  reorderAnswers: (qid: string, list: AdminTriageAnswer[]) => void;
  moveQuestion: (qid: string, dir: -1 | 1) => void;
  duplicate: (q: AdminTriageQuestion) => void;
  remove: (q: AdminTriageQuestion) => void;
}

/** Draft-on-blur text input so config edits persist once, on blur. */
function ConfigText({
  value,
  placeholder,
  onCommit,
  inputMode,
}: {
  value: string;
  placeholder?: string;
  onCommit: (value: string) => void;
  inputMode?: "decimal" | "text";
}) {
  const [draft, setDraft] = useSyncedState(value);
  return (
    <TextInput
      value={draft}
      inputMode={inputMode}
      placeholder={placeholder}
      onChange={setDraft}
      onBlur={() => onCommit(draft)}
    />
  );
}

/** Inline config editor for option-less question types. */
function ConfigEditor({
  type,
  config,
  onPatch,
}: {
  type: QuestionType;
  config: QuestionConfig | null | undefined;
  onPatch: (cfg: QuestionConfig) => void;
}) {
  const cfg = config ?? {};

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
    >
      {(type === "short_text" || type === "long_text" || type === "number") && (
        <div>
          <FieldLabel>Placeholder</FieldLabel>
          <ConfigText
            value={cfg.placeholder ?? ""}
            placeholder="Helper text inside the field"
            onCommit={(v) => onPatch({ ...cfg, placeholder: v || undefined })}
          />
        </div>
      )}
      {(type === "short_text" || type === "long_text") && (
        <div>
          <FieldLabel>Max length</FieldLabel>
          <ConfigText
            value={cfg.maxLength !== undefined ? String(cfg.maxLength) : ""}
            inputMode="decimal"
            placeholder="No limit"
            onCommit={(v) =>
              onPatch({
                ...cfg,
                maxLength: v === "" ? undefined : Math.max(1, Number(v)),
              })
            }
          />
        </div>
      )}
      {type === "number" && (
        <>
          <div>
            <FieldLabel>Minimum</FieldLabel>
            <ConfigText
              value={cfg.min !== undefined ? String(cfg.min) : ""}
              inputMode="decimal"
              placeholder="No minimum"
              onCommit={(v) => onPatch({ ...cfg, min: v === "" ? undefined : Number(v) })}
            />
          </div>
          <div>
            <FieldLabel>Maximum</FieldLabel>
            <ConfigText
              value={cfg.max !== undefined ? String(cfg.max) : ""}
              inputMode="decimal"
              placeholder="No maximum"
              onCommit={(v) => onPatch({ ...cfg, max: v === "" ? undefined : Number(v) })}
            />
          </div>
        </>
      )}
      {type === "date" && (
        <>
          <div>
            <FieldLabel>Earliest date</FieldLabel>
            <ConfigText
              value={cfg.minDate ?? ""}
              placeholder="YYYY-MM-DD"
              onCommit={(v) => onPatch({ ...cfg, minDate: v || undefined })}
            />
          </div>
          <div>
            <FieldLabel>Latest date</FieldLabel>
            <ConfigText
              value={cfg.maxDate ?? ""}
              placeholder="YYYY-MM-DD"
              onCommit={(v) => onPatch({ ...cfg, maxDate: v || undefined })}
            />
          </div>
        </>
      )}
      {type === "file" && (
        <>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <FieldLabel>Multiple files</FieldLabel>
              <Toggle
                checked={cfg.multipleFiles ?? false}
                onChange={(v) => void onPatch({ ...cfg, multipleFiles: v })}
                label="Multiple files"
              />
            </div>
            <div className="flex-1">
              <FieldLabel>Allowed types</FieldLabel>
              <ConfigText
                value={(cfg.allowedTypes ?? []).join(", ")}
                placeholder="pdf, image, zip"
                onCommit={(v) =>
                  onPatch({
                    ...cfg,
                    allowedTypes: v
                      .split(",")
                      .map((s) => s.trim().toLowerCase())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          </div>
          <div>
            <FieldLabel>Max size (MB)</FieldLabel>
            <ConfigText
              value={cfg.maxFileSizeMb !== undefined ? String(cfg.maxFileSizeMb) : ""}
              inputMode="decimal"
              placeholder="No limit"
              onCommit={(v) =>
                onPatch({ ...cfg, maxFileSizeMb: v === "" ? undefined : Number(v) })
              }
            />
          </div>
        </>
      )}
      {(type === "rating" || type === "linear_scale") && (
        <>
          <div>
            <FieldLabel>Low label</FieldLabel>
            <ConfigText
              value={cfg.minLabel ?? ""}
              placeholder="e.g. Poor"
              onCommit={(v) => onPatch({ ...cfg, minLabel: v || undefined })}
            />
          </div>
          <div>
            <FieldLabel>High label</FieldLabel>
            <ConfigText
              value={cfg.maxLabel ?? ""}
              placeholder="e.g. Excellent"
              onCommit={(v) => onPatch({ ...cfg, maxLabel: v || undefined })}
            />
          </div>
        </>
      )}
    </motion.div>
  );
}

/** Destination edition used for option-less questions (their default route). */
function DefaultDestinationEditor({
  question,
  allQuestions,
  onPatch,
}: {
  question: AdminTriageQuestion;
  allQuestions: AdminTriageQuestion[];
  onPatch: (patch: Partial<QuestionPayload>) => void;
}) {
  const [kind, setKind] = useSyncedState<DestKind>(question.defaultNextQuestionId ? "next" : question.defaultAuditType ? "audit" : question.defaultDestinationType ?? "");
  const [value, setValue] = useSyncedState<string>(question.defaultNextQuestionId ?? question.defaultAuditType ?? question.defaultDestinationType ?? "");
  const [target, setTarget] = useSyncedString(question.defaultDestinationTarget ?? "");

  const questionOptions = allQuestions
    .filter((q) => q.id !== question.id)
    .map((q) => ({ value: q.id, label: q.text || `Untitled question` }));

  const apply = (nextKind: DestKind, nextValue: string) => {
    const isAnyDest = nextKind !== "next" && nextKind !== "audit";
    onPatch({
      defaultNextQuestionId: nextKind === "next" ? nextValue || null : null,
      defaultAuditType: nextKind === "audit" ? (nextValue as TriageAuditType) || null : null,
      defaultDestinationType: isAnyDest ? (nextValue as TriageDestinationType) || null : null,
      defaultDestinationTarget: isAnyDest ? target.trim() || null : null,
    });
  };

  return (
    <div className="flex flex-col gap-3 mt-3 rounded-2xl bg-slate-50/70 p-4">
      <FieldLabel hint="Option-less questions route every answer through one destination.">
        Default destination
      </FieldLabel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SelectField<DestKind>
          value={kind}
          placeholder="— Choose destination —"
          options={[
            { value: "next", label: "Next question" },
            { value: "audit", label: "Audit type" },
            ...DESTINATION_OPTIONS.map((o) => ({
              value: o.value as DestKind,
              label: o.label,
            })),
          ]}
          onChange={(nextKind) => {
            if (nextKind === kind) return;
            if (nextKind === "next") setValue("");
            if (nextKind === "audit") setValue("");
            setKind(nextKind);
          }}
        />
        {kind === "next" && questionOptions.length > 0 && (
          <SelectField
            value={value}
            placeholder="— Next question —"
            options={questionOptions}
            onChange={(v) => {
              setValue(String(v));
              apply("next", String(v));
            }}
          />
        )}
        {kind === "next" && questionOptions.length === 0 && (
          <span className="text-sm text-slate-400 font-semibold">
            No other questions yet — add one first.
          </span>
        )}
        {kind === "audit" && (
          <SelectField
            value={value}
            placeholder="— Audit type —"
            options={AUDIT_OPTIONS}
            onChange={(v) => {
              setValue(String(v));
              apply("audit", String(v));
            }}
          />
        )}
        {kind !== "" && kind !== "next" && kind !== "audit" && (
          <>
            <SelectField
              value={value}
              placeholder="— Destination —"
              options={DESTINATION_OPTIONS}
              onChange={(v) => {
                setValue(String(v));
                apply(kind, String(v));
              }}
            />
            {DEST_TARGET_KINDS.has(kind as TriageDestinationType) && (
              <TextInput
                value={target}
                placeholder="Destination target (e.g. sector)"
                onChange={setTarget}
                onBlur={() => apply(kind, value)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** One answer option: label, internal value/tag and its conditional route. */
function AnswerOptionRow({
  question,
  answer,
  allQuestions,
  navOn,
  onPatch,
  onDelete,
  onMove,
  locked = false,
  dragHandle,
}: {
  question: AdminTriageQuestion;
  answer: AdminTriageAnswer;
  allQuestions: AdminTriageQuestion[];
  navOn: boolean;
  onPatch: (patch: Partial<AnswerPayload>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  /** For yes_no the option set is fixed — hide add/remove/reorder controls. */
  locked?: boolean;
  /** Optional props spread onto the drag handle button. */
  dragHandle?: {
    onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
  };
}) {
  const [labelDraft, setLabelDraft] = useSyncedString(answer.text);
  const [internalDraft, setInternalDraft] = useSyncedString(answer.internalValue ?? "");
  const [tagDraft, setTagDraft] = useSyncedString(answer.tag ?? "");
  const [targetDraft, setTargetDraft] = useSyncedString(answer.destinationTarget ?? "");
  const [goToValue, setGoToValue] = useSyncedState<string>(goToValueOf(answer));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const questionOptions = useMemo(
    () =>
      allQuestions
        .filter((q) => q.id !== question.id && q.isActive)
        .map((q) => ({ value: q.id, label: questionStepLabel(q) })),
    [allQuestions, question.id]
  );

  const goToOptions = useMemo(() => {
    const ends = DESTINATION_OPTIONS.map((o) => ({
      value: endTokenOf(o.value),
      label: `End / Submit — ${o.label}`,
    }));
    return [
      { value: GO_TO_NEXT, label: "Next question" },
      ...questionOptions,
      ...ends,
    ];
  }, [questionOptions]);

  const selectedEnd = destinationOfEndToken(goToValue);
  const targetKind =
    selectedEnd && DEST_TARGET_KINDS.has(selectedEnd as TriageDestinationType)
      ? (selectedEnd as TriageDestinationType)
      : null;

  const destinationProblem = (() => {
    if (!answer.nextQuestionId) return null;
    if (answer.nextQuestionId === question.id) {
      return "An answer cannot lead back to the same question.";
    }
    if (!allQuestions.some((q) => q.id === answer.nextQuestionId)) {
      return "This option points to a question that no longer exists.";
    }
    if (!allQuestions.some((q) => q.id === answer.nextQuestionId && q.isActive)) {
      return "This option points to a question that is inactive.";
    }
    return null;
  })();

  const commitGoTo = (option: string) => {
    setGoToValue(option);
    const end = destinationOfEndToken(option);
    if (end) {
      onPatch({
        nextQuestionId: null,
        auditType: null,
        destinationType: end as TriageDestinationType,
        destinationTarget: DEST_TARGET_KINDS.has(end as TriageDestinationType)
          ? targetDraft.trim() || null
          : null,
      });
      return;
    }
    if (option === GO_TO_NEXT) {
      const nextId = nextLinearId(question, allQuestions);
      onPatch(
        nextId
          ? { nextQuestionId: nextId, auditType: null, destinationType: null, destinationTarget: null }
          : {
              nextQuestionId: null,
              auditType: null,
              destinationType: "HUMAN_REVIEW" as TriageDestinationType,
              destinationTarget: null,
            }
      );
      return;
    }
    onPatch({ nextQuestionId: option, auditType: null, destinationType: null, destinationTarget: null });
  };

  return (
    <div className="rounded-2xl bg-slate-50/70 p-3">
      <div className="flex items-start gap-2">
        {!locked && dragHandle && (
          <button
            type="button"
            aria-label="Drag to reorder option"
            title="Drag to reorder"
            onPointerDown={dragHandle.disabled ? undefined : dragHandle.onPointerDown}
            style={{ cursor: dragHandle.disabled ? "default" : "grab" }}
            className="mt-2 shrink-0 touch-none text-slate-300 hover:text-orange-500 transition-colors"
          >
            <GripVertical size={16} />
          </button>
        )}
        {!locked && (
          <div className="hidden flex-col pt-2 sm:flex">
            <button
              type="button"
              aria-label="Move option up"
              onClick={() => onMove(-1)}
              className="text-slate-300 hover:text-orange-500 transition-colors"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              aria-label="Move option down"
              onClick={() => onMove(1)}
              className="text-slate-300 hover:text-orange-500 transition-colors"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <TextInput
            value={labelDraft}
            disabled={locked}
            placeholder="Option label"
            onChange={(v) => setLabelDraft(v)}
            onBlur={() => {
              if (labelDraft.trim() && labelDraft.trim() !== answer.text) {
                onPatch({ text: labelDraft.trim() });
              } else if (!labelDraft.trim()) {
                setLabelDraft(answer.text);
              }
            }}
          />
          {navOn ? (
            <div className="flex flex-col gap-2 rounded-xl bg-orange-50/60 border border-orange-100 px-3 py-2.5">
              <FieldLabel>After selecting this answer, go to:</FieldLabel>
              <SelectField
                value={goToValue}
                placeholder="— Choose destination —"
                options={goToOptions}
                onChange={commitGoTo}
              />
              {targetKind && (
                <TextInput
                  value={targetDraft}
                  placeholder="Target (e.g. sector)"
                  onChange={setTargetDraft}
                  onBlur={() => {
                    const trimmed = targetDraft.trim();
                    if (trimmed !== (answer.destinationTarget ?? "")) {
                      onPatch({ destinationTarget: trimmed || null });
                    }
                  }}
                />
              )}
              {destinationProblem && (
                <p role="alert" className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <AlertTriangle size={12} className="shrink-0" />
                  {destinationProblem}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium">
              By default, this option continues to the next question.
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            type="button"
            aria-label="Advanced fields for this option"
            onClick={() => setShowAdvanced((v) => !v)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Settings2 size={14} />
          </button>
          {!locked && (
            <button
              type="button"
              aria-label="Remove option"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Minus size={14} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-50"
          >
            <div>
              <FieldLabel hint="Never shown to respondents.">Internal value</FieldLabel>
              <TextInput
                value={internalDraft}
                placeholder="E.g. has_excess_stock"
                onChange={(v) => setInternalDraft(v)}
                onBlur={() => {
                  if (internalDraft.trim() !== (answer.internalValue ?? "")) {
                    onPatch({ internalValue: internalDraft.trim() || null });
                  }
                }}
              />
            </div>
            <div>
              <FieldLabel>Tag</FieldLabel>
              <TextInput
                value={tagDraft}
                placeholder="E.g. ready / not-ready"
                onChange={(v) => setTagDraft(v)}
                onBlur={() => {
                  if (tagDraft.trim() !== (answer.tag ?? "")) {
                    onPatch({ tag: tagDraft.trim() || null });
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Question type dropdown with icons on the left and visual group dividers. */
function TypeSelect({
  value,
  onSelect,
  disabled,
}: {
  value: QuestionType;
  onSelect: (type: QuestionType) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = ALL_TYPE_ITEMS.find((item) => item.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const CurrentIcon = current?.icon ?? ChevronDown;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-orange-400 disabled:opacity-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <CurrentIcon size={15} className="shrink-0 text-orange-500" />
          <span className="truncate">{typeLabel(value)}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            role="listbox"
            className="absolute left-0 z-30 mt-2 max-h-96 w-full min-w-[220px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/10"
          >
            {TYPE_MENU_GROUPS.map((group, gi) => (
              <div key={group.group} className={gi > 0 ? "mt-1 border-t border-slate-100 pt-1.5" : ""}>
                <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = item.value === value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelect(item.value);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    >
                      <ItemIcon size={15} className="shrink-0 text-slate-400" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isSelected && <CheckCircle2 size={14} className="shrink-0 text-orange-500" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Draggable wrapper for one answer option; drag starts from the handle only. */
function AnswerItem({
  answer,
  locked,
  children,
}: {
  answer: AdminTriageAnswer;
  locked: boolean;
  children: (handleProps: {
    onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
  }) => React.ReactNode;
}) {
  const controls = useDragControls();
  if (locked) return <>{children({ disabled: true })}</>;
  return (
    <Reorder.Item
      value={answer}
      dragListener={false}
      dragControls={controls}
      className="rounded-2xl"
    >
      {children({ onPointerDown: (e) => controls.start(e) })}
    </Reorder.Item>
  );
}

export function QuestionCard({
  question,
  allQuestions,
  position,
  isFirst,
  isLast,
  handlers,
  canDelete,
  collapsed,
  onToggleCollapse,
  anchorId,
}: {
  question: AdminTriageQuestion;
  allQuestions: AdminTriageQuestion[];
  /** 1-based position in the flow, shown as "Question N". */
  position: number;
  isFirst: boolean;
  isLast: boolean;
  handlers: QuestionCardHandlers;
  canDelete: boolean;
  /** Collapsed cards show a compact summary; purely UI state. */
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** DOM id used by jump-to-question scrolling. */
  anchorId: string;
}) {
  const [descDraft, setDescDraft] = useSyncedString(question.description ?? "");
  const [showConfig, setShowConfig] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const cardControls = useDragControls();

  const type = question.type;
  const isChoice = isChoiceType(type);
  const isYesNo = type === "yes_no";
  const navOn = responseNavigationOn(question, allQuestions);
  // Local-first route status from the live draft — the server `hasAuditPath`
  // snapshot goes stale the moment the draft is edited, so it must not drive
  // this badge. Linear questions (nav off) simply continue or end the form.
  const routeStatus = useMemo(
    () => routeStatusOf(question, allQuestions),
    [question, allQuestions]
  );
  const routeTarget =
    routeStatus?.kind === "next"
      ? allQuestions.find((q) => q.id === routeStatus.nextId)
      : undefined;
  const routeTargetLabel = routeTarget ? questionStepLabel(routeTarget) : null;
  const richHtml = question.config?.contentHtml ?? "";
  const activeAnswers = question.answers
    .filter((a) => a.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const commitQuestionText = (html: string, plain: string): boolean => {
    const trimmed = plain.trim();
    if (!trimmed) return false;
    const nextHtml = html.trim();
    const patch: Partial<QuestionPayload> = {};
    if (trimmed !== question.text) patch.text = trimmed;
    if (isFormattedHtml(nextHtml, trimmed)) {
      if (nextHtml !== richHtml) patch.config = { ...question.config, contentHtml: nextHtml };
    } else if (richHtml) {
      const config = { ...question.config };
      delete config.contentHtml;
      patch.config = config;
    }
    if (Object.keys(patch).length > 0) handlers.update(question.id, patch);
    return true;
  };

  const commitDescription = () => {
    const trimmed = descDraft.trim();
    if (trimmed !== (question.description ?? "")) {
      handlers.update(question.id, { description: trimmed || null });
    }
  };

  return (
    <Reorder.Item
      value={question}
      id={question.id}
      dragListener={false}
      dragControls={cardControls}
      className="rounded-3xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="scroll-mt-20 p-4 sm:p-6 sm:scroll-mt-72" id={anchorId}>
        {/* Card header: number + title + actions */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <button
            type="button"
            aria-label="Drag to reorder question"
            title="Drag to reorder"
            onPointerDown={(e) => cardControls.start(e)}
            className="shrink-0 touch-none cursor-grab text-slate-300 hover:text-orange-500 active:cursor-grabbing transition-colors"
          >
            <GripVertical size={16} />
          </button>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
            {position}
          </span>
          <span className="text-sm font-extrabold text-slate-900">
            Question {position}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              disabled={isFirst}
              onClick={() => handlers.moveQuestion(question.id, -1)}
              aria-label="Move question up"
              title="Move question up"
              className="hidden rounded-lg p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-30 sm:block"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={() => handlers.moveQuestion(question.id, 1)}
              aria-label="Move question down"
              title="Move question down"
              className="hidden rounded-lg p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-30 sm:block"
            >
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              onClick={() => handlers.duplicate(question)}
              aria-label="Duplicate question"
              title="Duplicate question"
              className="rounded-lg p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              disabled={!canDelete}
              onClick={() => handlers.remove(question)}
              aria-label="Delete question"
              title="Delete question"
              className="rounded-lg p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand question" : "Collapse question"}
              title={collapsed ? "Expand question" : "Collapse question"}
              aria-expanded={!collapsed}
              className="rounded-lg p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            >
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>
        {/* Status badges: route, type, required, branching */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {routeStatus?.kind === "attention" ? (
            <span
              title={routeStatus.reason}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            >
              <AlertTriangle size={11} /> Needs attention
            </span>
          ) : routeStatus?.kind === "ok" ? (
            <span
              title="Every answer has a valid destination."
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            >
              <CheckCircle2 size={11} /> Routing configured
            </span>
          ) : routeStatus?.kind === "next" ? (
            <span
              title={routeTargetLabel ? `Continues to ${routeTargetLabel}` : "Continues to the next question"}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            >
              <ArrowRight size={11} /> Next question
            </span>
          ) : routeStatus?.kind === "end" ? (
            <span
              title="This is the last step — the form ends here"
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            >
              <Flag size={11} /> End / Submit
            </span>
          ) : null}
          <span className="rounded-full bg-slate-100 text-slate-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
            {typeLabel(type)}
          </span>
          {question.required && (
            <span
              title="Respondents must answer this question"
              className="rounded-full bg-orange-50 text-orange-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            >
              Required
            </span>
          )}
          {navOn && isChoice && (
            <span
              title="Each answer routes to its own destination"
              className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            >
              <GitBranch size={11} /> Branching
            </span>
          )}
        </div>

        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={`Expand Question ${position}`}
            className="mt-3 w-full rounded-2xl bg-slate-50/70 px-4 py-3 text-left transition-colors hover:bg-slate-100"
          >
            <p className="truncate text-sm font-bold text-slate-800">
              {question.text?.trim() || "Untitled question"}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
              {typeLabel(type)}
              {isChoice
                ? ` • ${activeAnswers.length} option${activeAnswers.length === 1 ? "" : "s"}`
                : " • Free answer"}
              {navOn && isChoice ? " • Branching" : ""}
              {question.required ? " • Required" : ""}
            </p>
          </button>
        ) : (
          <>
            <div className="mb-4 mt-4 border-t border-slate-100" />

        {/* Question text + type selector — side-by-side on desktop, stacked on mobile */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <QuestionTextEditor
              initialHtml={editorHtmlOf(question.text, question.config?.contentHtml)}
              onCommit={commitQuestionText}
            />
          </div>
          <div className="w-full shrink-0 sm:w-[220px] lg:w-[236px]">
            <TypeSelect value={type} onSelect={(next) => handlers.setType(question.id, next)} />
          </div>
        </div>
        <div className="mt-2">
          <TextArea
            value={descDraft}
            placeholder="Description / help text (optional)"
            rows={1}
            onChange={(v) => setDescDraft(v)}
            onBlur={commitDescription}
          />
        </div>

        {/* Row: required + active */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            Required
            <Toggle
              checked={question.required}
              onChange={(v) => handlers.update(question.id, { required: v })}
              label="Required"
            />
          </label>
          <button
            type="button"
            onClick={() => handlers.update(question.id, { isActive: !question.isActive })}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
            style={
              question.isActive
                ? { backgroundColor: "#ecfdf5", color: "#059669" }
                : { backgroundColor: "#f1f5f9", color: "#64748b" }
            }
          >
            <span className="h-2 w-2 rounded-full" style={{ background: question.isActive ? "#10b981" : "#94a3b8" }} />
            {question.isActive ? "Active" : "Inactive"}
          </button>
        </div>

        {/* Choice questions: answer options */}
        {isChoice ? (
          <div className="mt-5 space-y-2">
            {/* Response-based navigation toggle */}
            <div className="rounded-2xl bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-700">
                    Response-based navigation
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400 font-medium leading-snug">
                    {navOn
                      ? "Each answer below can send respondents to a specific question or the end of the form."
                      : "Every answer continues to the next question. Switch this on to route each answer yourself."}
                  </div>
                </div>
                <Toggle
                  checked={navOn}
                  onChange={(v) => handlers.setNavigation(question.id, v)}
                  label="Response-based navigation"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <FieldLabel
                hint={
                  navOn
                    ? isYesNo
                      ? "Yes and No are provided automatically — choose where each one leads below."
                      : "Choose where each answer leads below."
                    : isYesNo
                      ? "Yes and No are provided automatically."
                      : "By default each answer continues to the next question."
                }
              >
                Answer options
              </FieldLabel>
              {!isYesNo && (
                <button
                  type="button"
                  onClick={() => handlers.addAnswer(question.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-xs font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  <Plus size={13} /> Add option
                </button>
              )}
            </div>
            {activeAnswers.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center text-sm text-slate-400 font-medium">
                No options yet — add at least one option.
              </p>
            ) : isYesNo ? (
              activeAnswers.map((answer) => (
                <AnswerOptionRow
                  key={answer.id}
                  question={question}
                  answer={answer}
                  allQuestions={allQuestions}
                  navOn={navOn}
                  locked
                  dragHandle={{ disabled: true }}
                  onPatch={(patch) => handlers.updateAnswer(question.id, answer.id, patch)}
                  onDelete={() => handlers.deleteAnswer(question.id, answer.id)}
                  onMove={(dir) => handlers.moveAnswer(question.id, answer.id, dir)}
                />
              ))
            ) : (
              <Reorder.Group
                axis="y"
                values={activeAnswers}
                onReorder={(list) => handlers.reorderAnswers(question.id, list)}
                className="space-y-2"
              >
                {activeAnswers.map((answer) => (
                  <AnswerItem key={answer.id} answer={answer} locked={false}>
                    {(handleProps) => (
                      <AnswerOptionRow
                        question={question}
                        answer={answer}
                        allQuestions={allQuestions}
                        navOn={navOn}
                        dragHandle={handleProps}
                        onPatch={(patch) => handlers.updateAnswer(question.id, answer.id, patch)}
                        onDelete={() => handlers.deleteAnswer(question.id, answer.id)}
                        onMove={(dir) => handlers.moveAnswer(question.id, answer.id, dir)}
                      />
                    )}
                  </AnswerItem>
                ))}
              </Reorder.Group>
            )}
          </div>
        ) : (
          <DefaultDestinationEditor
            question={question}
            allQuestions={allQuestions}
            onPatch={(patch) => handlers.update(question.id, patch)}
          />
        )}

        {/* Config / advanced toggles for option-less types */}
        {!isChoice && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setShowConfig((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Settings2 size={13} />
              {showConfig ? "Hide config" : "Config"}
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ChevronDown size={13} />
              {showAdvanced ? "Hide advanced" : "Advanced"}
            </button>
          </div>
        )}

        {!isChoice && showConfig && (
          <ConfigEditor
            type={type}
            config={question.config}
            onPatch={(cfg) => handlers.update(question.id, { config: cfg })}
          />
        )}
        {!isChoice && showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 rounded-2xl bg-slate-50/70 p-4"
          >
            <div>
              <FieldLabel>Icon (lucide name)</FieldLabel>
              <TextInput
                value={question.icon ?? ""}
                placeholder="e.g. Building2"
                onChange={(v) => void handlers.update(question.id, { icon: v.trim() || null })}
              />
            </div>
            <div>
              <FieldLabel>Hint shown to respondents</FieldLabel>
              <TextInput
                value={question.hint ?? ""}
                placeholder="Optional helper line"
                onChange={(v) => void handlers.update(question.id, { hint: v.trim() || null })}
              />
            </div>
          </motion.div>
        )}
          </>
        )}
      </div>
    </Reorder.Item>
  );
}