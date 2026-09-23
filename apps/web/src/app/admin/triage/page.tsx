"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Edit3,
    Trash2,
    X,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    ListPlus,
    ArrowRight,
    GitBranch,
    Power,
    PowerOff,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    Eye,
    Info,
    Type
} from "lucide-react";
import { useAdminTriageQuestions, triageApi } from "@/services/triage/hooks";
import { DESTINATION_LABELS, isChoiceType, isMultiSelectType } from "@/services/triage/types";
import type {
    AdminTriageAnswer,
    AdminTriageQuestion,
    BuilderDestinationKind,
    QuestionConfig,
    QuestionType,
    TriageAuditType,
    TriageDestinationType,
    TriagePublicQuestion,
} from "@/services/triage/types";
import { QuestionInput } from "@/components/preAudit/QuestionInput";
import { AUDIT_STRATEGIES } from "@/types/audit";

const AUDIT_OPTIONS: { value: string; label: string }[] = Object.keys(AUDIT_STRATEGIES).map((value) => ({
    value,
    label: value === "SHORT_FORM" ? "Short Audit" : "Large Audit",
}));

const auditLabel = (value: string | null) =>
    value === "SHORT_FORM" ? "Short Audit" : value === "LONG_FORM" ? "Large Audit" : value ?? "—";

const destLabel = (value: string | null) =>
    value && value in DESTINATION_LABELS
        ? DESTINATION_LABELS[value as TriageDestinationType]
        : value ?? "—";

const DESTINATION_OPTIONS: { value: string; label: string }[] = (
    Object.keys(DESTINATION_LABELS) as TriageDestinationType[]
).map((value) => ({ value, label: DESTINATION_LABELS[value] }));

/** Destination "kind" selected in the forms: next, legacy audit, or a destination type. */
type DestKind = BuilderDestinationKind | TriageDestinationType;

/** True for destination kinds that accept an optional target payload. */
const DEST_TARGET_KINDS: ReadonlySet<TriageDestinationType> = new Set<TriageDestinationType>([
    "SECTOR",
    "MCOM",
    "CUSTOM",
]);

interface QuestionTypeOption {
    value: QuestionType;
    label: string;
    description: string;
}

const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
    { value: "single_choice", label: "Multiple Choice", description: "Pick one option" },
    { value: "multiple_choice", label: "Checkboxes", description: "Pick several options" },
    { value: "checkbox", label: "Checkbox", description: "Multi-select (single column)" },
    { value: "dropdown", label: "Dropdown", description: "Pick one from a list" },
    { value: "yes_no", label: "Yes / No", description: "Two auto-created options" },
    { value: "short_text", label: "Short Answer", description: "One line of text" },
    { value: "long_text", label: "Paragraph", description: "Longer text" },
    { value: "number", label: "Number", description: "Numeric answer" },
    { value: "date", label: "Date", description: "Calendar date picker" },
    { value: "time", label: "Time", description: "Time picker" },
    { value: "file", label: "File Upload", description: "Attach a file (metadata)" },
    { value: "rating", label: "Rating", description: "Stars-style choice (1–N)" },
    { value: "linear_scale", label: "Linear Scale", description: "Scale with labels" },
];

const typeLabel = (value: QuestionType | null) =>
    QUESTION_TYPE_OPTIONS.find((opt) => opt.value === value)?.label ?? "Single/Choice";

// ============================================================
// Question form model
// ============================================================

interface QuestionForm {
    text: string;
    description: string;
    hint: string;
    type: QuestionType;
    required: boolean;
    order: string;
    isActive: boolean;
    destType: DestKind;
    destTarget: string;
    destValue: string;
    cfgPlaceholder: string;
    cfgMaxLength: string;
    cfgMin: string;
    cfgMax: string;
    cfgStep: string;
    cfgMinDate: string;
    cfgMaxDate: string;
    cfgMultipleFiles: boolean;
    cfgAllowedTypes: string;
    cfgMaxFileSizeMb: string;
    cfgMinLabel: string;
    cfgMaxLabel: string;
}

const defaultQuestionForm = (order: number): QuestionForm => ({
    text: "",
    description: "",
    hint: "",
    type: "single_choice",
    required: true,
    order: String(order),
    isActive: true,
    destType: "",
    destTarget: "",
    destValue: "",
    cfgPlaceholder: "",
    cfgMaxLength: "",
    cfgMin: "",
    cfgMax: "",
    cfgStep: "1",
    cfgMinDate: "",
    cfgMaxDate: "",
    cfgMultipleFiles: false,
    cfgAllowedTypes: "",
    cfgMaxFileSizeMb: "",
    cfgMinLabel: "",
    cfgMaxLabel: "",
});

const EMPTY_CONFIG: QuestionConfig = {};

function buildConfig(form: QuestionForm): QuestionConfig {
    const cfg: QuestionConfig = {};
    if (form.cfgPlaceholder) cfg.placeholder = form.cfgPlaceholder;
    if (form.cfgMaxLength) cfg.maxLength = parseInt(form.cfgMaxLength, 10);
    if (form.cfgMin !== "") cfg.min = Number(form.cfgMin);
    if (form.cfgMax !== "") cfg.max = Number(form.cfgMax);
    if (form.cfgStep) cfg.step = Number(form.cfgStep);
    if (form.cfgMinDate) cfg.minDate = form.cfgMinDate;
    if (form.cfgMaxDate) cfg.maxDate = form.cfgMaxDate;
    if (form.cfgMultipleFiles) cfg.multipleFiles = true;
    if (form.cfgAllowedTypes.trim()) {
        cfg.allowedTypes = form.cfgAllowedTypes
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
    }
    if (form.cfgMaxFileSizeMb) cfg.maxFileSizeMb = Number(form.cfgMaxFileSizeMb);
    if (form.cfgMinLabel) cfg.minLabel = form.cfgMinLabel;
    if (form.cfgMaxLabel) cfg.maxLabel = form.cfgMaxLabel;
    return cfg;
}

