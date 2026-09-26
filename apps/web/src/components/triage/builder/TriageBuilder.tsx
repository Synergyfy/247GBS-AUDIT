"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  Inbox,
  ListChecks,
  PencilLine,
  Plus,
  RotateCcw,
  Save,
  Send,
  Settings2,
  Upload,
} from "lucide-react";
import { useAdminTriageQuestions, triageApi, formApi } from "@/services/triage/hooks";
import type { AnswerPayload, FormApiError, QuestionPayload, UpdateFormPayload } from "@/services/triage/hooks";
import type {
  AdminTriageAnswer,
  AdminTriageQuestion,
  AnswerDestinationSnapshot,
  QuestionConfig,
  QuestionType,
  TriageForm,
  TriageFormSettings,
} from "@/services/triage/types";
import type { QuestionCardHandlers } from "./QuestionCard";
import {
  destinationSnapshotOf,
  isLinearDestination,
  linearizeAnswer,
  nextLinearId,
  responseNavigationOn,
} from "./navigation";
import { QuestionsTab } from "./QuestionsTab";
import { ResponsesTab } from "./ResponsesTab";
import { SettingsTab } from "./SettingsTab";
import type { PublishOutcome } from "./PublishPanel";
import { PreviewModal } from "./PreviewModal";
import { PublishModal } from "./PublishModal";
import { ImportQuestionsModal } from "./ImportQuestionsModal";
import { Spinner } from "./ui";
import {
  answerPayloadOf,
  buildSavePlan,
  cloneQuestions,
  isTempId,
  remapNavigationConfig,
  remapQuestion,
  tempId,
  translateRefs,
} from "./persist";

type Tab = "questions" | "responses" | "settings";

interface Toast {
  message: string;
  type: "success" | "error";
}

