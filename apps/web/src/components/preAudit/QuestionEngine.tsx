"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, ChevronLeft, GitBranch, Info, Loader2 } from "lucide-react";
import type { TriageFormSettings, TriagePublicQuestion } from "@/services/triage/types";
import { isChoiceType, isMultiSelectType } from "@/services/triage/types";
import {
  ensureQuestion,
  ensureStartQuestion,
  getCachedQuestion,
  hydrateCache,
} from "@/services/preAudit/data";
import type {
  PreAuditEngineOptions,
  PreAuditPendingBranch,
  PreAuditPhase,
  PreAuditQuestionType,
  PreAuditSubmission,
  PreAuditVisitedEntry,
} from "@/lib/preAudit/types";
import {
  PRE_AUDIT_MAX_STEPS,
  PRE_AUDIT_VERSION,
  buildSubmission,
  createRecordId,
  fingerprintOf,
  isTerminal,
  makeChoiceAnswer,
  makeTypedVisitedEntry,
  recomputeActiveVisited,
  resolvePendingBranch,
  resolveQuestionType,
  stackBranches,
} from "@/lib/preAudit/engine";
import { validateAnswer, validateEmail } from "@/lib/preAudit/validation";
import {
  clearProgress,
  findDuplicateSubmission,
  loadProgress,
  saveProgress,
  saveSubmission,
} from "@/lib/preAudit/storage";
import { submitPreAudit } from "@/services/preAudit/submit";
import { ProgressHeader } from "./ProgressHeader";
import { AnswerOption } from "./AnswerOption";
import { EmailStep } from "./EmailStep";
import { ReviewStep } from "./ReviewStep";
import { ConsentStep } from "./ConsentStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { QuestionInput } from "./QuestionInput";
import { RichText } from "./RichText";

interface PreAuditError {
  title: string;
  message: string;
}