// ============================================================
// Page
// ============================================================

export default function AdminTriagePage() {
    const { data: questions, loading, error, refresh } = useAdminTriageQuestions();

    const [questionModal, setQuestionModal] = useState<{ open: boolean; editing: AdminTriageQuestion | null }>({ open: false, editing: null });
    const [answerModal, setAnswerModal] = useState<{ open: boolean; editing: AdminTriageAnswer | null; questionId: string; questionType: QuestionType }>({ open: false, editing: null, questionId: "", questionType: "single_choice" });

    const [qForm, setQForm] = useState<QuestionForm>(defaultQuestionForm(1));
    const [aForm, setAForm] = useState({ text: "", isActive: true, destType: "" as DestKind, destValue: "", destTarget: "" });

    const [previewValue, setPreviewValue] = useState<unknown>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const [confirmTarget, setConfirmTarget] = useState<{ kind: "question" | "answer"; id: string } | null>(null);
    const confirmTimer = useRef<any>(null);

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const toastTimer = useRef<any>(null);

    const questionById = useMemo(() => {
        const map = new Map<string, AdminTriageQuestion>();
        (questions ?? []).forEach((q) => map.set(q.id, q));
        return map;
    }, [questions]);

    const questionsWithIssues = useMemo(
        () => (questions ?? []).filter((q) => !q.hasAuditPath && q.isActive),
        [questions]
    );

    useEffect(() => () => { clearTimeout(confirmTimer.current); clearTimeout(toastTimer.current); }, []);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    };

    const optionless = isChoiceType(qForm.type) === false;

    const openCreateQuestion = () => {
        setQForm(defaultQuestionForm((questions?.length ?? 0) + 1));
        setPreviewValue(null);
        setModalError(null);
        setQuestionModal({ open: true, editing: null });
    };

    const openEditQuestion = (q: AdminTriageQuestion) => {
        const cfg = q.config ?? EMPTY_CONFIG;
        setQForm({
            text: q.text,
            description: q.description ?? "",
            hint: q.hint ?? "",
            type: q.type,
            required: q.required,
            order: String(q.order ?? 0),
            isActive: q.isActive,
            destType: q.defaultNextQuestionId ? "next" : q.defaultAuditType ? "audit" : q.defaultDestinationType ?? "",
            destValue: q.defaultNextQuestionId ?? q.defaultAuditType ?? q.defaultDestinationType ?? "",
            destTarget: q.defaultDestinationTarget ?? "",
            cfgPlaceholder: cfg.placeholder ?? "",
            cfgMaxLength: cfg.maxLength !== undefined ? String(cfg.maxLength) : "",
            cfgMin: cfg.min !== undefined ? String(cfg.min) : "",
            cfgMax: cfg.max !== undefined ? String(cfg.max) : "",
            cfgStep: cfg.step !== undefined ? String(cfg.step) : "1",
            cfgMinDate: cfg.minDate ?? "",
            cfgMaxDate: cfg.maxDate ?? "",
            cfgMultipleFiles: cfg.multipleFiles ?? false,
            cfgAllowedTypes: (cfg.allowedTypes ?? []).join(", "),
            cfgMaxFileSizeMb: cfg.maxFileSizeMb !== undefined ? String(cfg.maxFileSizeMb) : "",
            cfgMinLabel: cfg.minLabel ?? "",
            cfgMaxLabel: cfg.maxLabel ?? "",
        });
        setPreviewValue(null);
        setModalError(null);
        setQuestionModal({ open: true, editing: q });
    };

    const openCreateAnswer = (q: AdminTriageQuestion) => {
        setAForm({ text: "", isActive: true, destType: "", destValue: "", destTarget: "" });
        setModalError(null);
        setAnswerModal({ open: true, editing: null, questionId: q.id, questionType: q.type });
    };

    const openEditAnswer = (a: AdminTriageAnswer) => {
        const destType: DestKind = a.nextQuestionId ? "next" : a.auditType ? "audit" : a.destinationType ?? "";
        setAForm({
            text: a.text,
            isActive: a.isActive,
            destType,
            destValue: a.nextQuestionId ?? a.auditType ?? a.destinationType ?? "",
            destTarget: a.destinationTarget ?? "",
        });
        setModalError(null);
        setAnswerModal({ open: true, editing: a, questionId: a.questionId, questionType: questionById.get(a.questionId)?.type ?? "single_choice" });
    };

    const closeModals = () => {
        if (isSubmitting) return;
        setQuestionModal({ open: false, editing: null });
        setAnswerModal({ open: false, editing: null, questionId: "", questionType: "single_choice" });
    };

    // ---- Question submit ----
    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = qForm.text.trim();
        if (!text) {
            setModalError("Question text cannot be empty.");
            return;
        }
        const order = parseInt(qForm.order, 10);
        if (Number.isNaN(order) || order < 0) {
            setModalError("Order must be a whole number.");
            return;
        }

        if (optionless) {
            if (qForm.destType === "") {
                setModalError(
                    "Choose a destination for this question: a next question or a destination type."
                );
                return;
            }
            if (!qForm.destValue) {
                setModalError("Select the destination question, audit, or destination type.");
                return;
            }
        }

        const isAnyDest = qForm.destType !== "next" && qForm.destType !== "audit";
        const payload = {
            text,
            type: qForm.type,
            description: qForm.description.trim() || null,
            hint: qForm.hint.trim() || null,
            required: qForm.required,
            config: buildConfig(qForm),
            order,
            isActive: qForm.isActive,
            ...(optionless
                ? {
                      defaultNextQuestionId: qForm.destType === "next" ? qForm.destValue : null,
                      defaultAuditType: qForm.destType === "audit" ? (qForm.destValue as TriageAuditType) : null,
                      defaultDestinationType: isAnyDest ? (qForm.destValue as TriageDestinationType) : null,
                      defaultDestinationTarget: isAnyDest ? (qForm.destTarget.trim() || null) : null,
                  }
                : {
                      defaultNextQuestionId: null,
                      defaultAuditType: null,
                      defaultDestinationType: null,
                      defaultDestinationTarget: null,
                  }),
        };

        setIsSubmitting(true);
        setModalError(null);
        try {
            if (questionModal.editing) {
                await triageApi.updateQuestion(questionModal.editing.id, payload);
                showToast("Question updated.");
            } else {
                await triageApi.createQuestion(payload);
                showToast("Question created.");
            }
            refresh();
            setQuestionModal({ open: false, editing: null });
        } catch (err: any) {
            setModalError(err?.message ?? "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---- Answer submit ----
    const handleAnswerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = aForm.text.trim();
        if (!text) {
            setModalError("Answer text cannot be empty.");
            return;
        }
        if (aForm.destType === "") {
            setModalError("Choose a destination for this answer: a next question or a destination type.");
            return;
        }
        if (!aForm.destValue) {
            setModalError("Select the destination question, audit, or destination type for this answer.");
            return;
        }
        if (aForm.destType === "next" && aForm.destValue === answerModal.questionId) {
            setModalError("An answer cannot point back to the question it belongs to.");
            return;
        }

        const isAnyDest = aForm.destType !== "next" && aForm.destType !== "audit";
        const payload = {
            text,
            isActive: aForm.isActive,
            nextQuestionId: aForm.destType === "next" ? aForm.destValue : null,
            auditType: aForm.destType === "audit" ? (aForm.destValue as TriageAuditType) : null,
            destinationType: isAnyDest ? (aForm.destValue as TriageDestinationType) : null,
            destinationTarget: isAnyDest ? (aForm.destTarget.trim() || null) : null,
        };

        setIsSubmitting(true);
        setModalError(null);
        try {
            if (answerModal.editing) {
                await triageApi.updateAnswer(answerModal.editing.id, payload);
                showToast("Answer updated.");
            } else {
                await triageApi.createAnswer(answerModal.questionId, payload);
                showToast("Answer added.");
            }
            refresh();
            setAnswerModal({ open: false, editing: null, questionId: "", questionType: "single_choice" });
        } catch (err: any) {
            setModalError(err?.message ?? "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---- Answer reorder ----
    const handleMove = async (question: AdminTriageQuestion, answer: AdminTriageAnswer, direction: -1 | 1) => {
        const active = question.answers
            .filter((a) => a.isActive)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        const index = active.findIndex((a) => a.id === answer.id);
        const swap = active[index + direction];
        if (!swap) return;

        const temp = answer.sortOrder ?? 0;
        const swapOrder = swap.sortOrder ?? 0;
        if (temp === swapOrder) {
            // Give the swap target a distinct order if keys collide.
            const maxOrder = active.reduce((m, a) => Math.max(m, a.sortOrder ?? 0), 0);
            await triageApi.updateAnswer(swap.id, { sortOrder: maxOrder + 1 });
        }
        try {
            await triageApi.updateAnswer(answer.id, { sortOrder: swapOrder });
            await triageApi.updateAnswer(swap.id, { sortOrder: temp });
        } catch {
            showToast("Could not reorder options.", "error");
        }
        refresh();
    };

    // ---- Delete / deactivate ----
    const handleDelete = async (kind: "question" | "answer", id: string) => {
        if (confirmTarget?.kind !== kind || confirmTarget?.id !== id) {
            setConfirmTarget({ kind, id });
            clearTimeout(confirmTimer.current);
            confirmTimer.current = setTimeout(() => setConfirmTarget(null), 4000);
            return;
        }
        setConfirmTarget(null);
        try {
            if (kind === "question") {
                const res = await triageApi.deleteQuestion(id);
                showToast(res?.message ?? "Question deleted.");
            } else {
                const res = await triageApi.deleteAnswer(id);
                showToast(res?.message ?? "Answer deactivated.");
            }
            refresh();
        } catch (err: any) {
            showToast(err?.message ?? "Failed to delete.", "error");
        }
    };

    // ---- Activate / Deactivate toggle ----
    const handleToggleActive = async (q: AdminTriageQuestion) => {
        try {
            const res = await triageApi.updateQuestion(q.id, { isActive: !q.isActive });
            showToast(res?.isActive ? "Question activated." : "Question deactivated.");
            refresh();
        } catch (err: any) {
            showToast(err?.message ?? "Failed to update question.", "error");
        }
    };

    const hasIssues = questionsWithIssues.length > 0;
    const nextQuestionOptions = (questions ?? [])
        .filter((q) => q.id !== answerModal.questionId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const previewQuestion: TriagePublicQuestion = {
        id: "preview",
        text: qForm.text.trim() || "Your question previews here",
        type: qForm.type,
        description: qForm.description.trim() || null,
        hint: qForm.hint.trim() || null,
        required: qForm.required,
        config: buildConfig(qForm),
        defaultNextQuestionId: qForm.destType === "next" ? qForm.destValue : null,
        defaultAuditType: qForm.destType === "audit" ? (qForm.destValue as TriageAuditType) : null,
        defaultDestinationType:
            qForm.destType !== "" && qForm.destType !== "next" && qForm.destType !== "audit"
                ? (qForm.destValue as TriageDestinationType)
                : null,
        defaultDestinationTarget:
            qForm.destType !== "" && qForm.destType !== "next" && qForm.destType !== "audit"
                ? qForm.destTarget.trim() || null
                : null,
        answers: questionModal.editing?.answers ?? [],
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">Question Builder</h1>
                    <p className="text-xs md:text-sm text-slate-500 font-medium tracking-tight">
                        Each question has an answer type; branching is configured per option (or per
                        question for typed answers).
                    </p>
                </div>
                <button
                    onClick={openCreateQuestion}
                    className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-slate-900 text-white rounded-2xl md:rounded-xl font-bold text-sm hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                    <Plus size={18} />
                    Add Question
                </button>
            </div>

            {hasIssues && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <div className="text-sm font-bold text-amber-800 mb-0.5">Flow safety warnings</div>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            {questionsWithIssues.length} active question{questionsWithIssues.length === 1 ? "" : "s"} cannot reach an audit — they end in a dead-end or a loop. Users would get stuck, so fix these before publishing.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="animate-spin text-orange-500" size={36} />
                </div>
            ) : error ? (
                <div className="bg-white border border-red-100 rounded-3xl p-10 text-center">
                    <AlertCircle size={28} className="text-red-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-900 mb-1">Could not load triage questions</p>
                    <p className="text-xs text-slate-500 mb-5">{error}</p>
                    <button
                        onClick={() => refresh()}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-orange-500 transition-all"
                    >
                        Retry
                    </button>
                </div>
            ) : (questions ?? []).length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GitBranch size={26} className="text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No questions yet</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                        Create your first question to start building the branching flow.
                    </p>
                    <button
                        onClick={openCreateQuestion}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                    >
                        <Plus size={18} />
                        Create Question
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {(questions ?? []).map((q, i) => (
                        <QuestionCard
                            key={q.id}
                            index={i}
                            question={q}
                            questionById={questionById}
                            confirmTarget={confirmTarget}
                            onEdit={() => openEditQuestion(q)}
                            onAddAnswer={() => openCreateAnswer(q)}
                            onEditAnswer={openEditAnswer}
                            onMove={(a, dir) => handleMove(q, a, dir)}
                            onDelete={() => handleDelete("question", q.id)}
                            onDeleteAnswer={(id) => handleDelete("answer", id)}
                            onToggleActive={() => handleToggleActive(q)}
                        />
                    ))}
                </div>
            )}

            {/* Question modal */}
            <AnimatePresence>
                {questionModal.open && (
                    <Modal title={questionModal.editing ? "Edit Question" : "Add Question"} icon={<GitBranch size={18} />} onClose={closeModals} wide>
                        <form onSubmit={handleQuestionSubmit} className="space-y-8">
                            {/* Section: prompt */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500">Question</h3>
                                <Field label="Question text *">
                                    <input
                                        type="text"
                                        required
                                        value={qForm.text}
                                        onChange={(e) => setQForm({ ...qForm, text: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. Do you have excess stock?"
                                    />
                                </Field>
                                <Field label="Description (optional)">
                                    <textarea
                                        value={qForm.description}
                                        onChange={(e) => setQForm({ ...qForm, description: e.target.value })}
                                        className={`${inputClass} min-h-[70px] resize-y`}
                                        placeholder="A longer explanation shown under the question"
                                    />
                                </Field>
                                <Field label="Hint (optional)">
                                    <input
                                        type="text"
                                        value={qForm.hint}
                                        onChange={(e) => setQForm({ ...qForm, hint: e.target.value })}
                                        className={inputClass}
                                        placeholder="Small helper text e.g. Include VAT"
                                    />
                                </Field>
                            </div>

                            {/* Section: answer type */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500">Answer Type</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setQForm({ ...qForm, type: opt.value })}
                                            className={`text-left px-3 py-3 rounded-xl border-2 transition-all ${
                                                qForm.type === opt.value
                                                    ? "border-orange-400 bg-orange-50 shadow-sm"
                                                    : "border-slate-100 bg-white hover:border-slate-300"
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{opt.description}</div>
                                        </button>
                                    ))}
                                </div>
                                {qForm.type === "yes_no" && (
                                    <p className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                        <Info size={13} />
                                        The &ldquo;Yes&rdquo; / &ldquo;No&rdquo; options are created automatically when you save. Set each option&apos;s
                                        destination now.
                                    </p>
                                )}
                            </div>

                            {/* Section: type config (option-less types) */}
                            {optionless && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500">Answer Options / Settings</h3>
                                    <ConfigFields
                                        type={qForm.type}
                                        form={qForm}
                                        onChange={(patch) => setQForm({ ...qForm, ...patch })}
                                    />
                                </div>
                            )}

                            {/* Section: required + ordering + status */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="Required">
                                    <select
                                        value={qForm.required ? "required" : "optional"}
                                        onChange={(e) => setQForm({ ...qForm, required: e.target.value === "required" })}
                                        className={inputClass}
                                    >
                                        <option value="required">Required</option>
                                        <option value="optional">Optional</option>
                                    </select>
                                </Field>
                                <Field label="Order (start = lowest)">
                                    <input
                                        type="number"
                                        min={0}
                                        value={qForm.order}
                                        onChange={(e) => setQForm({ ...qForm, order: e.target.value })}
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Status">
                                    <select
                                        value={qForm.isActive ? "active" : "inactive"}
                                        onChange={(e) => setQForm({ ...qForm, isActive: e.target.value === "active" })}
                                        className={inputClass}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>
                            </div>

                            {/* Section: destination for option-less types */}
                            {optionless && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500">Destination</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Destination type">
                                            <select
                                                value={qForm.destType}
                                                onChange={(e) => {
                                                        const next = e.target.value as DestKind;
                                                        const isDest = next !== "" && next !== "next" && next !== "audit";
                                                        setQForm({
                                                            ...qForm,
                                                            destType: next,
                                                            destValue: next === "" ? "" : isDest ? next : qForm.destValue,
                                                        });
                                                    }}
                                                className={inputClass}
                                            >
                                                <option value="">Select destination…</option>
                                                <option value="next">Next Question</option>
                                                <option value="audit">Assign Audit</option>
                                                <optgroup label="Destination types">
                                                    {DESTINATION_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </Field>
                                    </div>
                                    {qForm.destType === "next" && (
                                        <Field label="Destination question">
                                            <select
                                                required
                                                value={qForm.destValue}
                                                onChange={(e) => setQForm({ ...qForm, destValue: e.target.value })}
                                                className={inputClass}
                                            >
                                                <option value="">Select question…</option>
                                                {(questions ?? [])
                                                    .filter((q) => q.id !== questionModal.editing?.id)
                                                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                                    .map((q) => (
                                                        <option key={q.id} value={q.id}>
                                                            {q.order}. {q.text}{q.isActive ? "" : " (inactive)"}
                                                        </option>
                                                    ))}
                                            </select>
                                        </Field>
                                    )}
                                    {qForm.destType === "audit" && (
                                        <Field label="Destination audit">
                                            <select
                                                required
                                                value={qForm.destValue}
                                                onChange={(e) => setQForm({ ...qForm, destValue: e.target.value })}
                                                className={inputClass}
                                            >
                                                <option value="">Select audit…</option>
                                                {AUDIT_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    )}
                                    {(qForm.destType !== "" && qForm.destType !== "next" && qForm.destType !== "audit") && (
                                        <Field label="Destination type">
                                            <select
                                                required
                                                value={qForm.destValue}
                                                onChange={(e) => setQForm({ ...qForm, destValue: e.target.value })}
                                                className={inputClass}
                                            >
                                                <option value="">Select destination type…</option>
                                                {DESTINATION_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    )}
                                    {(qForm.destType !== "" && qForm.destType !== "next" && qForm.destType !== "audit" && DEST_TARGET_KINDS.has(qForm.destType as TriageDestinationType)) && (
                                        <Field label="Destination target (e.g. sector id, MCOM slug, custom label)">
                                            <input
                                                type="text"
                                                value={qForm.destTarget}
                                                onChange={(e) => setQForm({ ...qForm, destTarget: e.target.value })}
                                                className={inputClass}
                                                placeholder="e.g. retail, mcom-booking, Visit our advisor"
                                            />
                                        </Field>
                                    )}
                                </div>
                            )}

                            {/* Section: live preview */}
                            {optionless && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Eye size={15} className="text-orange-500" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500">Preview</h3>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                                        <p className="text-sm font-bold text-slate-900 mb-4">{previewQuestion.text}</p>
                                        <QuestionInput
                                            question={previewQuestion}
                                            value={previewValue}
                                            disabled={false}
                                            onChange={setPreviewValue}
                                        />
                                    </div>
                                </div>
                            )}

                            <SubmitRow error={modalError} isSubmitting={isSubmitting} submitLabel={questionModal.editing ? "Save Question" : "Create Question"} />
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Answer modal */}
            <AnimatePresence>
                {answerModal.open && (
                    <Modal title={answerModal.editing ? "Edit Option" : "Add Option"} icon={<ListPlus size={18} />} onClose={closeModals}>
                        <form onSubmit={handleAnswerSubmit} className="space-y-5">
                            <Field label="Option text *">
                                <input
                                    type="text"
                                    required
                                    value={aForm.text}
                                    onChange={(e) => setAForm({ ...aForm, text: e.target.value })}
                                    className={inputClass}
                                    placeholder={answerModal.questionType === "yes_no" ? "e.g. Yes" : "e.g. Stock is overflowed"}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Status">
                                    <select
                                        value={aForm.isActive ? "active" : "inactive"}
                                        onChange={(e) => setAForm({ ...aForm, isActive: e.target.value === "active" })}
                                        className={inputClass}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </Field>
                                <Field label="Destination type">
                                    <select
                                        value={aForm.destType}
                                        onChange={(e) => {
                                            const next = e.target.value as DestKind;
                                            const isDest = next !== "" && next !== "next" && next !== "audit";
                                            setAForm({
                                                ...aForm,
                                                destType: next,
                                                destValue: next === "" ? "" : isDest ? next : aForm.destValue,
                                            });
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">Select destination…</option>
                                        <option value="next">Next Question</option>
                                        <option value="audit">Assign Audit</option>
                                        <optgroup label="Destination types">
                                            {DESTINATION_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </Field>
                            </div>

                            {aForm.destType === "next" && (
                                <Field label="Destination question">
                                    <select
                                        required
                                        value={aForm.destValue}
                                        onChange={(e) => setAForm({ ...aForm, destValue: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="">Select question…</option>
                                        {nextQuestionOptions.map((q) => (
                                            <option key={q.id} value={q.id}>
                                                {q.order}. {q.text}{q.isActive ? "" : " (inactive)"}
                                            </option>
                                        ))}
                                    </select>
                                    {nextQuestionOptions.length === 0 && (
                                        <p className="text-[11px] text-red-500 font-medium mt-1">
                                            No other questions exist — create another question first.
                                        </p>
                                    )}
                                </Field>
                            )}

                            {aForm.destType === "audit" && (
                                <Field label="Destination audit">
                                    <select
                                        required
                                        value={aForm.destValue}
                                        onChange={(e) => setAForm({ ...aForm, destValue: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="">Select audit…</option>
                                        {AUDIT_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            {(aForm.destType !== "" && aForm.destType !== "next" && aForm.destType !== "audit") && (
                                <Field label="Destination type">
                                    <select
                                        required
                                        value={aForm.destValue}
                                        onChange={(e) => setAForm({ ...aForm, destValue: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="">Select destination type…</option>
                                        {DESTINATION_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            {(aForm.destType !== "" && aForm.destType !== "next" && aForm.destType !== "audit" && DEST_TARGET_KINDS.has(aForm.destType as TriageDestinationType)) && (
                                <Field label="Destination target (e.g. sector id, MCOM slug, custom label)">
                                    <input
                                        type="text"
                                        value={aForm.destTarget}
                                        onChange={(e) => setAForm({ ...aForm, destTarget: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. retail, mcom-booking, Visit our advisor"
                                    />
                                </Field>
                            )}

                            {aForm.destType !== "" && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl text-xs font-bold text-orange-700">
                                    <ArrowRight size={14} className="shrink-0" />
                                    {aForm.destType === "next"
                                        ? `Choosing this option opens: ${questionById.get(aForm.destValue)?.text ?? "Question"}.`
                                        : aForm.destType === "audit"
                                          ? `Choosing this option assigns: ${auditLabel(aForm.destValue)}.`
                                          : `Choosing this option routes to: ${destLabel(aForm.destValue)}${aForm.destTarget.trim() ? ` (${aForm.destTarget.trim()})` : ""}.`}
                                </div>
                            )}

                            {isMultiSelectType(answerModal.questionType) && (
                                <p className="flex items-start gap-2 text-[11px] text-slate-500 font-medium leading-relaxed">
                                    <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
                                    Multi-select: all options must lead to the same destination, or submissions are rejected as
                                    ambiguous.
                                </p>
                            )}

                            <SubmitRow error={modalError} isSubmitting={isSubmitting} submitLabel={answerModal.editing ? "Save Option" : "Add Option"} />
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
                        style={{ backgroundColor: toast.type === "success" ? "#0f172a" : "#b45309" }}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle2 size={18} className="text-green-400" />
                        ) : (
                            <AlertTriangle size={18} className="text-white" />
                        )}
                        <span className="font-bold text-sm text-white max-w-md">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================
// Config fields per type
// ============================================================

function ConfigFields({
    type,
    form,
    onChange,
}: {
    type: QuestionType;
    form: QuestionForm;
    onChange: (patch: Partial<QuestionForm>) => void;
}) {
    const textInput = (label: string, value: string, key: keyof QuestionForm, placeholder?: string) => (
        <Field label={label}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange({ [key]: e.target.value } as Partial<QuestionForm>)}
                className={inputClass}
                placeholder={placeholder}
            />
        </Field>
    );

    const numberInput = (label: string, value: string, key: keyof QuestionForm, min?: number, max?: number, step?: number | "any") => (
        <Field label={label}>
            <input
                type="number"
                min={min}
                max={max}
                step={step === "any" ? "any" : step}
                value={value}
                onChange={(e) => onChange({ [key]: e.target.value } as Partial<QuestionForm>)}
                className={inputClass}
            />
        </Field>
    );

    switch (type) {
        case "short_text":
        case "long_text":
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {textInput("Placeholder", form.cfgPlaceholder, "cfgPlaceholder", "e.g. Type here…")}
                    {numberInput("Max characters", form.cfgMaxLength, "cfgMaxLength", 1)}
                </div>
            );
        case "number":
            return (
                <div className="grid grid-cols-3 gap-4">
                    {numberInput("Min", form.cfgMin, "cfgMin", undefined, undefined, "any")}
                    {numberInput("Max", form.cfgMax, "cfgMax", undefined, undefined, "any")}
                    {numberInput("Step", form.cfgStep, "cfgStep", undefined, undefined, 1)}
                </div>
            );
        case "date":
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Earliest date">
                        <input type="date" value={form.cfgMinDate} onChange={(e) => onChange({ cfgMinDate: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Latest date">
                        <input type="date" value={form.cfgMaxDate} onChange={(e) => onChange({ cfgMaxDate: e.target.value })} className={inputClass} />
                    </Field>
                </div>
            );
        case "file":
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {textInput("Allowed types (comma-separated MIME types)", form.cfgAllowedTypes, "cfgAllowedTypes", "e.g. image/png, application/pdf")}
                    {numberInput("Max size (MB)", form.cfgMaxFileSizeMb, "cfgMaxFileSizeMb", 0)}
                    <Field label="Allow multiple files">
                        <select
                            value={form.cfgMultipleFiles ? "yes" : "no"}
                            onChange={(e) => onChange({ cfgMultipleFiles: e.target.value === "yes" })}
                            className={inputClass}
                        >
                            <option value="no">Single file</option>
                            <option value="yes">Multiple files</option>
                        </select>
                    </Field>
                </div>
            );
        case "rating":
            return (
                <div className="grid grid-cols-2 gap-4">
                    {numberInput("Min rating (1–10)", form.cfgMin, "cfgMin", 1, 10)}
                    {numberInput("Max rating (1–10)", form.cfgMax, "cfgMax", 1, 10)}
                </div>
            );
        case "linear_scale":
            return (
                <div className="grid grid-cols-2 gap-4">
                    {numberInput("Min value (1–10)", form.cfgMin, "cfgMin", 1, 10)}
                    {numberInput("Max value (1–10)", form.cfgMax, "cfgMax", 1, 10)}
                    {textInput("Label under highest value", form.cfgMinLabel, "cfgMinLabel", "e.g. Not at all")}
                    {textInput("Label under lowest value", form.cfgMaxLabel, "cfgMaxLabel", "e.g. Extremely")}
                </div>
            );
        default:
            return null;
    }
}

// ============================================================
// Question card
// ============================================================

function QuestionCard({
    question,
    index,
    questionById,
    confirmTarget,
    onEdit,
    onAddAnswer,
    onEditAnswer,
    onMove,
    onDelete,
    onDeleteAnswer,
    onToggleActive,
}: {
    question: AdminTriageQuestion;
    index: number;
    questionById: Map<string, AdminTriageQuestion>;
    confirmTarget: { kind: "question" | "answer"; id: string } | null;
    onEdit: () => void;
    onAddAnswer: () => void;
    onEditAnswer: (a: AdminTriageAnswer) => void;
    onMove: (a: AdminTriageAnswer, direction: -1 | 1) => void;
    onDelete: () => void;
    onDeleteAnswer: (id: string) => void;
    onToggleActive: () => void;
}) {
    const isConfirm = confirmTarget?.kind === "question" && confirmTarget.id === question.id;
    const activeAnswers = question.answers.filter((a) => a.isActive);
    const inactiveAnswers = question.answers.filter((a) => !a.isActive);
    const multi = isMultiSelectType(question.type);
    const choice = isChoiceType(question.type);

    const multiConflict = multi
        ? (() => {
              const dests = new Set(
                  activeAnswers.map(
                      (a) => `${a.nextQuestionId ?? ""}|${a.destinationType ?? a.auditType ?? ""}|${a.destinationTarget ?? ""}`
                  )
              );
              return dests.size > 1;
          })()
        : false;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${question.isActive ? "border-slate-100" : "border-slate-100 opacity-80"}`}
        >
            {/* Question header */}
            <div className="px-5 sm:px-7 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                        <span className="font-bold text-sm">{question.order ?? index + 1}</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{question.text}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                                <Type size={11} />
                                {typeLabel(question.type)}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${question.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                {question.isActive ? <CheckCircle2 size={11} /> : <PowerOff size={11} />}
                                {question.isActive ? "Active" : "Inactive"}
                            </span>
                            {question.required !== false && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    Required
                                </span>
                            )}
                            {question.isActive && !question.hasAuditPath && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest">
                                    <AlertTriangle size={11} />
                                    No audit reachable
                                </span>
                            )}
                        </div>
                        {question.description && (
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{question.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <IconButton title="Edit question" onClick={onEdit}>
                        <Edit3 size={16} />
                    </IconButton>
                    <IconButton
                        title={question.isActive ? "Deactivate question" : "Activate question"}
                        onClick={onToggleActive}
                    >
                        {question.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                    </IconButton>
                    <IconButton
                        title="Delete question"
                        danger
                        confirming={isConfirm}
                        onClick={onDelete}
                    >
                        <Trash2 size={16} />
                    </IconButton>
                </div>
            </div>

            {/* Destination summary for option-less questions */}
            {!choice && (
                <div className="px-5 sm:px-7 py-3 bg-orange-50/40 border-b border-orange-50">
                    {question.hasAuditPath ? (
                        question.defaultNextQuestionId ? (
                            <span className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
                                <ArrowRight size={13} />
                                Continues to: {questionById.get(question.defaultNextQuestionId)?.text ?? "unknown question"}
                            </span>
                        ) : (
                            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                                <ArrowRight size={13} />
                                Assigns: {question.defaultDestinationType ? destLabel(question.defaultDestinationType) : auditLabel(question.defaultAuditType)}
                            </span>
                        )
                    ) : (
                        <span className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                            <AlertTriangle size={13} />
                            No route configured — set a destination in the question editor.
                        </span>
                    )}
                </div>
            )}

            {multiConflict && (
                <div className="px-5 sm:px-7 py-3 bg-amber-50 border-b border-amber-100">
                    <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        Multi-select options lead to different destinations — submissions will be rejected as ambiguous.
                    </p>
                </div>
            )}

            {/* Answers */}
            {choice && (question.answers.length > 0 ? (
                <div className="divide-y divide-slate-50">
                    {activeAnswers.map((a) => (
                        <AnswerRow
                            key={a.id}
                            answer={a}
                            questionById={questionById}
                            confirmTarget={confirmTarget}
                            onEdit={() => onEditAnswer(a)}
                            onMove={(direction) => onMove(a, direction)}
                            onDelete={() => onDeleteAnswer(a.id)}
                        />
                    ))}
                    {inactiveAnswers.map((a) => (
                        <AnswerRow
                            key={a.id}
                            answer={a}
                            questionById={questionById}
                            confirmTarget={confirmTarget}
                            onEdit={() => onEditAnswer(a)}
                            onMove={(direction) => onMove(a, direction)}
                            onDelete={() => onDeleteAnswer(a.id)}
                            dimmed
                        />
                    ))}
                </div>
            ) : (
                <div className="px-5 sm:px-7 py-5 text-sm text-slate-400 font-medium">
                    No options yet — add one so this question can lead somewhere. (Or switch to a typed answer type.)
                </div>
            ))}

            {/* Footer */}
            {(choice || !question.hasAuditPath) && (
                <div className="px-5 sm:px-7 py-4 bg-slate-50/50 border-t border-slate-100">
                    {choice ? (
                        <button
                            onClick={onAddAnswer}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-orange-400 hover:text-orange-600 active:scale-95 transition-all"
                        >
                            <ListPlus size={15} />
                            Add Option
                        </button>
                    ) : (
                        <p className="text-[11px] text-slate-400 font-medium">
                            Typed answers use the question-level destination. Open the question editor to change it.
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
}

function AnswerRow({
    answer,
    questionById,
    confirmTarget,
    onEdit,
    onMove,
    onDelete,
    dimmed,
}: {
    answer: AdminTriageAnswer;
    questionById: Map<string, AdminTriageQuestion>;
    confirmTarget: { kind: "question" | "answer"; id: string } | null;
    onEdit: () => void;
    onMove: (direction: -1 | 1) => void;
    onDelete: () => void;
    dimmed?: boolean;
}) {
    const isConfirm = confirmTarget?.kind === "answer" && confirmTarget.id === answer.id;
    const target = answer.nextQuestionId ? questionById.get(answer.nextQuestionId) : undefined;
    const broken = answer.nextQuestionId && !target;

    return (
        <div className={`px-5 sm:px-7 py-4 flex items-center justify-between gap-4 ${dimmed ? "opacity-60" : ""}`}>
            <div className="min-w-0 flex items-center gap-3">
                <div className="flex flex-col">
                    <button
                        onClick={() => onMove(-1)}
                        title="Move up"
                        className="text-slate-300 hover:text-orange-500 transition-colors leading-none"
                    >
                        <ChevronUp size={13} />
                    </button>
                    <button
                        onClick={() => onMove(1)}
                        title="Move down"
                        className="text-slate-300 hover:text-orange-500 transition-colors leading-none"
                    >
                        <ChevronDown size={13} />
                    </button>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${dimmed ? "bg-slate-300" : "bg-orange-500"}`} />
                <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{answer.text}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {answer.nextQuestionId ? (
                            <>
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                    <ArrowRight size={9} />
                                    Next Question
                                </span>
                                {broken ? (
                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        Missing question
                                    </span>
                                ) : target && !target.isActive ? (
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        Points to inactive question
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-500 font-medium truncate">{target?.text}</span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                    Assign
                                </span>
                                <span className="text-xs font-bold text-blue-600">
                                    {answer.destinationType ? destLabel(answer.destinationType) : auditLabel(answer.auditType)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <IconButton title="Edit option" onClick={onEdit}>
                    <Edit3 size={14} />
                </IconButton>
                <IconButton title="Deactivate option" danger confirming={isConfirm} onClick={onDelete}>
                    {dimmed ? <Power size={14} /> : <Trash2 size={14} />}
                </IconButton>
            </div>
        </div>
    );
}

// ============================================================
// Shared bits
// ============================================================

const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</label>
            {children}
        </div>
    );
}

function IconButton({
    children,
    title,
    onClick,
    danger,
    confirming,
}: {
    children: React.ReactNode;
    title: string;
    onClick: () => void;
    danger?: boolean;
    confirming?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`p-2 rounded-xl transition-all active:scale-90 flex items-center gap-1.5 ${
                confirming
                    ? "bg-red-600 text-white"
                    : danger
                        ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                        : "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
            }`}
        >
            {confirming && <span className="text-[10px] font-bold uppercase tracking-wider">Confirm?</span>}
            {children}
        </button>
    );
}

function SubmitRow({ error, isSubmitting, submitLabel }: { error: string | null; isSubmitting: boolean; submitLabel: string }) {
    return (
        <>
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
                    {error}
                </div>
            )}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-orange-500 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Saving...
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>
            </div>
        </>
    );
}

function Modal({
    title,
    icon,
    onClose,
    children,
    wide,
}: {
    title: string;
    icon: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    wide?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative bg-white rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl ${wide ? "max-w-2xl w-full" : "max-w-lg w-full"}`}
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
                            <span className="text-orange-500">{icon}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}