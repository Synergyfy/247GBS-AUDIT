"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppWindow } from "lucide-react";
import { TriageBuilder } from "@/components/triage/builder/TriageBuilder";

export default function AdminTriagePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full min-h-0 w-full flex-col gap-5"
    >
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
          <AppWindow size={18} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Business Triage Builder</h1>
          <p className="hidden text-xs text-slate-400 font-medium sm:block">
            Build the flow, review responses and publish the public form.
          </p>
        </div>
      </div>
      <TriageBuilder />
    </motion.div>
  );
}