import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

interface AnswerOptionProps {
  answerId: string;
  answerText: string;
  multi?: boolean;
  selected: boolean;
  disabled: boolean;
  onSelect: (answerId: string) => void;
}

export function AnswerOption({ answerId, answerText, multi = false, selected, disabled, onSelect }: AnswerOptionProps) {

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onSelect(answerId)}
      className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden disabled:opacity-60 ${
        selected
          ? "bg-orange-50 border-orange-400 shadow-lg shadow-orange-100"
          : "bg-white border-slate-100 hover:border-orange-300 hover:shadow-lg hover:shadow-slate-200/50"
      }`}
    >
      <div
        className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
          selected
            ? "bg-orange-500 text-white"
            : "bg-slate-50 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500"
        }`}
      >
        {multi ? <Check size={18} /> : <ArrowRight size={18} />}
      </div>
      <div className="relative z-10">
        <div
          className={`font-bold text-base sm:text-lg leading-tight transition-colors duration-300 ${
            selected ? "text-orange-700" : "text-slate-900 group-hover:text-orange-600"
          }`}
        >
          {answerText}
        </div>
      </div>
    </motion.button>
  );
}