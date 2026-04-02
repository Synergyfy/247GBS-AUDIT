"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
import type { AuditListResponse, SavedAudit, VaultStats } from "./types";

export function useAudits() {
  const [audits, setAudits] = useState<SavedAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudits = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch(`${API_BASE_URL}/audit`, { method: "GET", headers, signal });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE_URL}/audit`, { method: "GET", headers, signal });
        }
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Unexpected response: ${text.substring(0, 200)}`);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Request failed ${res.status}`);
      }

      const json = (await res.json()) as AuditListResponse;

      // Map backend shape to UI shape expected by vault page
      const mapped: SavedAudit[] = json.map((it) => ({
        id: it.id,
        date: it.createdAt,
        type: it.auditType,
        sector: it.sectorId,
        metrics: {
          capacityDrain: it.calculatedMetrics.capacityDrainPct,
          annualRecovery: it.calculatedMetrics.annualRecovery,
        },
        status: it.status,
      }));

      setAudits(mapped);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load audits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchAudits(ac.signal);
    return () => ac.abort();
  }, [fetchAudits]);

  return { audits, loading, error, refresh: fetchAudits } as const;
}

export function useVaultStats() {
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch(`${API_BASE_URL}/audit/stats`, { method: "GET", headers, signal });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE_URL}/audit/stats`, { method: "GET", headers, signal });
        }
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Request failed ${res.status}`);
      }

      const json = (await res.json()) as VaultStats;
      setStats(json);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load vault stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchStats(ac.signal);
    return () => ac.abort();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats } as const;
}

export default useAudits;