function errorMessageOf(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/**
 * Reusable, data-driven Public Pre-Audit engine.
 *
 * Phases: loading -> question -> email -> review -> submitting -> confirmation
 * Back navigation and answer edits recompute the active branch path and drop
 * any answers that are no longer reachable ("stale" branch answers).
 */
export function QuestionEngine(options: PreAuditEngineOptions) {
  const router = useRouter();
  const exitHref = options.exitHref ?? "/audit/pre-audit";
  const title = options.title ?? "Business Pre-Audit";
  const settings = {
    collectEmail: true,
    requireEmail: true,
    allowEditing: true,
    showProgressBar: true,
    showConfirmation: true,
    confirmationMessage: "",
    ...(options.settings ?? {}),
  } as TriageFormSettings;

  const [phase, setPhase] = useState<PreAuditPhase>("loading");
  const [visited, setVisited] = useState<PreAuditVisitedEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<TriagePublicQuestion | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [consentGranted, setConsentGranted] = useState(false);
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [typedValue, setTypedValue] = useState<unknown>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<PreAuditError | null>(null);
  const [submission, setSubmission] = useState<PreAuditSubmission | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pendingBranches, setPendingBranches] = useState<PreAuditPendingBranch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<PreAuditPendingBranch | null>(null);

  const questionType: PreAuditQuestionType = resolveQuestionType(currentQuestion);

  /**
   * Resolves the email that will be recorded with the submission, honouring the
   * form's "collect email" / "email required" settings. Returns the accepted
   * value ("" when email is not collected) or a validation failure.
   */
  const emailSubmissionValue = useCallback((): { ok: boolean; value: string; message?: string } => {
    if (!settings.collectEmail) return { ok: true, value: "" };
    const trimmed = email.trim();
    if (!settings.requireEmail && trimmed === "") return { ok: true, value: "" };
    const result = validateEmail(email);
    return result.ok ? { ok: true, value: result.value } : { ok: false, value: "", message: result.message };
  }, [settings.collectEmail, settings.requireEmail, email]);

  const startFresh = useCallback(async () => {
    setVisited([]);
    setEmail("");
    setEmailError(null);
    setConsentGranted(false);
    setMultiSelection([]);
    setTypedValue(null);
    setAnswerError(null);
    setSubmission(null);
    setIsDuplicate(false);
    setError(null);
    setIsBusy(false);
    setPendingBranches([]);
    setCurrentBranch(null);
    setPhase("loading");
    try {
      const start = await ensureStartQuestion(options.startOverride);
      setCurrentQuestion(start);
      setPhase("question");
    } catch (err) {
      setError({
        title: "We couldn't start the pre-audit",
        message: errorMessageOf(
          err,
          "Something went wrong while loading your first question. Please try again."
        ),
      });
      setPhase("error");
    }
  }, [options.startOverride]);

  // ==================== INITIALISATION / HYDRATION ====================

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const saved = loadProgress();
      if (
        saved &&
        saved.visited.length > 0 &&
        (saved.phase === "question" || saved.phase === "email" || saved.phase === "review")
      ) {
        const healed = recomputeActiveVisited(saved.visited, {});
        if (cancelled) return;
        if (healed.length === 0) {
          await startFresh();
        } else {
          setVisited(healed);
          setPendingBranches(saved.pendingBranches ?? []);
          setCurrentBranch(saved.currentBranch ?? null);
          setEmail(saved.email ?? "");
          if (saved.currentQuestion) {
            setCurrentQuestion(saved.currentQuestion);
            hydrateCache([saved.currentQuestion]);
          }
          if (saved.phase === "question" && saved.currentQuestion) {
            setPhase("question");
          } else if (saved.phase === "email") {
            setPhase("email");
          } else {
            setPhase("review");
          }
        }
      } else {
        await startFresh();
      }
      if (!cancelled) setHydrated(true);
    };

    void initialize();
    return () => {
      cancelled = true;
    };
  }, [startFresh]);

  // ==================== PERSISTENCE ====================

  useEffect(() => {
    if (!hydrated) return;
    if (phase === "question" || phase === "email" || phase === "review") {
      saveProgress({
        version: PRE_AUDIT_VERSION,
        visited,
        email,
        currentQuestion,
        phase,
        updatedAt: new Date().toISOString(),
        pendingBranches,
        currentBranch,
      });
    }
  }, [hydrated, phase, visited, email, currentQuestion, pendingBranches, currentBranch]);

  // ==================== QUESTION FLOW (MULTI-BRANCH DFS) ====================

  /**
   * Called whenever the active line reaches a terminal destination or rejoins
   * an already-answered question. Any remaining pending branch is walked next
   * (one branch fully processed before the next); when nothing is left the
   * flow is complete and moves to review.
   */
  const continueFromPending = useCallback(
    async (nextVisited: PreAuditVisitedEntry[], pending: PreAuditPendingBranch[]) => {
      const resolved = resolvePendingBranch(
        pending,
        new Set(nextVisited.map((entry) => entry.questionId))
      );
      if (!resolved) {
        setVisited(nextVisited);
        setPendingBranches([]);
        setCurrentBranch(null);
        setConsentGranted(false);
        setPhase("review");
        return;
      }
      setPendingBranches(resolved.rest);
      setCurrentBranch(resolved.branch);
      setIsBusy(true);
      try {
        const next = resolved.branch.nextQuestionId as string;
        const question = await ensureQuestion(next);
        setVisited(nextVisited);
        setCurrentQuestion(question);
        setPhase("question");
      } catch (err) {
        setError({
          title: "We couldn't load the next question",
          message: errorMessageOf(err, "Please check your connection and try again."),
        });
        setPhase("error");
      } finally {
        setIsBusy(false);
      }
    },
    []
  );

  const applyEntry = useCallback(
    async (
      entry: PreAuditVisitedEntry | null,
      newBranches: PreAuditPendingBranch[] = []
    ) => {
      if (!entry) return;

      const pendingAfter = stackBranches(pendingBranches, newBranches);
      const entryToAdd = currentBranch ? { ...entry, branchStart: true } : entry;
      const nextVisited = [...visited, entryToAdd];
      const visitedIds = new Set(nextVisited.map((item) => item.questionId));

      setMultiSelection([]);
      setTypedValue(null);
      setAnswerError(null);
      setCurrentBranch(null);

      if (nextVisited.length > PRE_AUDIT_MAX_STEPS) {
        setError({
          title: "Too many steps",
          message:
            "This pre-audit has more steps than expected and may not be configured correctly. Please contact support.",
        });
        setPhase("error");
        return;
      }

      const nextQuestionId = entryToAdd.nextQuestionId;

      // Terminal destination reached on this line.
      if (!nextQuestionId && (entryToAdd.destinationType || entryToAdd.auditType)) {
        setIsBusy(true);
        try {
          await continueFromPending(nextVisited, pendingAfter);
        } finally {
          setIsBusy(false);
        }
        return;
      }

      if (!nextQuestionId) {
        setError({
          title: "We hit a dead end",
          message: "This answer has no next step configured yet. Please contact support.",
        });
        setPhase("error");
        return;
      }

      // The linear line rejoins a question already answered (a shared subtree).
      // That branch is already accounted for; continue with any pending branch,
      // otherwise the traversal is complete.
      if (visitedIds.has(nextQuestionId)) {
        setIsBusy(true);
        try {
          await continueFromPending(nextVisited, pendingAfter);
        } finally {
          setIsBusy(false);
        }
        return;
      }

      setIsBusy(true);
      try {
        const next = await ensureQuestion(nextQuestionId);
        setVisited(nextVisited);
        setPendingBranches(pendingAfter);
        setCurrentQuestion(next);
        setPhase("question");
      } catch (err) {
        setError({
          title: "We couldn't load the next question",
          message: errorMessageOf(err, "Please check your connection and try again."),
        });
        setPhase("error");
      } finally {
        setIsBusy(false);
      }
    },
    [visited, pendingBranches, currentBranch, continueFromPending]
  );

  const answer = useCallback(
    async (answerIds: string[]) => {
      if (!currentQuestion || isBusy) return;
      const { entry, branches } = makeChoiceAnswer(currentQuestion, answerIds);
      await applyEntry(entry, branches);
    },
    [currentQuestion, isBusy, applyEntry]
  );

  /**
   * Multi-select continues. Options that route to different destinations are no
   * longer a conflict: the lowest-sortOrder route is walked first and every
   * other route is queued as a pending branch, walked one at a time in
   * canonical order (mirrored by the server replay).
   */
  const answerMulti = useCallback(async () => {
    if (!currentQuestion || isBusy || multiSelection.length === 0) return;
    await answer(multiSelection);
  }, [currentQuestion, isBusy, multiSelection, answer]);

  /** Option-less questions submit a typed value that is validated before moving on. */
  const answerTyped = useCallback(async () => {
    if (!currentQuestion || isBusy) return;
    const result = validateAnswer(currentQuestion, typedValue);
    if (!result.ok) {
      setAnswerError(result.message);
      return;
    }
    setAnswerError(null);
    const entry = makeTypedVisitedEntry(currentQuestion, typedValue);
    await applyEntry(entry);
  }, [currentQuestion, isBusy, typedValue, applyEntry]);

  const toggleMultiSelection = (answerId: string) => {
    setMultiSelection((prev) =>
      prev.includes(answerId) ? prev.filter((id) => id !== answerId) : [...prev, answerId]
    );
  };

  // ==================== BACK / EDIT (BRANCH RECALCULATION) ====================

  const goBack = useCallback(async () => {
    if (isBusy) return;

    // Standing on the first (unanswered) question of a branch: stepping back
    // re-queues that branch so it is offered again after finishing the
    // previous line.
    if (currentBranch) {
      setPendingBranches((prev) => stackBranches(prev, [currentBranch]));
      setCurrentBranch(null);
    }

    if (visited.length === 0) {
      router.push(exitHref);
      return;
    }

    const previousVisited = visited.slice(0, -1);
    setVisited(previousVisited);
    const previousEntry = previousVisited[previousVisited.length - 1];
    setMultiSelection(previousEntry?.answerIds ?? []);
    setTypedValue(previousEntry?.value ?? null);
    setAnswerError(null);
    setIsBusy(true);
    try {
      let previousQuestion: TriagePublicQuestion;
      if (previousVisited.length === 0) {
        previousQuestion = await ensureStartQuestion(options.startOverride);
      } else {
        const questionId = previousVisited[previousVisited.length - 1].questionId;
        previousQuestion = await ensureQuestion(questionId);
      }
      setCurrentQuestion(previousQuestion);
      setPhase("question");
    } catch (err) {
      setError({
        title: "We couldn't return to the previous question",
        message: errorMessageOf(err, "Please check your connection and try again."),
      });
      setPhase("error");
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, visited, currentBranch, exitHref, router, options.startOverride]);

  /**
   * Jumps to a previously answered question (from "Edit" on the review step or
   * "Change an answer" on the email step). Every answer from that question
   * onward is dropped; the forward path is then recalculated from the new
   * selection.
   */
  const editQuestion = useCallback(
    async (index: number) => {
      if (isBusy) return;
      const entry = visited[index];
      if (!entry) return;

      const retained = recomputeActiveVisited(visited.slice(0, index), {});
      setVisited(retained);
      setPendingBranches([]);
      setCurrentBranch(null);
      setMultiSelection(entry.answerIds ?? []);
      setTypedValue(entry.value ?? null);
      setAnswerError(null);
      setEmailError(null);
      setIsBusy(true);
      try {
        const question = getCachedQuestion(entry.questionId) ?? (await ensureQuestion(entry.questionId));
        setCurrentQuestion(question);
        setPhase("question");
      } catch (err) {
        setError({
          title: "We couldn't open that question",
          message: errorMessageOf(err, "Please check your connection and try again."),
        });
        setPhase("error");
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, visited]
  );

  /**
   * Lets the visitor finish early: any remaining (unwalked) branches are
   * dropped. If the current line has already reached a terminal destination
   * the flow moves straight to review; otherwise the current question is
   * completed first and review follows naturally.
   */
  const skipBranches = useCallback(() => {
    setPendingBranches([]);
    setCurrentBranch(null);
    const last = visited[visited.length - 1];
    if (last && isTerminal(last)) {
      setConsentGranted(false);
      setPhase("review");
    }
  }, [visited]);

  // ==================== EMAIL & REVIEW ====================

  /** Review continues to the email step when the form collects email, else straight to consent. */
  const continueFromReview = useCallback(() => {
    setEmailError(null);
    setConsentGranted(false);
    if (!settings.collectEmail) {
      setPhase("consent");
      return;
    }
    setPhase("email");
  }, [settings.collectEmail]);

  const continueFromEmail = useCallback(() => {
    setEmailError(null);
    setConsentGranted(false);
    const result = emailSubmissionValue();
    if (!result.ok) {
      setEmailError(result.message ?? null);
      return;
    }
    setPhase("consent");
  }, [emailSubmissionValue]);

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    if (isBusy) return;

    if (!consentGranted) {
      setPhase("consent");
      return;
    }

    const emailResult = emailSubmissionValue();
    if (!emailResult.ok) {
      setEmailError(emailResult.message ?? null);
      setPhase("email");
      return;
    }

    const fingerprint = fingerprintOf(emailResult.value, visited);
    const existing = findDuplicateSubmission(fingerprint);
    if (existing) {
      clearProgress();
      if (settings.showConfirmation) {
        setSubmission(existing);
        setIsDuplicate(true);
        setPhase("confirmation");
      } else {
        router.push(options.afterSubmitHref ?? exitHref);
      }
      return;
    }

    setIsBusy(true);
    setPhase("submitting");

    // Brief transition so the saving state is visible rather than a flash.
    await new Promise((resolve) => setTimeout(resolve, 650));

    // Re-evaluate server-side. Only genuine validation rejections (4xx) block:
    // an unreachable API still lets the audit complete on the device.
    let serverSessionId: string | undefined;
    let serverDestinationType: PreAuditSubmission["destinationType"] | null = null;
    let serverDestinationTarget: PreAuditSubmission["destinationTarget"] | null = null;
    let serverConsentGrantedAt: string | null | undefined;
    try {
      const server = await submitPreAudit(emailResult.value, visited);
      serverSessionId = server.id;
      serverDestinationType = (server.destinationType as PreAuditSubmission["destinationType"]) ?? null;
      serverDestinationTarget = server.destinationTarget ?? null;
      serverConsentGrantedAt = server.consentGrantedAt ?? null;
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status !== undefined && status >= 400 && status < 500) {
        setIsBusy(false);
        setError({
          title: "We couldn't verify your pre-audit",
          message: errorMessageOf(
            err,
            "The pre-audit couldn't be verified. Please try again."
          ),
        });
        setPhase("error");
        return;
      }
    }

    const serverReached = serverConsentGrantedAt !== undefined;
    const newSubmission = buildSubmission({
      email: emailResult.value,
      visited,
      existingId: createRecordId(),
      destinationType: serverReached && serverDestinationType ? serverDestinationType : undefined,
      destinationTarget:
        serverReached && serverDestinationType && serverDestinationTarget
          ? serverDestinationTarget
          : undefined,
      serverAuthoritative: serverReached,
      consentGrantedAt: serverReached ? serverConsentGrantedAt ?? null : undefined,
    });
    if (serverSessionId) newSubmission.serverSessionId = serverSessionId;

    const saved = saveSubmission(newSubmission);
    if (!saved) {
      setIsBusy(false);
      setError({
        title: "We couldn't save your pre-audit",
        message:
          "Your answers couldn't be saved on this device. Please check your browser settings and try again.",
      });
      setPhase("error");
      return;
    }

    clearProgress();
    if (settings.showConfirmation) {
      setSubmission(newSubmission);
      setIsDuplicate(false);
      setPhase("confirmation");
    } else {
      router.push(options.afterSubmitHref ?? exitHref);
    }
  };

  // ==================== SCREENS ====================

  if (phase === "loading" || (phase === "question" && !currentQuestion)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="text-orange-500 animate-spin" aria-label="Loading" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Loading Your Pre-Audit
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed" aria-live="polite">
            Please wait while we prepare your first question.
          </p>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-orange-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4" role="alert">
            {error?.title ?? "Something went wrong"}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            {error?.message ??
              "Something went wrong while running the pre-audit. Please try again."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => void startFresh()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
            >
              <ArrowRight size={16} />
              Try Again
            </button>
            <Link
              href={exitHref}
              className="flex-1 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              Back to Pre-Audit
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4 sm:p-6 pt-24 sm:pt-28 pb-12">
        <main className="max-w-3xl mx-auto">
          <EmailStep
            email={email}
            error={emailError}
            disabled={isBusy}
            optional={!settings.requireEmail}
            onEmailChange={(value) => {
              setEmail(value);
              if (emailError) setEmailError(null);
            }}
            onContinue={continueFromEmail}
            onBack={() => {
              setEmailError(null);
              setPhase("review");
            }}
          />
        </main>
      </div>
    );
  }

  if (phase === "consent") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4 sm:p-6 pt-24 sm:pt-28 pb-12">
        <main className="max-w-3xl mx-auto">
          <ConsentStep
            consentGranted={consentGranted}
            disabled={isBusy}
            onConsentChange={setConsentGranted}
            onBack={() => {
              setConsentGranted(false);
              setPhase("email");
            }}
            onSubmit={() => void handleSubmit()}
          />
        </main>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4 sm:p-6 pt-24 sm:pt-28 pb-12">
        <main className="max-w-3xl mx-auto">
          <ReviewStep
            visited={visited}
            disabled={isBusy}
            allowEdit={settings.allowEditing}
            nextLabel={settings.collectEmail ? "Continue to email" : "Continue to consent"}
            onEditQuestion={(index) => void editQuestion(index)}
            onContinue={continueFromReview}
            onBack={() => {
              if (visited.length >= 1) void editQuestion(visited.length - 1);
            }}
          />
        </main>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="text-orange-500 animate-spin" aria-label="Submitting" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Saving Your Pre-Audit</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed" aria-live="polite">
            Please wait while we save your answers.
          </p>
        </motion.div>
      </div>
    );
  }

  if (phase === "confirmation" && submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <ConfirmationStep
            submission={submission}
            isDuplicate={isDuplicate}
            afterSubmitHref={options.afterSubmitHref}
            customMessage={settings.confirmationMessage || null}
          />
        </motion.div>
      </div>
    );
  }

  // ==================== QUESTION SCREEN ====================
  if (!currentQuestion) {
    return null;
  }

  const answeredCount = visited.length;
  const prevEntry = answeredCount > 0 ? visited[answeredCount - 1] : null;
  const showExit = (answeredCount === 0 || isTerminal(prevEntry)) && !currentBranch;
  const isChoice = isChoiceType(questionType);
  const isMulti = isMultiSelectType(questionType);
  const inBranch = currentBranch !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pt-28 sm:pt-32">
        {settings.showProgressBar && <ProgressHeader answeredCount={answeredCount} title={title} />}

        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 relative z-10 overflow-hidden">
          <div className="p-6 sm:p-10 lg:p-14">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4" role="group" aria-label="Question type">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                  <GitBranch size={16} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {title}
                </span>
              </div>

              {inBranch && currentBranch && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-0.5">
                      Exploring a related topic
                    </div>
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {currentBranch.optionTexts.join(", ")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={skipBranches}
                    disabled={isBusy}
                    className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                  >
                    Skip remaining
                  </button>
                </div>
              )}

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 leading-tight">
                <RichText text={currentQuestion.text} html={currentQuestion.config?.contentHtml} />
              </h2>

              {currentQuestion.description && (
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 -mt-2">
                  {currentQuestion.description}
                </p>
              )}

              {currentQuestion.hint && (
                <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 font-medium mb-6 sm:mb-8 -mt-2">
                  <Info size={14} />
                  {currentQuestion.hint}
                </p>
              )}

              {!isChoice ? (
                <div className="space-y-4" role="group" aria-label="Question input">
                  <QuestionInput
                    question={currentQuestion}
                    value={typedValue}
                    disabled={isBusy}
                    error={answerError}
                    onChange={(value) => {
                      setTypedValue(value);
                      if (answerError) setAnswerError(null);
                    }}
                  />
                  {answerError && (
                    <p role="alert" className="text-sm text-red-600 font-medium">
                      {answerError}
                    </p>
                  )}
                </div>
              ) : isMulti ? (
                <div className="grid gap-3 sm:gap-4" role="group" aria-label="Select all that apply">
                  {currentQuestion.answers.map((option) => (
                    <AnswerOption
                      key={option.id}
                      answerId={option.id}
                      answerText={option.text}
                      multi
                      selected={multiSelection.includes(option.id)}
                      disabled={isBusy}
                      onSelect={toggleMultiSelection}
                    />
                  ))}
                  {answerError && (
                    <p role="alert" className="text-sm text-red-600 font-medium">
                      {answerError}
                    </p>
                  )}
                </div>
              ) : currentQuestion.answers.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm text-slate-500 font-medium">
                    No answer options are available for this question yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4" role="group" aria-label="Choose an answer">
                  {currentQuestion.answers.map((option) => (
                    <AnswerOption
                      key={option.id}
                      answerId={option.id}
                      answerText={option.text}
                      selected={false}
                      disabled={isBusy}
                      onSelect={(answerId) => void answer([answerId])}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="px-6 sm:px-10 py-5 sm:py-6 border-t border-slate-50 flex justify-between items-center">
            <button
              type="button"
              onClick={() => void goBack()}
              disabled={isBusy}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <ChevronLeft size={14} />
              {showExit ? "Exit" : "Back"}
            </button>

            {(isMulti || !isChoice) && (
              <button
                type="button"
                onClick={() => void (isMulti ? answerMulti() : answerTyped())}
                disabled={isBusy || (isMulti && multiSelection.length === 0)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}