export function TriageBuilder() {
  const { data: serverQuestions, loading, error, refresh } = useAdminTriageQuestions();

  /* ---- Local-first draft state -------------------------------------------------
   * `draft` is the working copy the admin edits. Nothing touches the API until an
   * explicit Save (or Save-and-Publish). Refetches never clobber the draft.       */
  const [seeded, setSeeded] = useState(false);
  const [draft, setDraft] = useState<AdminTriageQuestion[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<TriageForm | null>(null);
  const [formLoading, setFormLoading] = useState(true);
  const baseRef = useRef<AdminTriageQuestion[]>([]);
  const baseFormRef = useRef<TriageForm | null>(null);

  const [tab, setTab] = useState<Tab>("questions");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Collapsed cards: purely UI state, never touches the draft ---------------
   * Long flows would otherwise render as a wall of open editors. Only the
   * first question starts expanded; newly added/imported questions expand and
   * scroll into view. Collapsing never loses edits. */
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string>>(new Set());
  const collapseInit = useRef(false);

  // Seed the draft once from the server list; refetches afterwards never touch it.
  useEffect(() => {
    if (seeded || !serverQuestions) return;
    const ordered = [...serverQuestions].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt.localeCompare(b.createdAt)
    );
    const timer = window.setTimeout(() => {
      baseRef.current = cloneQuestions(ordered);
      setDraft(ordered);
      setSeeded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [seeded, serverQuestions]);

  useEffect(() => {
    formApi
      .getForm()
      .then((next) => {
        setForm(next);
        baseFormRef.current = next;
      })
      .catch(() => setForm(null))
      .finally(() => setFormLoading(false));
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current ?? undefined), []);

  // Default collapse: everything except the first question starts collapsed.
  useEffect(() => {
    if (collapseInit.current || draft.length === 0) return;
    collapseInit.current = true;
    const ids = draft.map((q) => q.id);
    seenIds.current = new Set(ids);
    setCollapsedIds(new Set(ids.slice(1)));
  }, [draft]);

  // Newly added/imported questions expand and scroll into view.
  useEffect(() => {
    if (!collapseInit.current) return;
    const prev = seenIds.current;
    const fresh = draft.map((q) => q.id).filter((id) => !prev.has(id));
    seenIds.current = new Set(draft.map((q) => q.id));
    if (fresh.length === 0) return;
    setCollapsedIds((current) => {
      const next = new Set(current);
      for (const id of fresh) next.delete(id);
      return next;
    });
    const first = fresh[0];
    requestAnimationFrame(() => {
      document
        .getElementById(`triage-q-${first}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [draft]);

  const toggleCollapse = useCallback((qid: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setCollapsedIds(new Set()), []);

  const collapseAll = useCallback(
    () => setCollapsedIds(new Set(draft.map((q) => q.id))),
    [draft]
  );

  const jumpToQuestion = useCallback((qid: string) => {
    if (!qid) return;
    setCollapsedIds((current) => {
      if (!current.has(qid)) return current;
      const next = new Set(current);
      next.delete(qid);
      return next;
    });
    requestAnimationFrame(() => {
      document
        .getElementById(`triage-q-${qid}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
    clearTimeout(toastTimer.current ?? undefined);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const refreshForm = useCallback(async () => {
    try {
      const next = await formApi.getForm();
      setForm(next);
      baseFormRef.current = next;
    } catch {
      /* keep last known form */
    }
  }, []);

  const normalizeOrder = useCallback(
    (list: AdminTriageQuestion[]) => list.map((q, index) => ({ ...q, order: index + 1 })),
    []
  );

  /**
   * Keeps questions WITHOUT response-based navigation on the linear default:
   * every active option advances to the next active question (or ends the flow
   * via human review for the tail). Applied whenever the question order or the
   * option set changes so the "next question" default survives reordering.
   */
  const syncLinearDestinations = useCallback(
    (list: AdminTriageQuestion[]): AdminTriageQuestion[] => {
      const ordered = normalizeOrder(list);
      return ordered.map((q) => {
        if (responseNavigationOn(q, ordered)) return q;
        const nextId = nextLinearId(q, ordered);
        return {
          ...q,
          answers: q.answers.map((a) =>
            a.isActive === false ? a : linearizeAnswer(a, nextId)
          ),
        };
      });
    },
    [normalizeOrder]
  );

  const makeDraftAnswer = useCallback(
    (
      qid: string,
      text: string,
      internalValue: string | null,
      sortOrder = 1
    ): AdminTriageAnswer => ({
      id: tempId("a"),
      questionId: qid,
      text,
      internalValue,
      tag: null,
      // No explicit route — follows the linear default, resolved from the
      // question order at runtime ("next question" or "End / Submit").
      nextQuestionId: null,
      auditType: null,
      destinationType: null,
      destinationTarget: null,
      sortOrder,
      isActive: true,
      createdAt: new Date().toISOString(),
    }),
    []
  );

  const ensureYesNoOptions = useCallback(
    (question: AdminTriageQuestion, others: AdminTriageQuestion[]): AdminTriageAnswer[] => {
      const active = question.answers.filter((a) => a.isActive);
      if (active.length > 0) return question.answers;
      return [makeDraftAnswer(question.id, "Yes", "yes"), makeDraftAnswer(question.id, "No", "no")];
    },
    [makeDraftAnswer]
  );

  /* ---- Local mutation handlers: sync, no API, no refetch --------------------- */

  const localUpdateQuestion = useCallback((qid: string, patch: Partial<QuestionPayload>) => {
    setDraft((prev) => prev.map((q) => (q.id === qid ? { ...q, ...patch } : q)));
    setDirty(true);
  }, []);

  const localSetType = useCallback(
    (qid: string, type: QuestionType) => {
      setDraft((prev) => {
        const next = prev.map((q) => {
          if (q.id !== qid || q.type === type) return q;
          return {
            ...q,
            type,
            answers: type === "yes_no" ? ensureYesNoOptions(q, prev) : q.answers,
          };
        });
        return syncLinearDestinations(next);
      });
      setDirty(true);
    },
    [ensureYesNoOptions, syncLinearDestinations]
  );

  /**
   * Toggles response-based navigation for a question.
   *
   * On -> off: divergent destinations are snapshotted into
   * `config.preservedNavigation` and every option is reset to the linear
   * default, so the disabled state no longer applies the old routing. The
   * snapshot survives save/publish and is restored when the toggle is turned
   * back on.
   *
   * Off -> on: the snapshot (if any) is restored onto the surviving options and
   * removed from the config.
   */
  const localSetNavigation = useCallback(
    (qid: string, enabled: boolean) => {
      setDraft((prev) => {
        const question = prev.find((q) => q.id === qid);
        if (!question) return prev;
        if (responseNavigationOn(question, prev) === enabled) return prev;
        const ordered = normalizeOrder(prev);
        const nextId = nextLinearId(question, ordered);

        if (enabled) {
          const held = question.config?.preservedNavigation;
          const config: QuestionConfig = { ...question.config };
          config.responseNavigation = true;
          if (held) delete config.preservedNavigation;
          return prev.map((q) => {
            if (q.id !== qid) return q;
            return {
              ...q,
              config,
              answers: q.answers.map((a) => {
                const snapshot = held?.[a.id];
                if (!snapshot) return a;
                const targetOk =
                  !snapshot.nextQuestionId ||
                  (snapshot.nextQuestionId !== qid &&
                    prev.some((x) => x.id === snapshot.nextQuestionId && x.isActive));
                if (!targetOk) return linearizeAnswer(a, nextLinearId(q, ordered));
                return { ...a, ...snapshot };
              }),
            };
          });
        }

        const preserved: Record<string, AnswerDestinationSnapshot> = {};
        for (const a of question.answers) {
          if (a.isActive === false) continue;
          if (!isLinearDestination(a, nextId)) preserved[a.id] = destinationSnapshotOf(a);
        }
        const config: QuestionConfig = { ...question.config, responseNavigation: false };
        const keys = Object.keys(preserved);
        if (keys.length > 0) config.preservedNavigation = preserved;
        return prev.map((q) =>
          q.id !== qid
            ? q
            : {
                ...q,
                config,
                answers: q.answers.map((a) =>
                  a.isActive === false ? a : linearizeAnswer(a, nextId)
                ),
              }
        );
      });
      setDirty(true);
    },
    [normalizeOrder]
  );

  const localAddQuestion = useCallback(
    () => {
      setDraft((prev) => {
        const maxOrder = prev.reduce((m, q) => Math.max(m, q.order ?? 0), 0);
        const question: AdminTriageQuestion = {
          id: tempId("q"),
          text: "Untitled question",
          type: "single_choice",
          description: null,
          hint: null,
          icon: null,
          required: true,
          config: { responseNavigation: false },
          defaultNextQuestionId: null,
          defaultAuditType: null,
          defaultDestinationType: null,
          defaultDestinationTarget: null,
          order: maxOrder + 1,
          isActive: true,
          hasAuditPath: false,
          createdAt: new Date().toISOString(),
          answers: [],
        };
        return syncLinearDestinations([
          ...prev,
          {
            ...question,
            answers: [
              makeDraftAnswer(question.id, "Option 1", null, 1),
              makeDraftAnswer(question.id, "Option 2", null, 2),
            ],
          },
        ]);
      });
      setDirty(true);
    },
    [makeDraftAnswer, syncLinearDestinations]
  );

  const localAddAnswer = useCallback(
    (qid: string) => {
      setDraft((prev) =>
        syncLinearDestinations(
          prev.map((q) => {
            if (q.id !== qid) return q;
            const active = q.answers
              .filter((a) => a.isActive)
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
            const answer: AdminTriageAnswer = {
              id: tempId("a"),
              questionId: qid,
              text: `Option ${active.length + 1}`,
              internalValue: null,
              tag: null,
              nextQuestionId: null,
              auditType: null,
              destinationType: null,
              destinationTarget: null,
              sortOrder: active.reduce((m, a) => Math.max(m, a.sortOrder ?? 0), 0) + 1,
              isActive: true,
              createdAt: new Date().toISOString(),
            };
            return { ...q, answers: [...q.answers, answer] };
          })
        )
      );
      setDirty(true);
    },
    [syncLinearDestinations]
  );

  const localUpdateAnswer = useCallback(
    (qid: string, aid: string, patch: Partial<AnswerPayload>) => {
      setDraft((prev) =>
        prev.map((q) =>
          q.id !== qid
            ? q
            : { ...q, answers: q.answers.map((a) => (a.id === aid ? { ...a, ...patch } : a)) }
        )
      );
      setDirty(true);
    },
    []
  );

  const localDeleteAnswer = useCallback((qid: string, aid: string) => {
    setDraft((prev) =>
      prev.map((q) => (q.id !== qid ? q : { ...q, answers: q.answers.filter((a) => a.id !== aid) }))
    );
    setDirty(true);
  }, []);

  const localMoveAnswer = useCallback((qid: string, aid: string, dir: -1 | 1) => {
    setDraft((prev) =>
      prev.map((q) => {
        if (q.id !== qid) return q;
        const activeIds = q.answers.filter((a) => a.isActive).map((a) => a.id);
        const index = activeIds.indexOf(aid);
        const otherId = activeIds[index + dir];
        if (otherId === undefined) return q;
        const current = q.answers.find((a) => a.id === aid);
        const swap = q.answers.find((a) => a.id === otherId);
        if (!current || !swap) return q;
        return {
          ...q,
          answers: q.answers.map((a) => {
            if (a.id === aid) return { ...a, sortOrder: swap.sortOrder ?? 0 };
            if (a.id === otherId) return { ...a, sortOrder: current.sortOrder ?? 0 };
            return a;
          }),
        };
      })
    );
    setDirty(true);
  }, []);

  /** Drag-reorder for answer options — local only, persisted on the next Save. */
  const localReorderAnswers = useCallback((qid: string, list: AdminTriageAnswer[]) => {
    setDraft((prev) =>
      prev.map((q) => {
        if (q.id !== qid) return q;
        const order = new Map(list.map((a, index) => [a.id, index + 1]));
        return {
          ...q,
          answers: q.answers.map((a) => {
            const nextSort = order.get(a.id);
            return nextSort ? { ...a, sortOrder: nextSort } : a;
          }),
        };
      })
    );
    setDirty(true);
  }, []);

  const localMoveQuestion = useCallback(
    (qid: string, dir: -1 | 1) => {
      setDraft((prev) => {
        const index = prev.findIndex((q) => q.id === qid);
        const swap = prev[index + dir];
        if (!swap) return prev;
        const next = prev.slice();
        next[index] = swap;
        next[index + dir] = prev[index];
        return syncLinearDestinations(normalizeOrder(next));
      });
      setDirty(true);
    },
    [normalizeOrder, syncLinearDestinations]
  );

  const localDuplicate = useCallback(
    (q: AdminTriageQuestion) => {
      setDraft((prev) => {
        const index = prev.findIndex((x) => x.id === q.id);
        if (index < 0) return prev;
        const copyId = tempId("q");
        const copy: AdminTriageQuestion = {
          ...q,
          id: copyId,
          text: `${q.text} (copy)`,
          answers: q.answers
            .filter((a) => a.isActive)
            .map((a) => ({ ...a, id: tempId("a"), questionId: copyId })),
        };
        const next = prev.slice();
        next.splice(index + 1, 0, copy);
        return syncLinearDestinations(normalizeOrder(next));
      });
      setDirty(true);
    },
    [normalizeOrder, syncLinearDestinations]
  );

  const localRemoveQuestion = useCallback(
    (q: AdminTriageQuestion) => {
      setDraft((prev) =>
        syncLinearDestinations(
          normalizeOrder(
            prev
              .filter((x) => x.id !== q.id)
              .map((question) => {
                const adjusted =
                  question.defaultNextQuestionId === q.id
                    ? {
                        ...question,
                        defaultNextQuestionId: null,
                        defaultAuditType: null,
                        defaultDestinationType: null,
                        defaultDestinationTarget: null,
                      }
                    : question;
                if (!question.answers.some((a) => a.nextQuestionId === q.id)) return adjusted;
                return {
                  ...adjusted,
                  answers: question.answers.map((a) =>
                    a.nextQuestionId === q.id
                      ? {
                          ...a,
                          nextQuestionId: null,
                          auditType: null,
                          destinationType: null,
                          destinationTarget: null,
                        }
                      : a
                  ),
                };
              })
          )
        )
      );
      setDirty(true);
    },
    [normalizeOrder, syncLinearDestinations]
  );

  const handleReorder = useCallback(
    (list: AdminTriageQuestion[]) => {
      setDraft(syncLinearDestinations(list));
      setDirty(true);
    },
    [syncLinearDestinations]
  );

  /** Imported questions are appended to the local draft; only Save touches the API. */
  const localImportQuestions = useCallback(
    (questions: AdminTriageQuestion[]) => {
      setDraft((prev) => syncLinearDestinations(normalizeOrder([...prev, ...questions])));
      setDirty(true);
      showToast(`Imported ${questions.length} question${questions.length === 1 ? "" : "s"} — click Save to persist.`);
    },
    [normalizeOrder, syncLinearDestinations, showToast]
  );

  const handlers: QuestionCardHandlers = useMemo(
    () => ({
      update: localUpdateQuestion,
      setType: localSetType,
      setNavigation: localSetNavigation,
      addAnswer: localAddAnswer,
      updateAnswer: localUpdateAnswer,
      deleteAnswer: localDeleteAnswer,
      moveAnswer: localMoveAnswer,
      reorderAnswers: localReorderAnswers,
      moveQuestion: localMoveQuestion,
      duplicate: localDuplicate,
      remove: localRemoveQuestion,
    }),
    [
      localUpdateQuestion,
      localSetType,
      localSetNavigation,
      localAddAnswer,
      localUpdateAnswer,
      localDeleteAnswer,
      localMoveAnswer,
      localReorderAnswers,
      localMoveQuestion,
      localDuplicate,
      localRemoveQuestion,
    ]
  );

  /* ---- Persistence: explicit Save, Save-on-Publish ---------------------------- */

  const saveDraft = useCallback(async () => {
    if (!seeded || busy) return;
    setBusy(true);
    try {
      const plan = buildSavePlan(baseRef.current, draft);
      const qidMap = new Map<string, string>();
      const aidMap = new Map<string, string>();
      const deferredRefs: { draftId: string; refDraftId: string }[] = [];

      // 1. New questions first, so answers and routes can reference their ids.
      for (const q of plan.createQuestions) {
        if (q.defaultNextQuestionId && isTempId(q.defaultNextQuestionId)) {
          deferredRefs.push({ draftId: q.id, refDraftId: q.defaultNextQuestionId });
        }
        const payload: QuestionPayload = {
          text: q.text,
          type: q.type,
          description: q.description,
          hint: q.hint,
          icon: q.icon,
          required: q.required,
          config: q.config,
          order: q.order,
          isActive: q.isActive,
          defaultNextQuestionId:
            q.defaultNextQuestionId && !isTempId(q.defaultNextQuestionId) ? q.defaultNextQuestionId : null,
          defaultAuditType: q.defaultAuditType,
          defaultDestinationType: q.defaultDestinationType,
          defaultDestinationTarget: q.defaultDestinationTarget,
        };
        const created = (await triageApi.createQuestion(payload)) as { id?: string };
        if (!created?.id) throw new Error("Could not create a question. Please try again.");
        qidMap.set(q.id, created.id);
      }

      // 2. Routes that point at a question created in this save.
      for (const d of deferredRefs) {
        const serverId = qidMap.get(d.draftId);
        const refServerId = qidMap.get(d.refDraftId);
        if (!serverId || !refServerId) continue;
        await triageApi.updateQuestion(serverId, { defaultNextQuestionId: refServerId });
      }

      // 3. Removed questions.
      for (const id of plan.deleteQuestions) await triageApi.deleteQuestion(id);

      // 4. Updated questions.
      for (const op of plan.updateQuestions) {
        await triageApi.updateQuestion(op.id, translateRefs(op.payload, qidMap));
      }

      // 5. Answers.
      for (const op of plan.createAnswers) {
        const questionId = qidMap.get(op.questionId) ?? op.questionId;
        const created = (await triageApi.createAnswer(questionId, answerPayloadOf(op.answer, qidMap))) as {
          id?: string;
        };
        if (created?.id && isTempId(op.answer.id)) aidMap.set(op.answer.id, created.id);
      }
      for (const op of plan.updateAnswers) {
        await triageApi.updateAnswer(op.id, translateRefs(op.payload, qidMap));
      }
      for (const id of plan.deleteAnswers) await triageApi.deleteAnswer(id);

      // 5a. Preserved navigation snapshots keyed by draft answer ids are
      // re-keyed to the server ids created above (configs that referenced a
      // draft answer/question get one corrective question update).
      for (const q of draft) {
        const config = q.config;
        if (!config?.preservedNavigation) continue;
        const remapped = remapNavigationConfig(config, qidMap, aidMap);
        if (remapped !== config) {
          const questionId = qidMap.get(q.id) ?? q.id;
          await triageApi.updateQuestion(questionId, { config: remapped });
        }
      }

      // 5b. Form-level fields (title / description / settings).
      const baseForm = baseFormRef.current;
      if (form && baseForm) {
        const formPatch: UpdateFormPayload = {};
        if (form.title !== baseForm.title) formPatch.title = form.title;
        if (form.description !== baseForm.description) formPatch.description = form.description ?? null;
        if (JSON.stringify(form.settings) !== JSON.stringify(baseForm.settings)) formPatch.settings = form.settings;
        if (Object.keys(formPatch).length > 0) await formApi.updateForm(formPatch);
        baseFormRef.current = JSON.parse(JSON.stringify(form)) as TriageForm;
      }

      // 6. Re-key temp ids to server ids and mark the draft clean.
      const next = normalizeOrder(draft.map((q) => remapQuestion(q, qidMap, aidMap)));
      baseRef.current = cloneQuestions(next);
      setDraft(next);
      setDirty(false);
      showToast("Changes saved.");
      void refresh();
      void refreshForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save your changes.", "error");
      throw err;
    } finally {
      setBusy(false);
    }
  }, [seeded, busy, draft, form, normalizeOrder, refresh, refreshForm, showToast]);

  const discard = useCallback(() => {
    setDraft(cloneQuestions(baseRef.current));
    if (baseFormRef.current) setForm(baseFormRef.current);
    setDirty(false);
  }, []);

  const publishNow = useCallback(
    async (): Promise<PublishOutcome> => {
      try {
        if (dirty) await saveDraft();
        const result = await formApi.publish();
        await refreshForm();
        showToast("Form published.");
        return { ok: true, publicUrl: result.publicUrl ?? null };
      } catch (err) {
        const e = err as FormApiError;
        const issues =
          e?.issues?.map((i) => ({ message: i })) ??
          (err instanceof Error ? [{ message: err.message }] : [{ message: "Publish failed." }]);
        const warnings = (e?.warnings ?? []).map((w) => ({ message: w }));
        return { ok: false, issues, warnings };
      }
    },
    [dirty, saveDraft, refreshForm, showToast]
  );

  const unpublishNow = useCallback(async () => {
    setBusy(true);
    try {
      await formApi.unpublish();
      await refreshForm();
      showToast("Form unpublished.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not unpublish.", "error");
    } finally {
      setBusy(false);
    }
  }, [refreshForm, showToast]);

  const copyLink = useCallback((url: string) => {
    const full = `${window.location.origin}${url}`;
    void navigator.clipboard
      .writeText(full)
      .then(() => showToast("Public link copied to clipboard."))
      .catch(() => showToast("Copy failed — select the link manually.", "error"));
  }, [showToast]);

  const openLiveForm = useCallback(() => {
    if (!form?.slug) return;
    window.open(`${window.location.origin}/audit/triage/${form.slug}`, "_blank", "noopener,noreferrer");
  }, [form]);

  /* ---- Local form/settings edits ---------------------------------------------- */

  const updateTitle = useCallback((title: string) => {
    setForm((prev) => (prev ? { ...prev, title } : prev));
    setDirty(true);
  }, []);

  const updateDescription = useCallback((description: string | null) => {
    setForm((prev) => (prev ? { ...prev, description } : prev));
    setDirty(true);
  }, []);

  const updateSettings = useCallback((patch: Partial<TriageFormSettings>) => {
    setForm((prev) =>
      prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev
    );
    setDirty(true);
  }, []);

  const tabMeta: { id: Tab; label: string; icon: React.ElementType }[] = useMemo(
    () => [
      { id: "questions", label: "Questions", icon: ListChecks },
      { id: "responses", label: "Responses", icon: Inbox },
      { id: "settings", label: "Settings", icon: Settings2 },
    ],
    []
  );

  if (loading && !seeded) return <Spinner label="Loading business triage…" />;

  if (error && !serverQuestions) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
        <p className="text-sm font-bold text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-black transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={`fixed bottom-4 left-4 right-4 z-[60] rounded-2xl px-5 py-3.5 text-sm font-bold shadow-2xl text-white sm:bottom-6 sm:left-auto sm:right-6 ${
              toast.type === "success" ? "bg-slate-900" : "bg-red-500"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="truncate text-xl sm:text-2xl font-bold text-slate-900">
                {formLoading ? "Business Triage" : form?.title ?? "Business Triage"}
              </h2>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  form?.status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: form?.status === "published" ? "#10b981" : "#94a3b8" }}
                />
                {form?.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400 font-medium">
              {form?.description || "Design how visitors are routed to the right audit or service."}
            </p>
          </div>
          <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain sm:w-auto">
            {dirty && (
              <span className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 text-amber-700 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                <PencilLine size={13} /> Unsaved changes
              </span>
            )}
            {dirty && (
              <button
                type="button"
                disabled={busy}
                onClick={discard}
                className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-white border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50"
              >
                <RotateCcw size={14} /> Discard
              </button>
            )}
            <button
              type="button"
              disabled={!dirty || busy}
              onClick={() => void saveDraft()}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-black transition-all disabled:opacity-50"
            >
              <Save size={15} />
              Save
            </button>
            <button
              type="button"
              onClick={localAddQuestion}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-300 transition-all"
            >
              <Plus size={15} />
              Add Question
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-300 transition-all"
            >
              <Upload size={15} />
              Import
            </button>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
            >
              <Eye size={15} />
              Preview
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setPublishOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              <Send size={15} />
              Publish
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex items-center gap-1 overflow-x-auto overflow-y-hidden border-b border-slate-100">
          {tabMeta.map((meta) => {
            const Icon = meta.icon;
            return (
              <button
                key={meta.id}
                type="button"
                onClick={() => setTab(meta.id)}
                className={`-mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                  tab === meta.id
                    ? "border-orange-500 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon size={15} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body: full-width tabbed content */}
      <div className="min-w-0 space-y-6">
        {tab === "questions" && (
          <QuestionsTab
            questions={draft}
            handlers={handlers}
            onAddQuestion={localAddQuestion}
            onReorder={handleReorder}
            collapsedIds={collapsedIds}
            onToggleCollapse={toggleCollapse}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onJump={jumpToQuestion}
          />
        )}
        {tab === "responses" && <ResponsesTab />}
        {tab === "settings" && (
          <SettingsTab
            form={form ?? { title: "", description: null, settings: {} as TriageFormSettings } as TriageForm}
            onUpdateTitle={updateTitle}
            onUpdateDescription={updateDescription}
            onUpdateSettings={updateSettings}
            onCopy={copyLink}
            busy={busy}
          />
        )}
      </div>

      {/* Preview & Publish dialogs (open without touching the builder state) */}
      {previewOpen && (
        <PreviewModal
          questions={draft}
          form={form}
          onOpenPublic={openLiveForm}
          onOpenNewTab={() =>
            window.open(`${window.location.origin}/admin/triage/preview`, "_blank", "noopener,noreferrer")
          }
          onClose={() => setPreviewOpen(false)}
        />
      )}
      {publishOpen && (
        <PublishModal
          form={form}
          busy={busy}
          dirty={dirty}
          onPublish={publishNow}
          onUnpublish={unpublishNow}
          onCopy={copyLink}
          onClose={() => setPublishOpen(false)}
        />
      )}
      {importOpen && (
        <ImportQuestionsModal
          existing={draft.map((q) => ({ id: q.id, text: q.text }))}
          onImport={localImportQuestions}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
  );
}