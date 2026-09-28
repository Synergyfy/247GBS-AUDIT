"use client";

import React, { useMemo } from "react";
import { motion, Reorder } from "framer-motion";
import { ChevronDown, ChevronUp, ListPlus, Plus } from "lucide-react";
import type { AdminTriageQuestion } from "@/services/triage/types";
import { QuestionCard, type QuestionCardHandlers } from "./QuestionCard";
import { EmptyState, SelectField } from "./ui";

export function QuestionsTab({
  questions,
  handlers,
  onAddQuestion,
  onReorder,
  collapsedIds,
  onToggleCollapse,
  onExpandAll,
  onCollapseAll,
  onJump,
}: {
  questions: AdminTriageQuestion[];
  handlers: QuestionCardHandlers;
  onAddQuestion: () => void;
  onReorder: (list: AdminTriageQuestion[]) => void;
  collapsedIds: Set<string>;
  onToggleCollapse: (qid: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onJump: (qid: string) => void;
}) {
  const canDelete = questions.length > 1;

  const jumpOptions = useMemo(
    () =>
      questions.map((q, index) => ({
        value: q.id,
        label: `Question ${index + 1} — ${q.text?.trim() || "Untitled question"}`,
      })),
    [questions]
  );

  if (questions.length === 0) {
    return (
      <EmptyState
        title="No questions yet"
        description="Add your first Business Triage question to start building the flow. Question order is used as the entry point."
        action={
          <button
            type="button"
            onClick={onAddQuestion}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 text-sm font-bold shadow-xl shadow-orange-500/30 transition-all"
          >
            <ListPlus size={16} /> Add first question
          </button>
        }
      />
    );
  }

  return (
    <div>
      {/* List navigation: count, jump-to-question, expand/collapse all */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {questions.length} question{questions.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-60">
            <SelectField
              value=""
              placeholder="Jump to question…"
              options={jumpOptions}
              onChange={onJump}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onExpandAll}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-orange-600 transition-colors"
            >
              <ChevronUp size={13} /> Expand all
            </button>
            <button
              type="button"
              onClick={onCollapseAll}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-orange-600 transition-colors"
            >
              <ChevronDown size={13} /> Collapse all
            </button>
          </div>
        </div>
      </div>

      <Reorder.Group
        axis="y"
        values={questions}
        onReorder={onReorder}
        className="space-y-4"
      >
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            allQuestions={questions}
            position={index + 1}
            isFirst={index === 0}
            isLast={index === questions.length - 1}
            canDelete={canDelete}
            handlers={handlers}
            collapsed={collapsedIds.has(question.id)}
            onToggleCollapse={() => onToggleCollapse(question.id)}
            anchorId={`triage-q-${question.id}`}
          />
        ))}
      </Reorder.Group>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={onAddQuestion}
        className="mt-4 w-full rounded-3xl border-2 border-dashed border-slate-300 py-5 text-sm font-bold text-slate-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-colors"
      >
        <span className="inline-flex items-center gap-2">
          <Plus size={16} /> Add question
        </span>
      </motion.button>
    </div>
  );
}
