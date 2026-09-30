"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TriageGallery } from "@/components/triage/builder/TriageGallery";
import { TriageBuilderWithPreview } from "@/components/triage/builder/TriageBuilderWithPreview";

export default function AdminTriagePage() {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"questions" | "responses" | "settings">("questions");

  // Support ?form=<id>&tab=<tab> deep links + browser back/forward.
  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedFormId(params.get("form"));
      const tabParam = params.get("tab");
      if (tabParam === "responses" || tabParam === "settings" || tabParam === "questions") {
        setSelectedTab(tabParam);
      }
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const handleSelectForm = useCallback(
    (formId: string, initialTab: "questions" | "responses" | "settings" = "questions") => {
      setSelectedFormId(formId);
      setSelectedTab(initialTab);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("form", formId);
        if (initialTab !== "questions") {
          url.searchParams.set("tab", initialTab);
        } else {
          url.searchParams.delete("tab");
        }
        window.history.pushState({}, "", url.toString());
      } catch {
        /* ignore */
      }
    },
    []
  );

  const handleBack = useCallback(() => {
    setSelectedFormId(null);
    setSelectedTab("questions");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("form");
      url.searchParams.delete("tab");
      window.history.pushState({}, "", url.toString());
    } catch {
      /* ignore */
    }
  }, []);

  if (selectedFormId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex h-full min-h-0 w-full flex-col gap-5"
      >
        <TriageBuilderWithPreview formId={selectedFormId} initialTab={selectedTab} onBack={handleBack} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full min-h-0 w-full flex-col gap-5"
    >
      <TriageGallery onSelectForm={handleSelectForm} />
    </motion.div>
  );
}
