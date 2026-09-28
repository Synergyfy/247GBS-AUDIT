import React from "react";
import { motion } from "framer-motion";

interface ProgressHeaderProps {
  answeredCount: number;
  title?: string;
}

/**
 * Progress is derived from the active path only: the current question number
 * and the number of questions answered so far. No hardcoded "Step X of N"
 * totals are shown because the branch total is not known until completion.
 */
export function ProgressHeader({ answeredCount, title = "Business Pre-Audit" }: ProgressHeaderProps) {
  const segments = Array.from({ length: answeredCount + 1 });

  return (
    <div className="mb-6 sm:mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h2>
        <span className="text-[10px] sm:text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
          Question {answeredCount + 1}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {segments.map((_, index) => (
          <motion.div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < answeredCount ? "bg-orange-500" : "bg-orange-200"
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
          />
        ))}
      </div>

      <div className="mt-2 text-[10px] sm:text-xs text-slate-500">
        {answeredCount} answered {answeredCount === 1 ? "question" : "questions"} so far
      </div>
    </div>
  );
}