"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const SIZES = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-5xl",
} as const;

/**
 * Shared modal overlay used by the builder's Preview and Publish dialogs.
 * Closes on backdrop click or Escape, locks body scroll, and follows the
 * light rounded-card style already used across the admin screens.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "lg",
  headerExtra,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: keyof typeof SIZES;
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative flex max-h-[90vh] w-full ${SIZES[size]} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl`}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{subtitle}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {headerExtra}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}