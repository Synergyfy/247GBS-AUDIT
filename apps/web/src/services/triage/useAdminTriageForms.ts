"use client";

import { useCallback, useEffect, useState } from "react";
import { formApi } from "./hooks";
import type { TriageForm } from "./types";

export function useAdminTriageForms() {
  const [forms, setForms] = useState<TriageForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await formApi.listForms();
      setForms(list ?? []);
    } catch (err) {
      // Fall back to the single-form endpoint (legacy stand-alone installs).
      try {
        const single = await formApi.getForm().catch(() => null);
        if (single) {
          setForms([single]);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load triage flows");
        }
      } catch {
        setError(err instanceof Error ? err.message : "Failed to load triage flows");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { forms, loading, error, refresh: load } as const;
}
