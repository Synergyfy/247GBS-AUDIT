"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, ChevronLeft, GitBranch, Info, Loader2 } from "lucide-react";
import type { TriagePublicQuestion } from "@/services/triage/types";
import { isChoiceType, isMultiSelectType } from "@/services/triage/types";
import {
  ensureQuestion,
  ensureStartQuestion,
  getCachedQuestion,
  hydrateCache,
} from "@/services/preAudit/data";
import type {
  PreAuditEngineOptions,
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
  makeTypedVisitedEntry,
  makeVisitedEntry,
  recomputeActiveVisited,
  resolveQuestionType,
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
import { ConfirmationStep } from "./ConfirmationStep";
import { QuestionInput } from "./QuestionInput";

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

  const [phase, setPhase] = useState<PreAuditPhase>("loading");
  const [visited, setVisited] = useState<PreAuditVisitedEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<TriagePublicQuestion | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [typedValue, setTypedValue] = useState<unknown>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<PreAuditError | null>(null);
  const [submission, setSubmission] = useState<PreAuditSubmission | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const questionType: PreAuditQuestionType = resolveQuestionType(currentQuestion);

  const startFresh = useCallback(async () => {
    setVisited([]);
    setEmail("");
    setEmailError(null);
    setMultiSelection([]);
    setTypedValue(null);
    setAnswerError(null);
    setSubmission(null);
    setIsDuplicate(false);
    setError(null);
    setIsBusy(false);
    setPhase("loading");
    try {
      const start = await ensureStartQuestion();
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
  }, []);

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
      });
    }
  }, [hydrated, phase, visited, email, currentQuestion]);

  // ==================== QUESTION FLOW ====================

  const applyEntry = useCallback(
    async (entry: PreAuditVisitedEntry) => {
      const nextVisited = [...visited, entry];
      setMultiSelection([]);
      setTypedValue(null);
      setAnswerError(null);

      if (entry.auditType) {
        setVisited(nextVisited);
        setPhase("email");
        return;
      }

      if (!entry.nextQuestionId) {
        setError({
          title: "We hit a dead end",
          message: "This answer has no next step configured yet. Please contact support.",
        });
        setPhase("error");
        return;
      }

      if (nextVisited.some((entryItem) => entryItem.questionId === entry.nextQuestionId)) {
        setError({
          title: "Something isn't right",
          message:
            "This pre-audit appears to loop back to a question you've already answered. It may not be configured correctly.",
        });
        setPhase("error");
        return;
      }

      if (nextVisited.length >= PRE_AUDIT_MAX_STEPS) {
        setError({
          title: "Too many steps",
          message:
            "This pre-audit has more steps than expected and may not be configured correctly. Please contact support.",
        });
        setPhase("error");
        return;
      }

      setIsBusy(true);
      try {
        const next = await ensureQuestion(entry.nextQuestionId);
        setVisited(nextVisited);
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
    [visited]
  );

  const answer = useCallback(
    async (answerIds: string[]) => {
      if (!currentQuestion || isBusy) return;
      const entry = makeVisitedEntry(currentQuestion, answerIds);
      if (!entry) return;
      await applyEntry(entry);
    },
    [currentQuestion, isBusy, applyEntry]
  );

  /**
   * Multi-select continues: all chosen options must agree on a destination
   * (deterministic rule shared with the server). Conflicting options are
   * flagged inline instead of being silently routed.
   */
  const answerMulti = useCallback(async () => {
    if (!currentQuestion || isBusy || multiSelection.length === 0) return;
    const chosen = currentQuestion.answers.filter((a) => multiSelection.includes(a.id));
    const destinations = new Set(
      chosen.map((a) => `${a.nextQuestionId ?? ""}|${a.auditType ?? ""}`)
    );
    if (destinations.size > 1) {
      setAnswerError(
        "These selections can't be combined because they lead to different next steps. Please choose again."
      );
      return;
    }
    setAnswerError(null);
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
    await applyEntry(makeTypedVisitedEntry(currentQuestion, typedValue));
  }, [currentQuestion, isBusy, typedValue, applyEntry]);

  const toggleMultiSelection = (answerId: string) => {
    setMultiSelection((prev) =>
      prev.includes(answerId) ? prev.filter((id) => id !== answerId) : [...prev, answerId]
    );
  };

  // ==================== BACK / EDIT (BRANCH RECALCULATION) ====================

  const goBack = useCallback(async () => {
    if (isBusy) return;

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
        previousQuestion = await ensureStartQuestion();
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
  }, [isBusy, visited, exitHref, router]);

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

  // ==================== EMAIL & REVIEW ====================

  const handleEmailContinue = () => {
    const result = validateEmail(email);
    if (result.ok) {
      setEmailError(null);
      setPhase("review");
    } else {
      setEmailError(result.message);
    }
  };

  const handleEmailBack = () => {
    if (visited.length >= 1) {
      void editQuestion(visited.length - 1);
    }
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    if (isBusy) return;

    const result = validateEmail(email);
    if (!result.ok) {
      setEmailError(result.message);
      setPhase("email");
      return;
    }

    const fingerprint = fingerprintOf(result.value, visited);
    const existing = findDuplicateSubmission(fingerprint);
    if (existing) {
      clearProgress();
      setSubmission(existing);
      setIsDuplicate(true);
      setPhase("confirmation");
      return;
    }

    setIsBusy(true);
    setPhase("submitting");

    // Brief transition so the saving state is visible rather than a flash.
    await new Promise((resolve) => setTimeout(resolve, 650));

    // Re-evaluate server-side. Only genuine validation rejections (4xx) block:
    // an unreachable API still lets the audit complete on the device.
    let serverSessionId: string | undefined;
    try {
      const server = await submitPreAudit(result.value, visited);
      serverSessionId = server.id;
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

    const newSubmission = buildSubmission({
      email: result.value,
      visited,
      existingId: createRecordId(),
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
    setSubmission(newSubmission);
    setIsDuplicate(false);
    setPhase("confirmation");
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
            onEmailChange={(value) => {
              setEmail(value);
              if (emailError) setEmailError(null);
            }}
            onContinue={handleEmailContinue}
            onBack={handleEmailBack}
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
            email={email}
            disabled={isBusy}
            onEditQuestion={(index) => void editQuestion(index)}
            onSubmit={() => void handleSubmit()}
            onBackToEmail={() => {
              setEmailError(null);
              setPhase("email");
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
  const showExit = answeredCount === 0 || isTerminal(prevEntry);
  const isChoice = isChoiceType(questionType);
  const isMulti = isMultiSelectType(questionType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pt-28 sm:pt-32">
        <ProgressHeader answeredCount={answeredCount} />

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
                  Business Pre-Audit
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 leading-tight">
                {currentQuestion.text}
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